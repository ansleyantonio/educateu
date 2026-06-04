/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Image } from "antd";
const FileViewModal = ({
  viewType,
  viwPath,
  open,
  setOpen,
  visible,
  setVisible,
}: {
  viewType: string;
  viwPath: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  return (
    <div>
      {viewType === "image" ? (
        <Image
          width={200}
          style={{ display: "none" }}
          alt=""
          src={viwPath}
          preview={{
            visible,
            src: viwPath,
            onVisibleChange: (value: any) => {
              setVisible(value);
            },
          }}
        />
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="hidden" variant="outline"></Button>
          </DialogTrigger>
          <DialogContent className="w-full lg:min-w-[55%] max-h-[85%] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="hidden">Edit profile</DialogTitle>
              <DialogDescription className="hidden"></DialogDescription>
            </DialogHeader>
            <div>
              <iframe
                // style={{ display: "none" }}
                src={viwPath}
                width="100%"
                height="600"
              ></iframe>
            </div>
            <DialogFooter className="hidden">
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        // pdf file show
      )}
    </div>
  );
};

export default FileViewModal;
