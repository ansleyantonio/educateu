/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { formatDate } from "@/app/admin/user-management/_assets/utils/moduleFormatedDate";
import { fetchPortalsModule } from "@/app/admin/user-management/role-management/_assets/controller/fetchData";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuths } from "@/hooks/userContext";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import { DownOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { TreeSelect } from "antd";
import { useState } from "react";

// Zod Schema
const formSchema = z.object({
  moduleFilters: z.array(z.string()).optional(),
  portalName: z.array(z.string()).optional(),
  reportingPeriod: z
    .tuple([z.string(), z.string()]) // expects formatted dates like "2025-01-01"
    .optional(),

  manualRevocation: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const MAX_COUNT = 6;
const { SHOW_PARENT } = TreeSelect;

export function FilterTemporaryUserList({
  setTemporaryUserFilterData,
  isOpenModal,
  setIsOpenModal,
  setCurrentPage,
}: {
  setTemporaryUserFilterData: (data: any) => void;
  isOpenModal: boolean;
  setIsOpenModal: (data: any) => void;
  setCurrentPage: (page: number) => void;
}) {
  const auth = useAuths();
  const token = auth?.user?.token;
  const [treeOpen, setTreeOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleFilters: [],
      portalName: [],
      reportingPeriod: undefined,
      manualRevocation: false,
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const onSubmit = (data: FormValues) => {
    if (!treeData) return;
    const actionMap: Record<string, string> = {
      VIEW: "GET",
      EDIT: "POST",
      DELETE: "DELETE",
    };
    const selected = data.moduleFilters || [];

    // Build a lookup: module -> all its actions
    const moduleActionMap: Record<string, string[]> = {};
    treeData.forEach((module: any) => {
      const actions =
        module.children?.map((child: any) => child.value.split("-")[1]) || [];
      moduleActionMap[module.value] = actions;
    });

    // Result: moduleName -> Set of permissions
    const grouped: Record<string, Set<string>> = {};

    for (const item of selected) {
      const [module, action] = item.split("-");

      const moduleKey = module
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase();

      if (!grouped[moduleKey]) grouped[moduleKey] = new Set();

      if (action) {
        grouped[moduleKey].add(action.toUpperCase());
      } else {
        // If no action, include all actions for that module
        (moduleActionMap[module] || []).forEach((act) =>
          grouped[moduleKey].add(act.toUpperCase()),
        );
      }
    }

    const formattedModuleFilters = Object.entries(grouped).map(
      ([moduleName, permissionSet]) => ({
        moduleName,
        // permission: Array.from(permissionSet),
        permission: Array.from(permissionSet).map(
          (perm) => actionMap[perm] || perm, // fallback to original if not mapped
        ),
      }),
    );

    // Destructure and convert date range
    const [startDate, endDate] = data.reportingPeriod || [];

    const finalPayload = {
      moduleFilters: formattedModuleFilters,
      startDate,
      endDate,
      manualRevocation: data.manualRevocation,
      // page: 1,
    };

    // console.log("Submitted Filters:", finalPayload);
    setTemporaryUserFilterData(RemoveEmptyFields(finalPayload));
    setCurrentPage(1);
    setIsOpenModal(false);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["module-list", { token }],
    queryFn: fetchPortalsModule,
    enabled: !!token,
  });

  const treeData = formatDate.generateModuleTreeData(
    data?.data?.categories?.[0]?.modules || [],
  );

  // handel reset

  const handelReset = () => {
    // form reset
    form.reset({
      moduleFilters: [],
      reportingPeriod: ["", ""],

      manualRevocation: false,
    });
    setTemporaryUserFilterData({});

    //
  };
  return (
    <Sheet open={isOpenModal} onOpenChange={() => setIsOpenModal(false)}>
      <SheetTrigger className="hidden" asChild />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter List</SheetTitle>
          <DialogDescription className="hidden" />
        </SheetHeader>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-6">
              {/* Module Filter */}
              <FormField
                control={control}
                name="moduleFilters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <FormControl>
                      <TreeSelect
                        treeData={treeData}
                        value={field.value}
                        onChange={field.onChange}
                        multiple
                        maxTagCount={MAX_COUNT}
                        style={{ width: "100%" }}
                        treeCheckable={true}
                        showCheckedStrategy={SHOW_PARENT}
                        placeholder="Please select"
                        suffixIcon={<DownOutlined />}
                        allowClear
                        treeDefaultExpandAll
                        dropdownRender={(menu) => (
                          <div onMouseLeave={() => setTreeOpen(false)}>
                            {menu}
                          </div>
                        )}
                        open={treeOpen}
                        onDropdownVisibleChange={(visible) =>
                          setTreeOpen(visible)
                        }
                        getPopupContainer={(triggerNode) =>
                          triggerNode.parentElement as HTMLElement
                        }
                        tagRender={({ label, value, closable, onClose }) => {
                          const parts = value?.split("-");
                          if (parts?.length === 2) {
                            const [module, action] = parts;
                            const formattedLabel = `${module
                              .replace(/([a-z])([A-Z])/g, "$1 $2")
                              .replace(/^./, (s: string) =>
                                s.toUpperCase(),
                              )} - ${action}`;
                            return (
                              <div className="gap-3 capitalize ant-select-selection-item space-3">
                                <span className="ant-select-selection-item-content">
                                  {formattedLabel}
                                </span>
                                {closable && (
                                  <span
                                    className="ant-select-selection-item-remove"
                                    onClick={onClose}
                                  >
                                    ×
                                  </span>
                                )}
                              </div>
                            );
                          }
                          return (
                            <div className="capitalize ant-select-selection-item">
                              {label}
                            </div>
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Manual Revocation */}
              <CustomField.SwitchField
                form={form}
                name="manualRevocation"
                labelName="Manual Revocation"
                placeholder="Manual Revocation"
              />

              {/* Start Date */}
              <CustomField.RangeDatePickerAnd
                form={form}
                name="reportingPeriod"
                labelName="Date Range"
                placeholder="Start Date"
                optional={true}
              />

              <SheetFooter>
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={handelReset}
                  >
                    Clear
                  </Button>
                </SheetClose>
                <Button type="submit">Apply Filters</Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
