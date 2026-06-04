import { fetchAssignedModule } from "@/app/admin/user-management/_assets/query_controller/fetchAssignedModule";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { useQuery } from "@tanstack/react-query";
import { TemporaryAccessForm } from "./temporary_form";
import { Loader2 } from "lucide-react";
import { capitalizeName } from "@/utils/capitalizeName/capitalizeName";


interface UserInfo {
  id: string;
  firstName?: string;
  lastName?: string;
}
interface Props {
  id: string[];
  isOpen: boolean;
  category?: string;
  lotOfUser?: boolean;
  closeModal: () => void;
  userInfo?: UserInfo[];
}

export function TemporaryAccessModal({
  id,
  isOpen,
  closeModal,
  category,
  lotOfUser,
  userInfo
}: Props) {
  const isBlankModuleAssign =
    category == "" || category == "all" || category == undefined;
  const Category = isBlankModuleAssign ? undefined : category;

  const user = useAuths();
  const token: string | undefined = user?.user?.token;

  const { data, isLoading } = useQuery({
    queryKey: ["assign-module", { id, token, Category, lotOfUser }],
    queryFn: fetchAssignedModule,
    enabled: !!isOpen && !!id,
  });

  // Check if there are no userModules
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="w-full md:min-w-[75%] xl:min-w-[45%] 2xl:min-w-[35%]  max-h-[85%] overflow-y-auto">
        <DialogHeader
          className={`${Number(data?.userModules?.length) === 0 ? "hidden" : null}`}
        >
          <DialogTitle>
            Temporary Access Management{" "}
            {userInfo &&
              userInfo.length > 0 &&
              ` to ${capitalizeName(userInfo[0].firstName)} ${capitalizeName(
                userInfo[0].lastName
              )}`}
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div>
          {/* <TemporaryAccessForm */}

          {!data?.userModules?.length ? (
            isLoading || data?.userModules === undefined ? (
              <div className="flex justify-center items-center">
                <Loader2 size={55} strokeWidth={2} className="animate-spin" />
              </div>
            ) : (
              <div className="flex justify-center items-center h-40 rounded-lg shadow-md bg-muted">
                <p className="text-lg font-medium text-gray-600">
                  No Portal Category Assigned Yet
                </p>
              </div>
            )
          ) : (
            <TemporaryAccessForm
              token={token}
              id={id}
              data={data}
              isLoading={isLoading}
              closeModal={closeModal}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
