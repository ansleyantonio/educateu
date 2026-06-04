/* eslint-disable @typescript-eslint/no-explicit-any */

import NoDataComponent from "@/components/common/GlobalLoader/empty";
import { TempAccessForm } from "./accessForm";

export function TemporaryListData({ user, setOpen }: any) {
  const permissionData = user?.userModules?.filter(
    (item: any) => item?.portalCategorieName === "admin",
  );

  return (
    <>
      {!permissionData?.length ? (
        <div className="flex justify-center items-center h-40 rounded-lg shadow-md bg-muted">
          <NoDataComponent />
        </div>
      ) : (
        <TempAccessForm permissionData={permissionData} closeModal={setOpen} />
      )}
    </>
  );
}
