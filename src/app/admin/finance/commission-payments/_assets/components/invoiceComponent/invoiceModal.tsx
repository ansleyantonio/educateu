/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { showToast } from "@/components/common/TostMessage/customTostMessage";

interface IInvoiceModal {
  value: any;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const InvoiceModal = ({ value, setIsOpen, isOpen }: IInvoiceModal) => {
  const invoiceMutation = useApiMutation({
    method: "PATCH",
    path: `invoice/${value?.id}`,
    onSuccess: (data) => {
      showToast("success", data);
      setIsOpen(false);
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  const handleSubmit = () => {
    invoiceMutation.mutate(value);
    console.log("handle submit", value);
  };

  return (
    <DialogWrapper
      closer={false}
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
    >
      <div>
        <h3>
          Are you sure you want to {value?.status.toLowerCase()} this invoice?
        </h3>
        <div className="flex gap-x-3 justify-end items-end mt-4">
          <ActionButton
            buttonContent="No"
            variant="outline"
            handleOpen={() => setIsOpen(false)}
            btnSize="sm"
          />
          <ActionButton
            buttonContent="Yes"
            handleOpen={handleSubmit}
            btnSize="sm"
          />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default InvoiceModal;
