import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/custom_ui/cus_dialog";
import { ReactNode } from "react";

interface DialogWrapperProps {
  style?: string;
  open: boolean;
  handleOpen: (open: boolean) => void;
  triggerContent?: ReactNode;
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  closer?: boolean;
}

export const DialogWrapper: React.FC<DialogWrapperProps> = ({
  open,
  handleOpen,
  triggerContent,
  title,
  description,
  children,
  closer = true,
  style,
}) => {
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{triggerContent}</DialogTrigger>

      <DialogContent forceMount className={style}>
        {/* Sticky Header */}
        {closer && (
          <DialogHeader
            className={`capitalize bg-background h-fit ${
              title
                ? "py-5 px-2 bg-background border-b"
                : " pt-2 bg-transparent"
            }`}
          >
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogDescription className="hidden">
              {description}
            </DialogDescription>
          </DialogHeader>
        )}

        {/* Main Body */}
        <div className="p-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

/** Usage==>
 * - Uses controlled open/close with `open` and `handleOpen`.
 * - `triggerContent` is the element that opens the dialog.
 * - `title` and `description` show a header if provided.
 * - `children` is the main content inside the dialog.
 * - `closer` shows or hides the dialog header (default: true).
 * - `style` allows custom styling for the dialog content.
 */
