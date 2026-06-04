"use client";
import { useState } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
// import { useRouter } from "next/navigation";
import { CreateUsers } from "@/app/admin/user-management/_assets/interface/CreateUserSchema";
import { Button } from "@/components/ui/custom_ui/button";
import { UpdateUserModal } from "@/app/admin/user-management/_assets/components/page_components/updateUser/updateUserModal";
import Ava from "/public/assets/logo/agent/admin/Avatar.png";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { getUserAccess } from "@/utils/permissions/permissions";

const UserInfo = ({
  data,
  showEditButton = false,
  onUpdated = () => {},
}: {
  data: CreateUsers;
  showEditButton?: boolean;
  onUpdated?: () => void;
}) => {
  // const router = useRouter();
  const [openUserUpdateModal, setOpenUserUpdateModal] = useState(false);
  // const [UpdateUser, setUpdateUser] = useState({});
  const [UpdateUser, setUpdateUser] = useState<CreateUsers | null>(null);

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];

  const hasPostAndDeletePermission = getUserAccess(permissions) === "full-access";

  // console.log("Data", data);

  const openUpdateUserHandle = (user: CreateUsers) => {
    setOpenUserUpdateModal(true);
    setUpdateUser(user);
  };

  return (
    <div className="flex flex-col">
      {/* <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#272E35] font-semibold hover:underline flex items-center gap-x-2"
        >
          ⬅️ Go Back
        </button>
      </div> */}

      {/* User Profile Name and User Name */}
      <div className="flex justify-start items-center gap-x-3">
        <div className="w-14 h-14 relative">
          <Image alt="logo" src={Ava} fill className="absolute object-fill" />
        </div>
        {/* <div className=" space-y-1">
          <div className="flex gap-x-1 text-sm text-[#101828] font-bold capitalize">
            <p>{data?.firstName}</p>
            <p>{data?.lastName}</p>
            {showEditButton && (
              <Button
              onClick={() => console.log("Edit clicked")}
              variant="outline"
              className="w-fit"
            >
              <Pencil />
              Edit Profile
            </Button>
            )}
          </div>
        </div> */}
        <div className="space-y-1 w-full">
          <div className="flex justify-between items-center text-sm text-[#101828] font-bold capitalize">
            <div className="flex gap-x-1">
              <p>{data?.firstName}</p>
              <p>{data?.lastName}</p>
            </div>
            {showEditButton && (
              // <Button
              //   onClick={() => openUpdateUserHandle(data)}
              //   variant="outline"
              //   className="w-fit flex items-center gap-1"
              // >
              //   <Pencil className="w-4 h-4" />
              //   Edit Profile
              // </Button>
              <div
                className={
                  !hasPostAndDeletePermission ? "cursor-not-allowed" : ""
                }
              >
                <Button
                  onClick={() => openUpdateUserHandle(data)}
                  variant="outline"
                  disabled={!hasPostAndDeletePermission}
                  className={`w-fit flex items-center gap-1 ${
                    !hasPostAndDeletePermission ? "opacity-50" : ""
                  }`}
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 w-full">
        <div className="border rounded-lg bg-white shadow-sm">
          <div className="border-b bg-gray-100 p-3">
            <h2 className="text-sm font-medium">Personal Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <p className="text-sm text-gray-500">User First Name:</p>
              <p className="text-[14px] font-bold"> {data?.firstName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">User Last Name:</p>
              <p className="text-[14px] font-bold"> {data?.lastName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">User Name:</p>
              <p className="text-[14px] font-bold"> {data?.username}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">User Status:</p>
              <p className="text-[14px] font-bold">{data?.userStatus}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">User Email:</p>
              <p className="text-[14px] font-bold">{data?.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">User Mobile:</p>
              <p className="text-[14px] font-bold">{data?.mobile}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">User Address:</p>
              <p className="text-[14px] font-bold">{data?.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="mt-4 w-full">
        <div className="border rounded-lg bg-white shadow-sm">
          <div className="border-b bg-gray-100 p-3">
            <h2 className="text-sm font-medium">Roles and Portal Categories</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <p className="text-sm text-gray-500">Roles:</p>
              <p className="text-[14px] font-bold ">Admin, Agent</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Portal Categories:</p>
              <p className="text-[14px] font-bold">Admin, Agent</p>
            </div>
          </div>
        </div>
      </div> */}

      <UpdateUserModal
        setOpen={setOpenUserUpdateModal}
        open={openUserUpdateModal}
        user={UpdateUser}
        onSuccess={onUpdated}
      />
    </div>
  );
};

export default UserInfo;
