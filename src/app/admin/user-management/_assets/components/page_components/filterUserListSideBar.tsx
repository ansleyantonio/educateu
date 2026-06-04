/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
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
import { DownOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import type { SelectProps } from "antd";
import { Select, TreeSelect } from "antd";
import { useState } from "react";
import toast from "react-hot-toast";
import { fetchPortalsModule } from "../../../role-management/_assets/controller/fetchData";
import { fetchFilterLists } from "../../query_controller/fetchFilterList";
import { fetchListOfPortalList } from "../../query_controller/fetchListOfPortalList";
import { formatDate } from "../../utils/moduleFormatedDate";

const options: SelectProps["options"] = [];

const { SHOW_PARENT, SHOW_CHILD } = TreeSelect;
const MAX_COUNT = 6;

// const treeData = [
//   {
//     title: "User Management",
//     value: "userManagement",
//     key: "userManagement",
//     children: [
//       {
//         title: "GET",
//         value: "userManagement-GET",
//         key: "userManagement-GET",
//       },
//       {
//         title: "POST",
//         value: "userManagement-POST",
//         key: "userManagement-POST",
//       },
//       {
//         title: "DELETE",
//         value: "userManagement-DELETE",
//         key: "userManagement-DELETE",
//       },
//     ],
//   },
//   {
//     title: "admission",
//     value: "admission",
//     key: "admission",
//     children: [
//       {
//         title: "GET",
//         value: "admission-GET",
//         key: "admission-GET",
//       },
//       {
//         title: "POST",
//         value: "admission-POST",
//         key: "admission-POST",
//       },
//       {
//         title: "DELETE",
//         value: "admission-DELETE",
//         key: "admission-DELETE",
//       },
//     ],
//   },
// ];

export function FilterUserList({
  setUserFilterData,
  isOpenModal,
  setIsOpenModal,
  onFilterResult,
  onClearFilters,
}: {
  setUserFilterData: (data: any) => void;
  isOpenModal: boolean;
  setIsOpenModal: (data: any) => void;
  onFilterResult?: (response: any) => void;
  onClearFilters?: () => void;
}) {
  const auth = useAuths();
  const token = auth?.user?.token;
  const [value, setValue] = useState<string[]>([]);
  const [roleValue, setRoleValue] = useState<string[]>([]);
  const [selectOpen, setSelectOpen] = useState(false);
  const [treeOpen, setTreeOpen] = useState(false);

  const onChange = (newValue: string[]) => {
    setValue(newValue);
    // console.log("newValue", value);
  };

  const { data: roleList, isLoading: isRoleLoading } = useQuery({
    queryKey: ["role-list", { token }],
    queryFn: fetchListOfPortalList,
    enabled: !!token,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["module-list", { token }],
    queryFn: fetchPortalsModule,
    enabled: !!token,
  });

  const handleApplyFilters = async () => {
    if (value.length === 0 && roleValue.length === 0) {
      toast.error("Please select at least one filter before applying.");
      return;
    }

    const actionMap: Record<string, string> = {
      VIEW: "GET",
      EDIT: "POST",
      DELETE: "DELETE",
    };

    // Flatten treeData to map module -> [actions]
    const moduleActionMap: Record<string, string[]> = {};
    treeData.forEach((module) => {
      moduleActionMap[module.value] =
        module.children?.map((child: any) => child.value) || [];
    });

    const expandedValues: string[] = [];

    value.forEach((val) => {
      if (val.includes("-")) {
        expandedValues.push(val);
      } else {
        // If it's a parent node, push all its children
        expandedValues.push(...(moduleActionMap[val] || []));
      }
    });

    const finalGrouped: Record<string, string[]> = {};
    expandedValues.forEach((val) => {
      const [module, action] = val.split("-");
      if (module && action) {
        const apiAction = actionMap[action] || action; // map to GET/POST/DELETE
        if (!finalGrouped[module]) {
          finalGrouped[module] = [];
        }
        finalGrouped[module].push(apiAction);
      }
    });

    const result = Object.entries(finalGrouped).map(
      ([moduleName, permission]) => ({
        moduleName: moduleName
          .replace(/([a-z])([A-Z])/g, "$1-$2")
          .toLowerCase(),
        permission,
      })
    );

    // console.log("Transformed Filters (API-module):", result);

    const filterDate = {
      moduleFilters: result,
      // roleFilters: roleValue,
      roleFilters: roleValue.map((role) => ({ name: role })),
    };
    // console.log("Transformed Filters (API-role):", filterDate);

    try {
      const apiResponse = await fetchFilterLists({ body: filterDate, token });
      // console.log("API Response:", apiResponse);
      setUserFilterData(filterDate);
      if (onFilterResult) {
        onFilterResult(apiResponse);
      }
      setIsOpenModal(false);
    } catch (error) {
      console.error("Failed to fetch filtered users:", error);
      // Optionally handle error UI here
    }

    // setUserFilterData(filterDate); //

    // setIsOpenModal(false);
  };

  // all module list by portal
  const treeData = formatDate.generateModuleTreeData(
    data?.data?.categories[0].modules
  );

  const handleRoleChange = (value: string[]) => {
    // console.log(`selected ${value}`);
    setRoleValue(value);
  };

  return (
    <Sheet
      open={isOpenModal}
      onOpenChange={() => {
        setIsOpenModal(false);
        // setValue([]);
      }}
    >
      <SheetTrigger className="hidden" asChild></SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter List</SheetTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </SheetHeader>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="py-4">
            <label htmlFor="" className="cusFormLabel">
              Module{" "}
            </label>

            <TreeSelect
              treeData={treeData}
              value={value}
              onChange={onChange}
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
                <div onMouseLeave={() => setTreeOpen(false)}>{menu}</div>
              )}
              open={treeOpen}
              onDropdownVisibleChange={(visible) => setTreeOpen(visible)}
              getPopupContainer={(triggerNode) => triggerNode.parentElement}
              tagRender={({ label, value, closable, onClose }) => {
                const parts = value?.split("-");
                if (parts?.length === 2) {
                  const [module, action] = parts;
                  const formattedLabel = `${module
                    .replace(/([a-z])([A-Z])/g, "$1 $2")
                    .replace(/^./, (s: any) => s?.toUpperCase())} - ${action}`;
                  return (
                    <div className="ant-select-selection-item gap-3 space-3 capitalize">
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
                  <div className="ant-select-selection-item  capitalize">
                    {label}
                  </div>
                );
              }}
            />
            <div className="my-5">
              <label htmlFor="" className="mb-2 cusFormLabel">
                Role{" "}
              </label>
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Please select"
                value={roleValue}
                onChange={handleRoleChange}
                open={selectOpen}
                onDropdownVisibleChange={(visible) => setSelectOpen(visible)}
                dropdownRender={(menu) => (
                  <div onMouseLeave={() => setSelectOpen(false)}>{menu}</div>
                )}
                options={
                  formatDate.transformRoleArray(roleList?.portals[0].roles) ||
                  []
                }
                getPopupContainer={(triggerNode) => triggerNode.parentElement}
              />
            </div>
          </div>
        )}

        <SheetFooter>
          <SheetClose asChild>
            <Button
              onClick={() => {
                setValue([]);
                setRoleValue([]);
                if (onClearFilters) onClearFilters();
              }}
              variant="outline"
              className="mr-2"
            >
              Clear
            </Button>
          </SheetClose>
          <Button type="button" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
