/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";

interface IInvoiceModal {
  value: any;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const InvoiceModal = ({ value, setIsOpen, isOpen }: IInvoiceModal) => {
  const queryClient = useQueryClient();

  const invoiceMutation = useApiMutation({
    method: "PATCH",
    path: `commission-payments/invoices/update/all`,
    onSuccess: (data) => {
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["commission-payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoiced-applicants"] });
      showToast("success", data);
    },
  });

  const handleSubmit = () => {
    if (value.invoiceIds.length === 0) {
      return showToast("error", "Please select at least one invoice");
    }
    invoiceMutation.mutate(value);
  };

  return (
    <DialogWrapper
      closer={false}
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
      style="pt-4"
    >
      <div>
        <h3>
          Are you sure you want to {value?.invoiceStatus?.toLowerCase()} this
          invoice?
        </h3>
        <div className="flex gap-x-3 justify-end items-end mt-6">
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
