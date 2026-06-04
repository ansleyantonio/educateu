/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { Agent } from "../../../schema/viewAgentListType";
import Ava from "/public/assets/logo/agent/admin/Avatar.png";

const UserInfo = ({ user }: { user: Agent }) => {
  return (
    <div className="flex gap-x-3 justify-start items-center">
      <div className="relative w-10 h-10">
        <Image alt="logo" src={Ava} fill className="object-fill absolute" />
      </div>
      <div className="space-y-1">
        <div className="flex gap-x-1 text-sm font-semibold capitalize text-[#101828]">
          <p>{user?.firstName}</p>
          <p>{user?.lastName}</p>
        </div>
        <p className="text-[#475467]"> {user?.username}</p>
      </div>
    </div>
  );
};

export default UserInfo;
