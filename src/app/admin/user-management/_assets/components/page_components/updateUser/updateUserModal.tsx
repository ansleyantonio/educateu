/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { capitalizeName } from "@/utils/capitalizeName/capitalizeName";
import { useQuery } from "@tanstack/react-query";
import { fetchListOfPortalList } from "../../../query_controller/fetchListOfPortalList";
import UpdateUserForm from "./UpdateUserForm";

export function UpdateUserModal({
  user,
  open,
  setOpen,
  onSuccess,
  refetchFilteredUserList,
  userInfo,
}: any) {
  const auth = useAuths();
  const token = auth?.user?.token;
  // const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["fetch-list-of-portal", { token }],
    queryFn: fetchListOfPortalList,
  });

  // console.log("data all portal", data);
  return (
    <>
      {/* <DialogWrapper
        title={
          <h1 className="py-1 px-6 text-base font-bold leading-6 text-[#000000]">
            Update User{" "}
            {userInfo &&
              userInfo.length > 0 &&
              ` for ${capitalizeName(userInfo[0].firstName)} ${capitalizeName(
                userInfo[0].lastName
              )}`}
          </h1>
        }
        open={open}
        handleOpen={() => setOpen(!open)}
      >
        <div className="p-6">
          <UpdateUserForm
            user={user}
            isLoading={isLoading}
            portalList={data}
            setOpen={setOpen}
            onSuccess={onSuccess}
            refetchFilteredUserList={refetchFilteredUserList}
          />
        </div>
      </DialogWrapper> */}
      <Dialog open={open} onOpenChange={setOpen}>
        {/* <DialogTrigger asChild></DialogTrigger> */}
        <DialogContent className="w-full max-h-[85%] overflow-y-auto">
          <DialogHeader className="hidden">
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="mt-3 mr-6 rounded-md">
            <h1 className="py-1 px-6 text-base font-bold leading-6 text-[#000000]">
              Update User{" "}
              {userInfo &&
                userInfo.length > 0 &&
                ` for ${capitalizeName(userInfo[0].firstName)} ${capitalizeName(
                  userInfo[0].lastName
                )}`}
            </h1>

            <div className="p-6">
              <UpdateUserForm
                user={user}
                isLoading={isLoading}
                portalList={data}
                setOpen={setOpen}
                onSuccess={onSuccess}
                refetchFilteredUserList={refetchFilteredUserList}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
