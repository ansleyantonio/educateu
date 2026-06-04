/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Ava from "/public/assets/logo/agent/admin/Avatar.png";

const ApplicantINfo = ({ user }: { user: any }) => {
  return (
    <div className="flex justify-start items-center gap-x-3">
      <div className="w-10 h-10 relative">
        <Image alt="logo" src={Ava} fill className="absolute object-fill" />
      </div>
      <div className=" space-y-1">
        <div className="flex gap-x-1 text-sm text-[#101828] font-bold capitalize">
          <p className="font-bold text-black">{user?.name}</p>
          <p>{user?.lastName}</p>
        </div>
        <p className="text-[#475467]"> {user?.username}</p>
      </div>
    </div>
  );
};

export default ApplicantINfo;
