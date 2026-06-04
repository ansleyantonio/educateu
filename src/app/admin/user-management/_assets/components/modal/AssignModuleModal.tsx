"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { capitalizeName } from "@/utils/capitalizeName/capitalizeName";
import { useQuery } from "@tanstack/react-query";
import { SystemModuleList } from "../../../system-module-permission/_assets/components/page_components/systemModuleList";
import { fetchAssignedModule } from "../../query_controller/fetchAssignedModule";

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
  onAssignSuccess?: () => void;
  userInfo?: UserInfo[];
}

export function AssignModuleModal({
  id,
  isOpen,
  closeModal,
  category,
  lotOfUser,
  onAssignSuccess,
  userInfo,
}: Props) {
  const isBlankModuleAssign =
    category == "" || category == "all" || category == undefined;
  const Category = isBlankModuleAssign ? undefined : category;

  const user = useAuths();
  const token: string | undefined = user?.user?.token;
  // console.log("category", id, category);

  const { data, isLoading } = useQuery({
    queryKey: ["assign-module", { id, token, Category, lotOfUser }],
    queryFn: fetchAssignedModule,
    enabled: !!isOpen && !!id,
  });

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="w-full md:min-w-[75%] xl:min-w-[45%] 2xl:min-w-[35%]  max-h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Assign Module
            {userInfo &&
              userInfo.length > 0 &&
              ` to ${capitalizeName(userInfo[0].firstName)} ${capitalizeName(
                userInfo[0].lastName
              )}`}
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="mt-5">
          <SystemModuleList
            token={token}
            id={id}
            data={data}
            isLoading={isLoading}
            closeModal={closeModal}
            onAssignSuccess={onAssignSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
