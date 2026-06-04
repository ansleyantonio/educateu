import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  fetchAllAssignableRoleLis,
  fetchAssignedRoleList,
} from "../../query_controller/feetchAssignRole";
import { RoleList } from "./role_list";
import { capitalizeName } from "@/utils/capitalizeName/capitalizeName";

interface Role {
  id: string;
  name: string;
}

interface UserInfo {
  id: string;
  firstName?: string;
  lastName?: string;
}

interface RolesData {
  roles: Role[];
}

// refetchFilteredUserList={refetchFilteredUserList}

interface Props {
  id: string;
  // category: string;
  isOpen: boolean;
  closeModal: () => void;
  refetchFilteredUserList?: () => void;
  // setCategory: (category: string) => void;
  userInfo?: UserInfo[];
}

export function AssignRoleModal({ id, isOpen, closeModal,refetchFilteredUserList,userInfo }: Props) {
  const token = useAuths()?.user?.token as string;

  // const [assignableRoleListResult, assignedRoleList] = useQueries({
  //   queries: [
  //     {
  //       queryKey: ["assignable_role_list", { token, id }],
  //       queryFn: fetchAllAssignableRoleLis,
  //       // enabled: !!isOpen && !!id,
  //     },
  //     {
  //       queryKey: ["assigned-role-list", { id, token }],
  //       queryFn: fetchAssignedRoleList,
  //       // enabled: !!isOpen && !!id,
  //     },
  //   ],
  // });

  const { data: assignableRoleList, isLoading: assignableRolLoading } =
    useQuery({
      queryKey: ["assignable_role_list", { id, token }],
      queryFn: fetchAllAssignableRoleLis,
      enabled: !!isOpen && !!id,
    });

  const { data: assignRoleList, isLoading: assignRoleLoading } = useQuery({
    queryKey: ["assign_role_list", { id, token }],
    queryFn: fetchAssignedRoleList,
    enabled: !!isOpen && !!id,
  });

  const isLoading = assignableRolLoading || assignRoleLoading;

  const allRoleList = {
    admin: [
      {
        roleId: "676fcf37-1ad9-4125-b25a-eff1726528b0",
        roleName: "admin",
      },
      {
        roleId: "d4b5a197-4cf4-4268-8ef2-f9b2659d05d5",
        roleName: "Welbeing Officeer",
      },
    ],
    agent: [
      {
        roleId: "0016bc23-dac5-4b51-890f-1589966a888d",
        roleName: "agent",
      },
      {
        roleId: "c960125d-2339-4fb7-afe5-9c637e17ccdf",
        roleName: "subagent",
      },
    ],
  };

  const AlredalyRoleAssign = {
    agent: [
      {
        roleId: "0016bc23-dac5-4b51-890f-1589966a888d",
        roleName: "agent",
      },
    ],
  };
  //   const AlredalyRoleAssign = {
  //     "admin": [
  //         {
  //             "roleId": "3",
  //             "roleName": "HR"
  //         }
  //     ],
  //     "agent": [
  //         {
  //             "roleId": "6",
  //             "roleName": "SubAgent"
  //         }
  //     ]
  // }

  if (isLoading || assignableRolLoading || assignRoleLoading || !id) {
    return (
      <div className="flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  // console.log(
  //   "assignableRoleList atik---------------",
  //   assignableRoleList?.data
  // );
  // console.log("assignRoleList bbb---------------", assignRoleList?.data);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="w-full max-h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Assign Role{" "}
            {userInfo &&
              userInfo.length > 0 &&
              ` to ${capitalizeName(userInfo[0].firstName)} ${capitalizeName(
                userInfo[0].lastName
            )}`} 
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>

        <Suspense fallback={<p>Loading feed...</p>}>
          <RoleList
            id={id}
            allRoleList={assignableRoleList?.data?.allRoleList}
            // allRoleList={allRoleList}
            // assignedRoleData={AlredalyRoleAssign}
            assignedRoleData={assignRoleList?.data?.assignedRoleData}
            // roleAssignMutation={roleAssignMutation}
            isLoading={isLoading}
            closeModal={closeModal}
            refetchFilteredUserList={refetchFilteredUserList}
            // isOpen={isOpen} // Pass isOpen to RoleList
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
