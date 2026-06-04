"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleX, Info } from "lucide-react";
import * as React from "react";
import { createRoot } from "react-dom/client";

type AlertType = "success" | "error" | "info";

interface AlertProps {
  type?: AlertType;
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  duration?: number; // auto close in ms
  resolve: (value: boolean) => void;
}

const AlertModal: React.FC<AlertProps> = ({
  type = "info",
  title,
  description,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
  duration,
  resolve,
}) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = (value: boolean) => {
    setOpen(false);
    resolve(value);
  };

  React.useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        handleClose(true);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const renderIcon = () => {
    switch (type) {
      case "error":
        return <CircleX className="h-16 w-16 text-red-600" />;
      case "success":
        return <CheckCircle2 className="h-16 w-16 text-green-600" />;
      case "info":
      default:
        return <Info className="h-16 w-16 text-blue-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center">
            <AnimatePresence>
              <motion.div
                key={type}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {renderIcon()}
              </motion.div>
            </AnimatePresence>
          </div>
          <DialogTitle className="text-center"> {title && title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">{description}</div>
        <DialogFooter>
          <div className="w-full flex items-center  justify-center gap-2 ">
            {showCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClose(false)}
              >
                {cancelText}
              </Button>
            )}
          </div>

          {/* <Button variant="default" onClick={() => handleClose(true)}>
            {confirmText}
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Function to call like SweetAlert
export function showAlert({
  type = "info",
  title,
  description,
  confirmText,
  cancelText,
  showCancel = false,
  duration,
}: {
  type?: AlertType;
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  duration?: number;
}) {
  return new Promise<boolean>((resolve) => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    const root = createRoot(div);
    root.render(
      <AlertModal
        type={type}
        title={title}
        description={description}
        confirmText={confirmText}
        cancelText={cancelText}
        showCancel={showCancel}
        duration={duration}
        resolve={(val) => {
          resolve(val);
          setTimeout(() => {
            root.unmount();
            div.remove();
          }, 300);
        }}
      />
    );
  });
}
