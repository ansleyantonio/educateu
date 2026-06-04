/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ActionButton from "@/components/common/button/actionButton";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusWithIcon } from "@/utils/status_point";

// icons
import { Checkbox } from "@/components/ui/checkbox";
import ViewFinanceModal from "./view/ViewDiscountFee";
import archive from "/public/assets/logo/admin/agents/archive.svg";
import send from "/public/assets/logo/admin/agents/send.svg";
import unpublished from "/public/assets/logo/admin/agents/Unpublished.svg";
import published from "/public/assets/logo/admin/agents/published.svg";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import axios from "axios";
import { useAuths } from "@/hooks/userContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

interface ModuleProps {
  currentPage: number;
  data: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
}

const DiscountFeeList = ({
  data,
  isLoading,
  setCurrentPage,
  currentPage,
}: ModuleProps) => {


const auth = useAuths();
  const token = auth?.user?.token as string;
const queryClient = useQueryClient();

  const publishMutation = useApiMutation({
  path: "finance-settings/status",
  method: "POST",
  onSuccess: (data) => {
    queryClient.invalidateQueries({
      queryKey: ["fetch-discount-course-fee-list"],
    });
    toast.success("Discount fee status changed successfully!");
  },
  onError: (error) => {
    console.error("Error changing discount fee status:", error);
    toast.error(error || "Error changing discount fee status");
  },
});


function transformFinanceSettingsForm(values: any) {
    return {
      status: values.published === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      id: values.id,
    };
  }

  function onChangeStatus(values :any) {
    // Clean empty fields
    const cleanedValues = RemoveEmptyFields(values);

    // Transform to API format
    const transformedValues = transformFinanceSettingsForm(cleanedValues);

    publishMutation.mutate(transformedValues as any);
  }
  return (
    <>
      <DynamicTableWithPagination
  data={data?.data?.discounts}
  isLoading={isLoading}
  pagination={data?.pagination}
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  config={{
    columns: [
      { 
        key: "discountName", 
        header: "Discount Name" 
      },
      { 
        key: "type", 
        header: "Type" 
      },
      { 
        key: "value", 
        header: "Value" 
      },
      { 
        key: "status", 
        header: "Status",
        render: (item: any) => <StatusWithIcon status={item?.status} />
      },
      {
        key: "actions",
        header: "Action",
        render: (item: any) => (
          <ResponsiveButtonGroup>
            {/* <ActionButton
              imageSrc={send}
              variant="icon"
              tooltipContent="Send"
            /> */}
            <ViewFinanceModal discountFee={item} />
            <ActionButton
              handleOpen={() => onChangeStatus(item)}
              imageSrc={published}
              variant="icon"
              tooltipContent="Publish"
              disabled={item?.published === "INACTIVE"}
            />
            <ActionButton
              handleOpen={() => onChangeStatus(item)}
              imageSrc={unpublished}
              variant="icon"
              tooltipContent="Unpublish"
              disabled={item?.published === "ACTIVE"}
            />
            {/* <ActionButton
              imageSrc={archive}
              variant="icon"
              tooltipContent="Archive"
            /> */}
          </ResponsiveButtonGroup>
        ),
      },
    ],
  }}
  isCheckBox
/>
    </>
  );
};

export default DiscountFeeList;
