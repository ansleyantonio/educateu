/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { AssignRoleModule } from "../../query_controller/assignModule";

interface Role {
  roleId: string;
  roleName: string;
}

interface RoleListProps {
  id: string;
  allRoleList?: Record<string, Role[]>; // Dynamic categories
  assignedRoleData?: Record<string, Role[]>; // Already assigned roles
  closeModal: () => void;
  isLoading: boolean;
  refetchFilteredUserList?: () => void;
}

export function RoleList({
  id,
  assignedRoleData = {}, // Ensure it's always an object
  allRoleList = {}, // Prevents null/undefined errors
  closeModal,
  isLoading,
  refetchFilteredUserList
}: RoleListProps) {
  // console.log("assignedRolelist  defalut role data ====", assignedRoleData);
  // console.log("allRoleList=====", allRoleList);
  const user = useAuths();
  const token: string | undefined = user?.user?.token;
  // Prevent errors when allRoleList is undefined
  const safeAllRoleList = allRoleList ?? {};

  // **Form Validation Schema**
  const formSchema = z.object(
    Object.keys(safeAllRoleList).reduce((acc, category) => {
      acc[category] = z.string().optional(); // Role selection is optional
      return acc;
    }, {} as Record<string, z.ZodOptional<z.ZodString>>)
  );

  // **Default Values** (Pre-select assigned roles if available)
  const defaultValues: Record<string, string> = Object.keys(
    safeAllRoleList
  ).reduce((acc, category) => {
    acc[category] = assignedRoleData[category]?.[0]?.roleName || ""; // Default to first assigned role or empty
    return acc;
  }, {} as Record<string, string>);

  // **Initialize Form**
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset form values when assignedRoleData or safeAllRoleList changes
  useEffect(() => {
    if (!isLoading && Object.keys(safeAllRoleList).length > 0) {
      const defaultValues: Record<string, string> = Object.keys(
        safeAllRoleList
      ).reduce((acc, category) => {
        acc[category] = assignedRoleData[category]?.[0]?.roleName || "";
        return acc;
      }, {} as Record<string, string>);

      form.reset(defaultValues);
    }
  }, [assignedRoleData, safeAllRoleList, isLoading, form]);

  // assign module mutation
  const queryClient = useQueryClient();

  const assignRolMutation = useMutation({
    mutationFn: (formData: any) => AssignRoleModule(formData),
    onSuccess: (data) => {
      // console.log("data.......", data);
      refetchFilteredUserList?.();
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-users"] });
      queryClient.invalidateQueries({ queryKey: ["assign_role_list"] });
      queryClient.invalidateQueries({ queryKey: ["assignable_role_list"] });
      toast.success(data.message);
      if (closeModal) {
        closeModal();
      } // add null check here
    },

    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const formattedData = Object.entries(data).reduce(
      (acc, [category, roleName]) => {
        if (roleName) {
          const role = safeAllRoleList[category]?.find(
            (r) => r.roleName === roleName
          );
          if (role) {
            acc[category] = { roleName: role.roleName, roleId: role.roleId };
          }
        }
        return acc;
      },
      {} as Record<string, { roleName: string; roleId: string }>
    );

    const finalData = {
      userId: id,
      ...formattedData,
    };

    const body = {
      AssignRole: finalData,
      token: token,
    };
    assignRolMutation.mutate(body);
    console.log("Submitted finalData:", finalData);
  };

  if (isLoading) {
    return <p className="text-center text-gray-500">Loading roles...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-2/3">
        {Object.entries(safeAllRoleList).map(([category, roles]) => (
          <div key={category}>
            <h2 className="text-[16px] font-bold uppercase pt-2">{category}</h2>
            <FormField
              control={form.control}
              name={category}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize py-2">Select Role</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      {roles.map(({ roleId, roleName }) => (
                        <FormItem
                          key={roleId}
                          className="flex items-center space-x-3"
                        >
                          <FormControl>
                            <RadioGroupItem value={roleName} />
                          </FormControl>
                          <FormLabel className="!mt-0 !capitalize font-normal">
                            {roleName}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <Button
          type="submit"
          className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}

// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { useAuths } from "@/hooks/userContext";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
// import { z } from "zod";
// import { AssignRoleModule } from "../../query_controller/assignModule";

// interface Role {
//   roleId: string;
//   roleName: string;
// }

// interface RoleListProps {
//   id: string;
//   allRoleList?: Record<string, Role[]>; // Dynamic categories
//   assignedRoleData?: Record<string, Role[]>; // Already assigned roles
//   closeModal: () => void;
//   isLoading: boolean;
//   isOpen: boolean; // Add isOpen to props
// }

// export function RoleList({
//   id,
//   assignedRoleData = {}, // Ensure it's always an object
//   allRoleList = {}, // Prevents null/undefined errors
//   closeModal,
//   isLoading,
//   isOpen, // Destructure isOpen
// }: RoleListProps) {
//   console.log("assignedRoleData====", assignedRoleData);
//   console.log("allRoleList=====", allRoleList);
//   const user = useAuths();
//   const token: string | undefined = user?.user?.token;
//   const safeAllRoleList = allRoleList ?? {};

//   // **Form Validation Schema**
//   const formSchema = z.object(
//     Object.keys(safeAllRoleList).reduce((acc, category) => {
//       acc[category] = z.string().optional(); // Role selection is optional
//       return acc;
//     }, {} as Record<string, z.ZodOptional<z.ZodString>>)
//   );

//   // **Initialize Form**
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//   });

//   // **Set Default Values When Data is Available**
//   useEffect(() => {
//     if (assignedRoleData) {
//       const defaultValues: Record<string, string> = Object.keys(
//         safeAllRoleList
//       ).reduce((acc, category) => {
//         acc[category] = assignedRoleData[category]?.[0]?.roleName || ""; // Default to first assigned role or empty
//         return acc;
//       }, {} as Record<string, string>);
//       form.reset(defaultValues); // Use form.reset to set the default values
//     }
//   }, []);

//   // **Mutation for Assigning Roles**
//   const queryClient = useQueryClient();
//   const assignRolMutation = useMutation({
//     mutationFn: (formData: any) => AssignRoleModule(formData),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["assign-role"] });
//       toast.success(data.message);
//       closeModal?.();
//     },
//     onError: (error) => toast.error(error.message),
//   });

//   const onSubmit = (data: z.infer<typeof formSchema>) => {
//     const formattedData = Object.entries(data).reduce(
//       (acc, [category, roleName]) => {
//         if (roleName) {
//           const role = safeAllRoleList[category]?.find(
//             (r) => r.roleName === roleName
//           );
//           if (role) {
//             acc[category] = { roleName: role.roleName, roleId: role.roleId };
//           }
//         }
//         return acc;
//       },
//       {} as Record<string, { roleName: string; roleId: string }>
//     );

//     const finalData = {
//       userId: id,
//       ...formattedData,
//     };

//     const body = {
//       AssignRole: finalData,
//       token: token,
//     };
//     assignRolMutation.mutate(body);
//   };

//   if (
//     !safeAllRoleList ||
//     isLoading ||
//     Object.keys(safeAllRoleList).length === 0
//   ) {
//     return <p className="text-center text-gray-500">Loading roles...</p>;
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-2/3">
//         {Object.entries(safeAllRoleList).map(([category, roles]) => (
//           <div key={category}>
//             <h2 className="text-[16px] font-bold uppercase pt-2">{category}</h2>
//             <FormField
//               control={form.control}
//               name={category}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="capitalize py-2">Select Role</FormLabel>
//                   <FormControl>
//                     <RadioGroup
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       {roles.map(({ roleId, roleName }) => (
//                         <FormItem
//                           key={roleId}
//                           className="flex items-center space-x-3"
//                         >
//                           <FormControl>
//                             <RadioGroupItem value={roleName} />
//                           </FormControl>
//                           <FormLabel className="!mt-0 !capitalize font-normal">
//                             {roleName}
//                           </FormLabel>
//                         </FormItem>
//                       ))}
//                     </RadioGroup>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//         ))}
//         <Button
//           type="submit"
//           className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
//           disabled={isLoading}
//         >
//           {isLoading ? "Saving..." : "Save"}
//         </Button>
//       </form>
//     </Form>
//   );
// }
