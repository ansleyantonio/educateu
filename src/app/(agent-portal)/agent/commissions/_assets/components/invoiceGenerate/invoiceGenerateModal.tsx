/* eslint-disable @typescript-eslint/no-explicit-any */
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import dateFormat from "@/utils/DateFormatter";
import { useState } from "react";
import InvoiceGeneration from "./invoiceGeneration";

interface InvoiceGenerateProps {
  selectedIds: string[];
  selectObject: any[];
}

const InvoiceGenerateModal = ({
  selectedIds,
  selectObject,
}: InvoiceGenerateProps) => {
  const [open, setOpen] = useState(false);

  function onDraftInvoiceClick(student: any): void {
    setOpen(true);
    const {} = student;
  }

  // console.log("selectObject", selectObject);

  return (
    <DialogWrapper
      open={open}
      handleOpen={setOpen}
      title={
        <div className="flex gap-8 justify-between items-center font-medium">
          <div>
            {/* {draftInvoice?.isPending && <p>Generating Invoice...</p>} */}
            {/* {invoice && <p>Invoice {invoice}</p>} */}

            <p className="mt-2 font-semibold text-gray-600">
              Global Learning Partner
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <div>
              <h4 className="mb-2 text-xs text-gray-600">Submission Date</h4>
              <p>{dateFormat.fullDateTime(new Date(), { showTime: false })}</p>
            </div>
            <div>
              <h4 className="mb-2 text-xs text-gray-600">Total Amount</h4>

              <p>
                $ {selectObject?.reduce((t, i) => t + +i.potentialPayout, 0)}
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-xs text-gray-600">Academic Session</h4>
              <p>2025-2026</p>
            </div>
            <div>
              <h4 className="mb-2 text-xs text-gray-600">
                Apply For Students Claimed
              </h4>
              <p>{selectObject?.length}</p>
            </div>
          </div>
        </div>
      }
      triggerContent={
        <ActionButton
          type="button"
          disabled={selectObject?.length === 0}
          variant="primary"
          buttonContent="Generate Invoice"
          btnStyle="text-white"
          handleOpen={() => onDraftInvoiceClick(selectedIds)}
        />
      }
      style="w-[70%] lg:w-[60%]"
    >
      <div>
        <InvoiceGeneration
          setOpen={setOpen}
          data={selectObject}
          selectedIds={selectedIds}
          selectObject={selectObject}
        />
      </div>
    </DialogWrapper>
  );
};

export default InvoiceGenerateModal;
