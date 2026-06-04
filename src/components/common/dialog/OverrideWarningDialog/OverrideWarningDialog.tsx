/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { DialogWrapper } from "../common_dialog/common_dialog";
import dateFormat from "@/utils/DateFormatter";
import ActionButton from "../../button/actionButton";

interface OverrideWarningDialogProps {
  needsOverride: boolean;
  setNeedsOverride: (data: boolean) => void;
  updateData: any;
  isUpdating: boolean;
  confirmOverride: () => void;
}

const OverrideWarningDialog = ({
  needsOverride,
  setNeedsOverride,
  updateData,
  isUpdating,
  confirmOverride,
}: OverrideWarningDialogProps) => {
  return (
    <DialogWrapper
      closer={false}
      open={needsOverride}
      handleOpen={setNeedsOverride}
      style="shadow-md p-4"
    >
      <div>
        {/* Header */}
        <div className="flex gap-3 items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <h3 className="text-lg font-semibold text-foreground">
            Recent Changes Detected
          </h3>
        </div>

        {/* Info Text */}
        <div className="flex gap-3 items-start mb-5 text-muted-foreground">
          <Clock className="flex-shrink-0 mt-1 w-5 h-5" />
          <p className="leading-relaxed">
            <span className="font-semibold">
              {updateData?.title} ({updateData?.courseType?.toLowerCase()}
              {updateData?.type?.toLowerCase()})
            </span>{" "}
            was updated{" "}
            <span className="text-amber-500">
              {dateFormat.duration(updateData?.updatedAt)}
            </span>{" "}
            ago. Overriding may cause loss of recent changes.
          </p>
        </div>

        {/* Last Updated Box */}
        <div className="p-2 mb-8 font-semibold rounded-xl border bg-muted/30 border-border">
          <div className="flex gap-2 items-center text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 text-amber-500" />
            <span>
              Last updated:{" "}
              <span className="font-semibold">
                {dateFormat.time12h(
                  updateData?.updatedAt,
                  { local: false },
                  "day",
                )}
              </span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <ActionButton
            type="button"
            handleOpen={() => setNeedsOverride(false)}
            disabled={isUpdating}
            variant="outline"
            buttonContent="Cancel"
          />
          <ActionButton
            handleOpen={confirmOverride}
            buttonContent="Override Changes"
            loadingContent="Updating..."
            isPending={isUpdating}
            btnStyle="bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200/40"
          />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default OverrideWarningDialog;
