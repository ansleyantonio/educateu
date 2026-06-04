/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-assign-module-variable */

"use client";

import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { showInfoToast } from "@/components/showInfoToast/showInfoToast";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import toast from "react-hot-toast";
import { upadateRoleById } from "../../controller/createData";
import {
  DBPermission,
  permissionMapping,
  RoleFormValues,
  RoleModule,
  UIPermission,
  UpdateRoleModule,
  UpdateRoleRequest,
} from "../../interface/update_role_type";

interface RoleManagementProps {
  token: string;
  isLoading: boolean;
  activeRole: any;
  form: UseFormReturn<RoleFormValues>;
  data: any;
  isActiveModal: boolean;
  setIsActiveModal: (value: boolean) => void;
}

export default function RoleManagement({
  token,
  data,
  isLoading,
  activeRole,
  form,
  setIsActiveModal,
}: RoleManagementProps) {
  // console.log("data", data, activeRole.name);
  const queryClient = useQueryClient();
  const [modules, setModules] = useState<RoleModule[]>([]);

  const uiPermissions: UIPermission[] = ["Read", "Write", "Delete"];
  const dbPermissions: DBPermission[] = ["GET", "POST", "DELETE"];

  // Update modules state when data is available
  useEffect(() => {
    if (data?.data?.modules) {
      const validModules = data.data.modules.filter(
        (module: RoleModule) => !!module.moduleId && !!module.moduleName
      );

      setModules(validModules);

      form.reset({
        roleName: activeRole?.name || "",
        modules: validModules.reduce(
          (acc: Record<string, any>, module: RoleModule) => {
            const allPermissionsSelected =
              module.modulePermissions.length >= dbPermissions.length;

            acc[module.moduleId] = {
              selected: allPermissionsSelected,
              moduleName: module.moduleName,
              permissions: {
                Read: module.modulePermissions.includes("GET"),
                Write: module.modulePermissions.includes("POST"),
                Delete: module.modulePermissions.includes("DELETE"),
              },
              categoryId: module.categoryId,
            };
            return acc;
          },
          {} as RoleFormValues["modules"]
        ),
      });
    }
  }, [data, activeRole, form, dbPermissions.length]);

  // Check if all permissions are selected for a module
  const isModuleFullySelected = (moduleId: string) => {
    const module = modules.find((m) => m.moduleId === moduleId);
    return module?.modulePermissions.length === dbPermissions.length;
  };

  // Toggle all permissions for a module
  const toggleModule = (moduleId: string, checked: boolean) => {
    setModules((prevModules) =>
      prevModules.map((module) =>
        module.moduleId === moduleId
          ? { ...module, modulePermissions: checked ? [...dbPermissions] : [] }
          : module
      )
    );

    uiPermissions.forEach((permission) => {
      form.setValue(`modules.${moduleId}.permissions.${permission}`, checked);
    });

    form.setValue(`modules.${moduleId}.selected`, checked);
  };

  // Toggle individual permission
  const togglePermission = (
    moduleId: string,
    uiPermission: UIPermission,
    checked: boolean
  ) => {
    const dbPermission = permissionMapping[uiPermission];
    let shouldShowToast = false;

    setModules((prevModules) =>
      prevModules.map((module) => {
        if (module.moduleId === moduleId) {
          let newPermissions = [...module.modulePermissions];

          if (checked) {
            if (!newPermissions.includes(dbPermission)) {
              newPermissions.push(dbPermission);
            }

            if (
              (dbPermission === "POST" || dbPermission === "DELETE") &&
              !newPermissions.includes("GET")
            ) {
              newPermissions.push("GET");
              shouldShowToast = true; // Mark to show toast later
              form.setValue(`modules.${moduleId}.permissions.Read`, true);
            }
          } else {
            if (
              dbPermission === "GET" &&
              (newPermissions.includes("POST") ||
                newPermissions.includes("DELETE"))
            ) {
              toast.error(
                "Cannot remove Read while Write or Delete is selected."
              );
              return module;
            }
            newPermissions = newPermissions.filter((p) => p !== dbPermission);
          }

          return { ...module, modulePermissions: newPermissions };
        }
        return module;
      })
    );

    form.setValue(`modules.${moduleId}.permissions.${uiPermission}`, checked);

    const moduleValues = form.getValues().modules[moduleId];
    const allSelected = uiPermissions.every(
      (p) => moduleValues?.permissions[p]
    );
    form.setValue(`modules.${moduleId}.selected`, allSelected);

    // Show toast only once here, outside setModules updater
    if (shouldShowToast) {
      showInfoToast(
        "View (Read) access is automatically enabled because it’s required for other actions."
      );
    }
  };
  // Check if a specific permission is selected
  const isPermissionSelected = (
    moduleId: string,
    uiPermission: UIPermission
  ) => {
    const module = modules.find((m) => m.moduleId === moduleId);
    return (
      module?.modulePermissions.includes(permissionMapping[uiPermission]) ||
      false
    );
  };

  const updateRoleMutation = useMutation({
    mutationFn: (data: UpdateRoleRequest) => upadateRoleById(data),
    onSuccess: (data) => {
      if (data.statusCode === 200) {
        form.reset();
        queryClient.invalidateQueries({
          queryKey: ["fetch-list-of-roles"],
        });

        queryClient.invalidateQueries({
          queryKey: ["fetchActiveRoleModuleData"],
        });
        showToast("success", data);
        setIsActiveModal(false);
      } else {
        console.error("Error caught:", data);
        showToast("error", data);
      }
    },
    onError: (error) => {
      console.error("Error get:", error);
      toast.error(error.message);
    },
  });

  const onSubmit = (formData: RoleFormValues) => {
    const updatedModules = Object.entries(formData.modules)
      .map(([moduleId, moduleData]) => {
        if (!moduleId || !moduleData.moduleName) {
          console.error("Error: Missing moduleId or moduleName", moduleData);
          return null;
        }

        const permissions = Object.entries(moduleData.permissions)
          .filter(([_, isSelected]) => isSelected)
          .map(
            ([uiPermission]) => permissionMapping[uiPermission as UIPermission]
          );

        return {
          moduleId,
          moduleName: moduleData.moduleName,
          modulePermission: permissions,
          categoryId: moduleData.categoryId,
        };
      })
      .filter(
        (module): module is UpdateRoleModule =>
          module !== null && module.modulePermission.length > 0
      );

    if (updatedModules.length === 0) {
      console.error("Error: No valid modules to submit.");
      return;
    }

    const updatedRole = {
      roleName: formData.roleName,
      modules: updatedModules,
    };

    const data = { updatedRole, token, roleId: activeRole?.id };

    updateRoleMutation.mutate(data);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <h2 className="mb-6 text-xl font-semibold">Update Role</h2>

            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter role name"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="mb-6">
              <div className="space-y-1">
                <p className="mb-3 font-medium">Select Modules</p>

                {modules.map((module) => {
                  // CHANGED START: Disable Read checkbox if Write or Delete selected
                  const isReadDisabled =
                    module.modulePermissions.includes("POST") ||
                    module.modulePermissions.includes("DELETE");
                  // CHANGED END

                  return (
                    <div
                      key={module.moduleId}
                      className="grid grid-cols-4 items-center"
                    >
                      <div className="flex gap-2 items-center min-w-[140px]">
                        <FormField
                          control={form.control}
                          name={`modules.${module.moduleId}.selected`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-y-1 space-x-4">
                              <FormControl>
                                <Checkbox
                                  checked={
                                    isModuleFullySelected(module.moduleId) ||
                                    module.modulePermissions.length >=
                                      dbPermissions.length
                                  }
                                  onCheckedChange={(checked) =>
                                    toggleModule(
                                      module.moduleId,
                                      checked === true
                                    )
                                  }
                                />
                              </FormControl>
                              <Label className="font-normal capitalize">
                                {module.moduleName}
                              </Label>
                            </FormItem>
                          )}
                        />
                      </div>

                      {uiPermissions.map((uiPermission) => (
                        <div
                          key={`${module.moduleId}-${uiPermission}`}
                          className="flex gap-2 justify-end items-center"
                        >
                          <Checkbox
                            checked={isPermissionSelected(
                              module.moduleId,
                              uiPermission
                            )}
                            onCheckedChange={(checked) =>
                              togglePermission(
                                module.moduleId,
                                uiPermission,
                                checked === true
                              )
                            }
                            // CHANGED START: disable Read checkbox conditionally
                            disabled={uiPermission === "Read" && isReadDisabled}
                            // CHANGED END
                          />
                          <Label className="font-normal">{uiPermission}</Label>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end mt-10 mr-5">
              <Button
                type="submit"
                variant="primary"
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? (
                  <>
                    Updating <Loader className="w-6 h-6 animate-spin" />
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
