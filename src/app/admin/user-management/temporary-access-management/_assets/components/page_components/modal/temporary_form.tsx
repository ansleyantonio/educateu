/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Dayjs } from "dayjs";
import { DatePicker } from "antd";
import { AssignModule } from "@/app/admin/user-management/_assets/query_controller/assignModule";
import { filterPermissionsData } from "@/app/admin/user-management/_assets/utils/assignModuleAvailableDataFormate";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronDown, Check, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { TempAccessManagementSchema } from "../../../types/temp_access_management";
import dateFormat from "@/utils/DateFormatter";
import ActionButton from "@/components/common/button/actionButton";

const permissionLabels: Record<string, string> = {
  GET: "Read",
  POST: "Edit",
  DELETE: "Delete",
};

interface ModuleListProps {
  token: string | undefined;
  id: string[];
  data: {
    userModules: {
      portalCategorieName: string;
      portalCategorieId: string;
      modules: {
        moduleName: string;
        moduleId: string;
        moduleGroup: string;
        availableModulePermission: string[];
        assignedModulePermissions: string[];
      }[];
    }[];
  };
  isLoading: boolean;
  closeModal?: () => void;
}

export function TemporaryAccessForm({
  token,
  id,
  data,
  isLoading,
  closeModal,
}: ModuleListProps) {
  const queryClient = useQueryClient();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [infoToastMsg, setInfoToastMsg] = useState("");

  const form = useForm<z.infer<typeof TempAccessManagementSchema>>({
    resolver: zodResolver(TempAccessManagementSchema),
    defaultValues: {
      categories: [],
      manualRevocation: false,
      startDate: undefined,
      endDate: undefined,
    },
  });

  const assignMutation = useMutation({
    mutationFn: (data: any) => AssignModule(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fetch-temporary-access"] });
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-users"] });
      toast.success(data.message);
      if (closeModal) closeModal();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const manualRevocation = form.watch("manualRevocation");

  const groupModulesByGroup = (modules: any[]) => {
    return modules.reduce((acc, module) => {
      const group = module.moduleGroup || "other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(module);
      return acc;
    }, {} as Record<string, any[]>);
  };

  const shouldExpandGroup = (
    groupModules: any[],
    categoryId: string,
    formCategories: any[]
  ) => {
    const category = formCategories.find((c) => c.categoryId === categoryId);
    if (!category) return false;

    return groupModules.some((module) => {
      const moduleData = category.modules.find((m: any) => m.moduleId === module.moduleId);
      const perms = moduleData?.modulePermission || [];
      return perms.includes("POST") || perms.includes("DELETE");
    });
  };

  useEffect(() => {
    if (data?.userModules) {
      const defaultCategories = data.userModules.map((category) => ({
        categoryId: category.portalCategorieId,
        modules: category.modules.map((module) => ({
          moduleId: module.moduleId,
          modulePermission: [],
        })),
      }));

      form.reset({
        categories: defaultCategories,
        manualRevocation: false,
        startDate: undefined,
        endDate: undefined,
      });

      // Initialize expanded groups
      const initialExpanded: Record<string, boolean> = {};
      data.userModules.forEach((category) => {
        const grouped = groupModulesByGroup(category.modules);
        Object.entries(grouped).forEach(([group]) => {
          initialExpanded[group] = false;
        });
      });
      setExpandedGroups(initialExpanded);
    }
  }, [data, form]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const onSubmit = (values: z.infer<typeof TempAccessManagementSchema>) => {
    const formattedCategories = values.categories.map((category) => ({
      categoryId: category.categoryId,
      modules: category.modules.filter(
        (module) =>
          module.modulePermission && module.modulePermission.length > 0,
      ),
    }));

    const portalCategories = formattedCategories.map((category) => ({
      portalCategoryId: category.categoryId,
      permissionType: "TEMPORARY",
      manualRevocation: manualRevocation,
      permissionStartDate: !manualRevocation
        ? dateFormat.localDateToISOWithZ(values.startDate)
        : null,
      permissionEndDate: !manualRevocation
        ? dateFormat.localDateToISOWithZ(values.endDate)
        : null,
      modules: category.modules,
    }));

    const rawPayload = {
      userId: typeof id === "string" ? [id] : [...id],
      portalCategories: portalCategories,
    };

    const payload = filterPermissionsData(rawPayload);

    const data = {
      body: payload,
      token: token,
    };

    assignMutation.mutate(data);
  };

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
  ) => {
    form.setValue("startDate", dates?.[0]?.toDate?.() ?? undefined);
    form.setValue("endDate", dates?.[1]?.toDate?.() ?? undefined);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 size={55} strokeWidth={2} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data?.userModules || data.userModules.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-gray-500">No modules available for this user.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Info Toast */}
        {infoToastMsg && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="text-sm">{infoToastMsg}</span>
          </div>
        )}

        {data.userModules.map((category) => {
          const grouped = groupModulesByGroup(category.modules);
          const formCategories = form.watch("categories");

          return (
            <div key={category.portalCategorieId} className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 capitalize mb-4">
                {category.portalCategorieName}
              </h2>

              {(Object.entries(grouped) as [string, any[]][]).map(([groupName, groupModules]) => {
                const isExpanded = expandedGroups[groupName];
                const categoryData = formCategories.find(
                  (c) => c.categoryId === category.portalCategorieId
                );

                const hasActivePermissions = groupModules.some((module) => {
                  const moduleData = categoryData?.modules.find(
                    (m: any) => m.moduleId === module.moduleId
                  );
                  const perms = moduleData?.modulePermission || [];
                  return perms.includes("POST") || perms.includes("DELETE");
                });

                return (
                  <div
                    key={groupName}
                    className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {/* Group Header */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupName)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronDown
                          size={20}
                          className={`text-slate-600 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                        <span className="text-base font-semibold text-slate-900 capitalize">
                          {groupName.replace(/-/g, " ")}
                        </span>
                        {hasActivePermissions && (
                          <span className="ml-2 inline-flex items-center gap-1.5 px-1 py-1 bg-blue-50 border border-blue-200 rounded-full">
                            <Check size={14} className="text-blue-600" />
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          hasActivePermissions
                            ? "text-[#34657c]"
                            : "text-black-500"
                        }`}
                      >
                        {groupModules && groupModules?.length}{" "}
                        {groupModules && groupModules.length === 1
                          ? "module"
                          : "modules"}
                      </span>
                    </button>

                    {/* Modules List */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-white p-4 space-y-3">
                        {groupModules.map((module) => {
                          const modulePermissions =
                            form
                              .watch("categories")
                              .find((c) => c.categoryId === category.portalCategorieId)
                              ?.modules.find((m) => m.moduleId === module.moduleId)
                              ?.modulePermission || [];

                          const defaultPermissions = ["GET", "POST", "DELETE"];
                          const areAllPermissionsSelected = defaultPermissions.every(
                            (permission) => modulePermissions.includes(permission)
                          );

                          const hasPostOrDelete =
                            modulePermissions.includes("POST") ||
                            modulePermissions.includes("DELETE");

                          return (
                            <div
                              key={module.moduleId}
                              className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors border border-slate-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    className="data-[state=checked]:bg-[#22556d] data-[state=checked]:border-[#22556d]"
                                    checked={areAllPermissionsSelected}
                                    onCheckedChange={(checked) => {
                                      const updatedCategories = form.getValues("categories");
                                      const categoryIndex = updatedCategories.findIndex(
                                        (c) => c.categoryId === category.portalCategorieId
                                      );

                                      if (checked) {
                                        if (categoryIndex === -1) {
                                          updatedCategories.push({
                                            categoryId: category.portalCategorieId,
                                            modules: [
                                              {
                                                moduleId: module.moduleId,
                                                modulePermission: defaultPermissions,
                                              },
                                            ],
                                          });
                                        } else {
                                          const moduleIndex = updatedCategories[
                                            categoryIndex
                                          ].modules.findIndex((m) => m.moduleId === module.moduleId);

                                          if (moduleIndex === -1) {
                                            updatedCategories[categoryIndex].modules.push({
                                              moduleId: module.moduleId,
                                              modulePermission: defaultPermissions,
                                            });
                                          } else {
                                            updatedCategories[categoryIndex].modules[
                                              moduleIndex
                                            ].modulePermission = defaultPermissions;
                                          }
                                        }
                                      } else {
                                        if (categoryIndex !== -1) {
                                          const moduleIndex = updatedCategories[
                                            categoryIndex
                                          ].modules.findIndex((m) => m.moduleId === module.moduleId);

                                          if (moduleIndex !== -1) {
                                            updatedCategories[categoryIndex].modules.splice(
                                              moduleIndex,
                                              1
                                            );
                                          }
                                        }
                                      }

                                      form.setValue("categories", updatedCategories);
                                    }}
                                  />
                                  <h3 className="text-sm font-semibold text-slate-900 capitalize">
                                    {module.moduleName.replace(/-/g, " ")}
                                  </h3>
                                </div>

                                {/* Permission Buttons */}
                                <div className="flex gap-2">
                                  {defaultPermissions.map((permission) => {
                                    const isPermissionSelected =
                                      modulePermissions.includes(permission);
                                    const disableGetCheckbox =
                                      permission === "GET" && hasPostOrDelete;

                                    return (
                                      <FormField
                                        key={`${module.moduleId}-${permission}`}
                                        control={form.control}
                                        name="categories"
                                        render={() => (
                                          <FormItem>
                                            <FormControl>
                                              <button
                                                type="button"
                                                disabled={disableGetCheckbox}
                                                onClick={() => {
                                                  const updatedCategories = [
                                                    ...form.getValues("categories"),
                                                  ];
                                                  const categoryIndex = updatedCategories.findIndex(
                                                    (c) =>
                                                      c.categoryId ===
                                                      category.portalCategorieId
                                                  );

                                                  if (categoryIndex === -1) {
                                                    updatedCategories.push({
                                                      categoryId: category.portalCategorieId,
                                                      modules: [
                                                        {
                                                          moduleId: module.moduleId,
                                                          modulePermission: [permission],
                                                        },
                                                      ],
                                                    });
                                                  } else {
                                                    const moduleIndex = updatedCategories[
                                                      categoryIndex
                                                    ].modules.findIndex(
                                                      (m) => m.moduleId === module.moduleId
                                                    );

                                                    if (moduleIndex === -1) {
                                                      updatedCategories[categoryIndex].modules.push({
                                                        moduleId: module.moduleId,
                                                        modulePermission: [permission],
                                                      });
                                                    } else {
                                                      let permissions = [
                                                        ...(updatedCategories[categoryIndex].modules[
                                                          moduleIndex
                                                        ].modulePermission || []),
                                                      ];

                                                      if (isPermissionSelected) {
                                                        permissions = permissions.filter(
                                                          (p) => p !== permission
                                                        );
                                                      } else {
                                                        if (!permissions.includes(permission)) {
                                                          permissions.push(permission);
                                                        }
                                                        if (
                                                          (permission === "POST" ||
                                                            permission === "DELETE") &&
                                                          !permissions.includes("GET")
                                                        ) {
                                                          permissions.push("GET");
                                                          setInfoToastMsg(
                                                            "View (Read) access is automatically enabled because it's required for other actions."
                                                          );
                                                          setTimeout(
                                                            () => setInfoToastMsg(""),
                                                            3000
                                                          );
                                                        }
                                                      }

                                                      updatedCategories[categoryIndex].modules[
                                                        moduleIndex
                                                      ].modulePermission = permissions;
                                                    }
                                                  }

                                                  form.setValue("categories", updatedCategories, {
                                                    shouldDirty: true,
                                                  });
                                                }}
                                                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                                                  isPermissionSelected
                                                    ? "bg-[#22556d] text-white shadow-md shadow-blue-600/40 hover:bg-[#3d687c]"
                                                    : disableGetCheckbox
                                                      ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                                                      : "bg-slate-300 text-slate-700 hover:bg-slate-400 cursor-pointer"
                                                }`}
                                              >
                                                {permissionLabels[permission]}
                                                {isPermissionSelected && <Check size={14} />}
                                              </button>
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Manual Revocation Section */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-5">
          <FormField
            control={form.control}
            name="manualRevocation"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <div className="space-y-1">
                  <FormLabel className="text-base font-semibold text-slate-900">
                    Manual Revocation
                  </FormLabel>
                  <p className="text-sm text-slate-600">
                    {field.value
                      ? "Access will remain until manually revoked by an admin."
                      : "Access will automatically expire after the specified date."}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Time Based Access Section */}
        {!manualRevocation && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-5 space-y-4">
            <div>
              <FormLabel className="flex items-center gap-2 text-base font-semibold text-slate-900">
                Time-Based Access
                <span className="py-1 px-2 text-xs font-semibold text-orange-800 bg-orange-200 rounded-full">
                  Required
                </span>
              </FormLabel>
              <p className="text-sm text-slate-600 mt-1">
                Specify the access period. The access will automatically expire after the end date.
              </p>
            </div>

            <DatePicker.RangePicker
              className="w-full"
              onChange={(dates) => handleDateRangeChange(dates)}
              style={{ width: "100%" }}
            />

            {(form.formState.errors.startDate || form.formState.errors.endDate) && (
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {form.formState.errors.startDate?.message ||
                  form.formState.errors.endDate?.message}
              </p>
            )}
          </div>
        )}

        {/* Form Errors */}
        {form?.formState?.errors?.categories?.message && (
          <p className="text-sm text-red-600 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle size={16} className="flex-shrink-0" />
            {form.formState.errors.categories.message}
          </p>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <ActionButton
            type="submit"
            variant="primary"
            isPending={assignMutation.isPending}
            loadingContent="Saving..."
            buttonContent="Grant Temporary Access"
          />
        </div>
      </form>
    </Form>
  );
}