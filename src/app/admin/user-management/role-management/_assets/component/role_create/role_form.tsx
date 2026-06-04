/* eslint-disable @next/next/no-assign-module-variable */
import { showInfoToast } from "@/components/showInfoToast/showInfoToast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { createNewRole } from "../../controller/createData";
import {
  permissionLabels,
  permissionTypes,
  roleFormProps,
  RoleFormValues,
} from "../../interface/create_role_schema";
import { NewRole } from "../../interface/role_type";

const RoleForm = ({
  token,
  form,
  CategoriesData,
  setIsCreateModal,
}: roleFormProps) => {
  // Track selected categories to show their modules
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Handle category selection
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newSelectedCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter((id) => id !== categoryId);

    setSelectedCategories(newSelectedCategories);

    // Update the categories field in the form
    form.setValue("categories", newSelectedCategories);

    // If a category is unchecked, remove its modules from modulePermissions
    if (!checked) {
      const currentModulePermissions = form.getValues("modulePermissions");
      const categoryModuleIds =
        CategoriesData.find(
          (cat) => cat.categoryId === categoryId
        )?.modules.map((mod) => mod.moduleId) || [];

      const updatedModulePermissions = currentModulePermissions.filter(
        (mp) => !categoryModuleIds.includes(mp.moduleId)
      );

      form.setValue("modulePermissions", updatedModulePermissions);
    }
  };

  // Check if a module has all permissions selected
  const isModuleFullySelected = (moduleId: string) => {
    console.log("FULL ELECTED");
    const modulePermissions = form.getValues("modulePermissions");
    const module = modulePermissions.find((mp) => mp.moduleId === moduleId);
    return module?.permissions.length === permissionTypes.length;
  };

  // Handle module permission selection
  const handlePermissionChange = (
    moduleId: string,
    permission: (typeof permissionTypes)[number],
    checked: boolean,
    force = false
  ) => {
    const currentModulePermissions = [...form.getValues("modulePermissions")];
    const moduleIndex = currentModulePermissions.findIndex(
      (mp) => mp.moduleId === moduleId
    );

    if (moduleIndex === -1 && checked) {
      // CHANGED START: Add permission with auto add READ if EDIT or DELETE selected
      const newPermissions = [permission];
      if (
        (permission === "POST" || permission === "DELETE") &&
        !newPermissions.includes("GET")
      ) {
        newPermissions.push("GET");
        showInfoToast(
          "View (Read) access is automatically enabled because it’s required for other actions."
        );
      }
      currentModulePermissions.push({
        moduleId,
        permissions: newPermissions,
      });
      // CHANGED END
    } else if (moduleIndex !== -1) {
      let permissions = [...currentModulePermissions[moduleIndex].permissions];

      if (checked) {
        if (!permissions.includes(permission)) permissions.push(permission);
        // CHANGED START: Auto add READ when POST or DELETE is selected
        if (
          (permission === "POST" || permission === "DELETE") &&
          !permissions.includes("GET")
        ) {
          permissions.push("GET");
          showInfoToast(
            "View (Read) access is automatically enabled because it’s required for other actions."
          );
        }
        // CHANGED END
      } else {
        // CHANGED START: Prevent removing READ if EDIT or DELETE is selected
        if (
          !force &&
          permission === "GET" &&
          (permissions.includes("POST") || permissions.includes("DELETE"))
        ) {
          toast.error("Cannot remove Read while Edit/Delete is selected."); // CHANGED: Error toast here
          return;
        }
        // CHANGED END

        permissions = permissions.filter((p) => p !== permission);
      }

      if (permissions.length === 0) {
        currentModulePermissions.splice(moduleIndex, 1);
      } else {
        currentModulePermissions[moduleIndex].permissions = permissions;
      }
    }

    form.setValue("modulePermissions", currentModulePermissions, {
      shouldValidate: true,
    });
    form.trigger("modulePermissions");
  };

  // Handle module selection (select/deselect all permissions)
  const handleModuleChange = (moduleId: string, checked: boolean) => {
    permissionTypes.forEach((permission) => {
      handlePermissionChange(moduleId, permission, checked, true);
    });
  };

  // Check if a permission is selected for a module
  const isPermissionSelected = (
    moduleId: string,
    permission: (typeof permissionTypes)[number]
  ) => {
    const modulePermissions = form.getValues("modulePermissions");
    const module = modulePermissions.find((mp) => mp.moduleId === moduleId);
    return module?.permissions.includes(permission) || false;
  };

  // Handle form submission
  const roleMutation = useMutation({
    mutationFn: ({ transformedData, token }: NewRole) =>
      createNewRole({ transformedData, token }),
    onSuccess: (data) => {
      if (data.statusCode === 200) {
        console.log(data);
        queryClient.invalidateQueries({ queryKey: ["fetch-list-of-roles"] });
        toast.success(data.message);
        form.reset();
        setIsCreateModal(false);
      }
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
      console.error("Error:", error);
    },
  });

  // Handle form submission
  const onSubmit = (data: RoleFormValues) => {
    // Transform data to match the expected output format
    const transformedData = {
      roleName: data.roleName,
      categories: CategoriesData.filter((cat) =>
        data.categories.includes(cat.categoryId)
      ).map((cat) => ({
        ...cat,
        modules: cat.modules
          .map((mod) => {
            const modulePermission = data.modulePermissions.find(
              (mp) => mp.moduleId === mod.moduleId
            );
            return {
              ...mod,
              modulePermissions: modulePermission?.permissions || [],
            };
          })
          // Filter out modules with empty permissions
          .filter((mod) => mod.modulePermissions.length > 0),
      })),
    };

    // Validation: Ensure at least one module is selected per category
    const hasInvalidCategory = transformedData.categories.some(
      (category) => category.modules.length === 0
    );

    if (hasInvalidCategory) {
      toast.error("Each selected category must have at least one module.");
      return;
    }

    roleMutation.mutate({ transformedData, token });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Name */}
        <FormField
          control={form.control}
          name="roleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter role name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categories */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Select Portal Category</h3>
          <div className="space-y-2">
            {CategoriesData.map((category) => (
              <div
                key={category.categoryId}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`category-${category.categoryId}`}
                  checked={selectedCategories.includes(category.categoryId)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(
                      category.categoryId,
                      checked as boolean
                    )
                  }
                />
                <label
                  htmlFor={`category-${category.categoryId}`}
                  className="text-sm font-medium capitalize"
                >
                  {category.categoryName}
                </label>
              </div>
            ))}
          </div>
          {
            <p className="text-xs text-red-500">
              {form.formState.errors.categories?.message}
            </p>
          }
        </div>

        {/* Modules for selected categories */}
        {selectedCategories.map((categoryId) => {
          const category = CategoriesData.find(
            (cat) => cat.categoryId === categoryId
          );

          if (!category) return null;

          return (
            <div key={categoryId} className="space-y-4">
              <h3 className="text-lg font-medium capitalize">
                {category.categoryName}
              </h3>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Select Modules</h4>
                <div className="space-y-4">
                  {category.modules.map((module) => (
                    <div
                      key={module.moduleId}
                      className="grid grid-cols-4 items-center"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`module-${module.moduleId}`}
                          checked={isModuleFullySelected(module.moduleId)}
                          onCheckedChange={(checked) => {
                            handleModuleChange(
                              module.moduleId,
                              checked as boolean
                            );
                          }}
                        />
                        <label
                          htmlFor={`module-${module.moduleId}`}
                          className="text-sm font-medium capitalize"
                        >
                          {module.moduleName}
                        </label>
                      </div>

                      {/* Permissions */}
                      {permissionTypes.map((permission) => {
                        const isSelected = isPermissionSelected(
                          module.moduleId,
                          permission
                        );
                        const currentModule = form
                          .getValues("modulePermissions")
                          .find((mp) => mp.moduleId === module.moduleId);
                        // CHANGED START: Disable READ if POST or DELETE is selected
                        const isReadDisabled =
                          permission === "GET" &&
                          currentModule?.permissions.some(
                            (p) => p === "POST" || p === "DELETE"
                          );
                        // CHANGED END

                        return (
                          <div
                            key={permission}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`permission-${module.moduleId}-${permission}`}
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  module.moduleId,
                                  permission,
                                  checked as boolean
                                )
                              }
                              // CHANGED START: disable READ checkbox conditionally
                              disabled={isReadDisabled}
                              // CHANGED END
                            />
                            <label
                              htmlFor={`permission-${module.moduleId}-${permission}`}
                              className="text-sm font-medium"
                            >
                              {permissionLabels[permission]}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <DialogFooter className="flex justify-end mt-10 mr-5">
          <Button
            type="submit"
            variant="primary"
            disabled={roleMutation.isPending}
          >
            {roleMutation.isPending ? (
              <>
                Saving.. <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default RoleForm;
