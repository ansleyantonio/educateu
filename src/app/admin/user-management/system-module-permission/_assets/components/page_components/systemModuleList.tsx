/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AssignModule } from "@/app/admin/user-management/_assets/query_controller/assignModule";
import ActionButton from "@/components/common/button/actionButton";
import { showInfoToast } from "@/components/showInfoToast/showInfoToast";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Check, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const permissionLabels: Record<string, string> = {
  GET: "Read",
  POST: "Edit",
  DELETE: "Delete",
};

interface ModulePermission {
  moduleId: string;
  modulePermission: string[];
}

interface CategoryPermission {
  portalCategoryId: string;
  modules: ModulePermission[];
}

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
        allPermissions: string[];
      }[];
    }[];
  };
  isLoading: boolean;
  closeModal?: () => void;
  onAssignSuccess?: () => void;
}

const FormSchema = z.object({
  categories: z.array(
    z.object({
      portalCategoryId: z.string().optional(),
      modules: z.array(
        z.object({
          moduleId: z.string().optional(),
          modulePermission: z.array(z.string().optional()).optional(),
        })
      ),
    })
  ),
});

export function SystemModuleList({
  token,
  id,
  data,
  isLoading,
  closeModal,
  onAssignSuccess,
}: ModuleListProps) {
  const queryClient = useQueryClient();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [infoToastMsg, setInfoToastMsg] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { categories: [] },
  });

  const assignMutation = useMutation({
    mutationFn: (data: any) => AssignModule(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assign-module"] });
      toast.success(data.message);
      if (closeModal) {
        closeModal();
      }
      if (onAssignSuccess) {
        onAssignSuccess();
      }
    },
    onError: (error: any) => toast.error(error.message),
  });

  const groupModulesByGroup = (modules: any[]) => {
    return modules.reduce((acc, module) => {
      const group = module.moduleGroup || "other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(module);
      return acc;
    }, {} as Record<string, any[]>);
  };

  // const getGroupIcon = (groupName: string) => {
  //   const icons: Record<string, string> = {
  //     admissions: "📋",
  //     "course-management": "📚",
  //     "business-development-management": "📊",
  //     "student-roaster": "👥",
  //     "enrollment-management": "📝",
  //     "user-management": "👤",
  //     finance: "💰",
  //     "external-portal-users": "🔗",
  //     "system-settings": "⚙️",
  //     "awarding-bodies": "🏆",
  //     uploads: "📤",
  //   };
  //   return icons[groupName] || "📌";
  // };

  const shouldExpandGroup = (
    groupModules: any[],
    categoryId: string,
    formCategories: any[]
  ) => {
    const category = formCategories.find(
      (c) => c.portalCategoryId === categoryId
    );
    if (!category) return false;

    return groupModules.some((module) => {
      const moduleData = category.modules.find(
        (m: any) => m.moduleId === module.moduleId
      );
      const perms = moduleData?.modulePermission || [];
      return perms.includes("POST") || perms.includes("DELETE");
    });
  };

  useEffect(() => {
    if (data?.userModules) {
      const defaultCategories =
        id.length > 1
          ? data.userModules.map((category) => ({
              portalCategoryId: category.portalCategorieId,
              modules: category.modules.map((module) => ({
                moduleId: module.moduleId,
                modulePermission: [],
              })),
            }))
          : data.userModules.map((category) => ({
              portalCategoryId: category.portalCategorieId,
              modules: category.modules.map((module) => ({
                moduleId: module.moduleId,
                modulePermission: module.allPermissions,
              })),
            }));

      form.reset({
        categories: defaultCategories,
      });

      // Initialize expanded groups
      const initialExpanded: Record<string, boolean> = {};
      data.userModules.forEach((category) => {
        const grouped = groupModulesByGroup(category.modules);
        Object.entries(grouped).forEach(([group, mods]) => {
          initialExpanded[group] = shouldExpandGroup(
            mods as any[],
            category.portalCategorieId,
            defaultCategories
          );
        });
      });
      setExpandedGroups(initialExpanded);
    }
  }, [data, form, id.length]);

  function normalizePermissions(data: any) {
    return {
      userId: data.userId,
      portalCategories: data.portalCategories.map((category: any) => ({
        portalCategoryId: category.portalCategoryId,
        modules: category.modules.map((module: any) => ({
          moduleId: module.moduleId,
          modulePermission: module.modulePermission || [],
        })),
      })),
    };
  }

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    for (const category of values.categories) {
      for (const mod of category.modules) {
        const perms = mod.modulePermission || [];

        if (
          (perms.includes("POST") || perms.includes("DELETE")) &&
          !perms.includes("GET")
        ) {
          mod.modulePermission = [...perms, "GET"];
          showInfoToast(
            "View (Read) access is automatically enabled because it's required for other actions."
          );
        }
      }
    }

    const payload = {
      userId: typeof id === "string" ? [id] : [...id],
      portalCategories: values.categories,
    };

    const formate = normalizePermissions(payload);

    const data = {
      body: formate,
      token: token,
    };

    assignMutation.mutate(data);
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2
          size={55}
          strokeWidth={2}
          className="animate-spin text-blue-600"
        />
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

              {(Object.entries(grouped) as [string, any[]][]).map(
                ([groupName, groupModules]) => {
                  const isExpanded = expandedGroups[groupName];
                  const categoryData = formCategories.find(
                    (c) => c.portalCategoryId === category.portalCategorieId
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

                          {/* <span className="text-xl">
                          {getGroupIcon(groupName)}
                        </span> */}
                          <span className="text-base font-semibold text-slate-900 capitalize">
                            {groupName.replace(/-/g, " ")}
                          </span>
                          {hasActivePermissions && (
                            <span className="ml-2 inline-flex items-center gap-1.5 px-1 py-1 bg-blue-50 border border-blue-200 rounded-full">
                              <Check size={14} className="text-blue-600" />
                              {/* <span className="text-xs font-medium text-blue-700">
                              Active
                            </span> */}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-sm  font-medium ${
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
                                .find(
                                  (c) =>
                                    c.portalCategoryId ===
                                    category.portalCategorieId
                                )
                                ?.modules.find(
                                  (m) => m.moduleId === module.moduleId
                                )?.modulePermission || [];

                            const defaultPermissions = [
                              "GET",
                              "POST",
                              "DELETE",
                            ];
                            const areAllPermissionsSelected =
                              defaultPermissions.every((permission) =>
                                modulePermissions.includes(permission)
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
                                        const updatedCategories =
                                          form.getValues("categories");
                                        const categoryIndex =
                                          updatedCategories.findIndex(
                                            (c) =>
                                              c.portalCategoryId ===
                                              category.portalCategorieId
                                          );

                                        if (checked) {
                                          if (categoryIndex === -1) {
                                            updatedCategories.push({
                                              portalCategoryId:
                                                category.portalCategorieId,
                                              modules: [
                                                {
                                                  moduleId: module.moduleId,
                                                  modulePermission:
                                                    defaultPermissions,
                                                },
                                              ],
                                            });
                                          } else {
                                            const moduleIndex =
                                              updatedCategories[
                                                categoryIndex
                                              ].modules.findIndex(
                                                (m) =>
                                                  m.moduleId === module.moduleId
                                              );

                                            if (moduleIndex === -1) {
                                              updatedCategories[
                                                categoryIndex
                                              ].modules.push({
                                                moduleId: module.moduleId,
                                                modulePermission:
                                                  defaultPermissions,
                                              });
                                            } else {
                                              updatedCategories[
                                                categoryIndex
                                              ].modules[
                                                moduleIndex
                                              ].modulePermission =
                                                defaultPermissions;
                                            }
                                          }
                                        } else {
                                          if (categoryIndex !== -1) {
                                            const moduleIndex =
                                              updatedCategories[
                                                categoryIndex
                                              ].modules.findIndex(
                                                (m) =>
                                                  m.moduleId === module.moduleId
                                              );

                                            if (moduleIndex !== -1) {
                                              updatedCategories[
                                                categoryIndex
                                              ].modules.splice(moduleIndex, 1);
                                            }
                                          }
                                        }

                                        form.setValue(
                                          "categories",
                                          updatedCategories
                                        );
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
                                                      ...form.getValues(
                                                        "categories"
                                                      ),
                                                    ];
                                                    const categoryIndex =
                                                      updatedCategories.findIndex(
                                                        (c) =>
                                                          c.portalCategoryId ===
                                                          category.portalCategorieId
                                                      );

                                                    if (categoryIndex === -1) {
                                                      updatedCategories.push({
                                                        portalCategoryId:
                                                          category.portalCategorieId,
                                                        modules: [
                                                          {
                                                            moduleId:
                                                              module.moduleId,
                                                            modulePermission: [
                                                              permission,
                                                            ],
                                                          },
                                                        ],
                                                      });
                                                    } else {
                                                      const moduleIndex =
                                                        updatedCategories[
                                                          categoryIndex
                                                        ].modules.findIndex(
                                                          (m) =>
                                                            m.moduleId ===
                                                            module.moduleId
                                                        );

                                                      if (moduleIndex === -1) {
                                                        updatedCategories[
                                                          categoryIndex
                                                        ].modules.push({
                                                          moduleId:
                                                            module.moduleId,
                                                          modulePermission: [
                                                            permission,
                                                          ],
                                                        });
                                                      } else {
                                                        let permissions = [
                                                          ...(updatedCategories[
                                                            categoryIndex
                                                          ].modules[moduleIndex]
                                                            .modulePermission ||
                                                            []),
                                                        ];

                                                        if (
                                                          isPermissionSelected
                                                        ) {
                                                          permissions =
                                                            permissions.filter(
                                                              (p) =>
                                                                p !== permission
                                                            );
                                                        } else {
                                                          if (
                                                            !permissions.includes(
                                                              permission
                                                            )
                                                          ) {
                                                            permissions.push(
                                                              permission
                                                            );
                                                          }
                                                          if (
                                                            (permission ===
                                                              "POST" ||
                                                              permission ===
                                                                "DELETE") &&
                                                            !permissions.includes(
                                                              "GET"
                                                            )
                                                          ) {
                                                            permissions.push(
                                                              "GET"
                                                            );
                                                            setInfoToastMsg(
                                                              "View (Read) access is automatically enabled because it's required for other actions."
                                                            );
                                                            setTimeout(
                                                              () =>
                                                                setInfoToastMsg(
                                                                  ""
                                                                ),
                                                              3000
                                                            );
                                                          }
                                                        }

                                                        updatedCategories[
                                                          categoryIndex
                                                        ].modules[
                                                          moduleIndex
                                                        ].modulePermission =
                                                          permissions;
                                                      }
                                                    }

                                                    form.setValue(
                                                      "categories",
                                                      updatedCategories,
                                                      {
                                                        shouldDirty: true,
                                                      }
                                                    );
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
                                                  {isPermissionSelected && (
                                                    <Check size={14} />
                                                  )}
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
                }
              )}
            </div>
          );
        })}

        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <ActionButton
            type="submit"
            isPending={assignMutation.isPending}
            loadingContent="Saving..."
            buttonContent="Save Permissions"
            variant="primary"
          />
        </div>
      </form>
    </Form>
  );
}
