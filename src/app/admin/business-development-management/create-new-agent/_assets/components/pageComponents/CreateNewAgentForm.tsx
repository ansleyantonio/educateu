// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm, useWatch } from "react-hook-form";

// import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
// import { showToast } from "@/components/common/TostMessage/customTostMessage";
// import { Button } from "@/components/ui/button";
// import { Form } from "@/components/ui/form";
// import { useAuths } from "@/hooks/userContext";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import { Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
// import { z } from "zod";
// import { CreateAgentFormSchema } from "../../interface/CreateAgentSchema";
// import Form_field from "./form_field";

// const CreateNewAgentForm = ({ setOpen }: { setOpen: any }) => {
//   const auth = useAuths();
//   const token = auth?.user?.token as string;
//   const queryClient = useQueryClient();
//   const route = useRouter();

//   const form = useForm<z.infer<typeof CreateAgentFormSchema>>({
//     resolver: zodResolver(CreateAgentFormSchema),
//     defaultValues: {
//       username: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       password: "",
//       mobile: "",
//       // roleId: "",
//       agentType: "",
//       commissionTemplate: "",
//       companyName: "",
//       startDate: undefined,
//       endDate: undefined,
//       address: "",
//       note: "",
//       agreementStatus: true,
//     },
//     // install error message check
//     mode: "onChange",
//   });

//   // createNewSubAgentMutation
//   const createNewAgentMutation = useApiMutation({
//     method: "POST",
//     path: "business-development-management/register",
//     onSuccess: () => {
//       route.push("/admin/business-development-management/");
//       toast.success("Successfully created Agent!");
//       form.reset();
//       setOpen(false);
//       queryClient.invalidateQueries({ queryKey: ["fetch-list-of-agents"] });
//     },
//     onError: (error: any) => {
//       console.log("error", error?.response);
//       if (error) {
//         showToast("error", error);
//       }
//     },
//   });

//   // -------------------------real time check  start -------------------------------------------

//   const username = useWatch({
//     control: form.control,
//     name: "username",
//   });

//   const email = useWatch({
//     control: form.control,
//     name: "email",
//   });

//   const checkUserExistence = async (field: string, value: string) => {
//     if (!value) return null;
//     const response = await axios.get(
//       `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/check-user?username=${username}&email=${email}&portal=agent`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return response.data.exists; // Assume API returns { exists: true/false }
//   };
//   const useCheckUserExistence = (field: string, value: string) => {
//     return useQuery({
//       queryKey: ["check-user", field, value],
//       queryFn: () => checkUserExistence(field, value),
//       enabled: !!value, // Only run query if value exists
//       staleTime: 1000 * 10, // Cache for 10 seconds
//     });
//   };
//   const usernameQuery = useCheckUserExistence(
//     "username",
//     form.watch("username")
//   );

//   // console.log("watch username", form.watch("username"));

//   const emailQuery = useCheckUserExistence("email", form.watch("email"));
//   const mobileQuery = useCheckUserExistence("mobile", form.watch("mobile"));
//   // -------------------------real time check  end -------------------------------------------

//   //. Define a submit handler.
//   function onSubmit(values: z.infer<typeof CreateAgentFormSchema>) {
//     // console.log("VALUES in ON SUBMIT", values);
//     if (values.agreementStatus === true) {
//       createNewAgentMutation.mutate(values);
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         <Form_field
//           usernameQuery={usernameQuery}
//           emailQuery={emailQuery}
//           // mobileQuery={mobileQuery}
//           form={form}
//         />

//         {/* login button  */}
//         <div className="flex gap-x-3 justify-end items-center">
//           <Button
//             onClick={() => setOpen(false)}
//             type="button"
//             variant="outline"
//           >
//             Review Agreement
//           </Button>
//           <Button
//             type="submit"
//             className="py-2 px-8 active:scale-75 bg-[#013E5B] hover:bg-[#73b7d6]"
//             disabled={createNewAgentMutation?.isPending}
//           >
//             {" "}
//             submit
//             {createNewAgentMutation?.isPending && (
//               <Loader2 className="animate-spin" />
//             )}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// };

// export default CreateNewAgentForm;


/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import { CreateAgentFormSchema } from "../../interface/CreateAgentSchema";
import Form_field from "./form_field";
import onFormError from "@/utils/formError";

const CreateNewAgentForm = ({ setOpen }: { setOpen: any }) => {
  const auth = useAuths();
  const token = auth?.user?.token as string;
  const queryClient = useQueryClient();
  const route = useRouter();

  // ✅ react-hook-form setup
  const form = useForm<z.infer<typeof CreateAgentFormSchema>>({
    resolver: zodResolver(CreateAgentFormSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobile: "",
      awardingBodyTemplates: [], // ✅ only keep awardingBodyTemplates
      agentType: undefined,
      companyName: "",
      startDate: undefined,
      endDate: undefined,
      address: "",
      note: "",
      agreementStatus: true,
      TFieldValues: "",
    },
    mode: "onChange",
  });

  // ✅ mutation for create agent
  const createNewAgentMutation = useApiMutation({
    method: "POST",
    path: "business-development-management/register",
    onSuccess: () => {
      route.push("/admin/business-development-management/");
      toast.success("Successfully created Agent!");
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-agents"] });
    },
    onError: (error: any) => {
      console.log("error", error?.response);
      if (error) {
        showToast("error", error);
      }
    },
  });

  // ---------------- Real-time user existence check ----------------
  const username = useWatch({ control: form.control, name: "username" });
  const email = useWatch({ control: form.control, name: "email" });

  const checkUserExistence = async (field: string, value: string) => {
    if (!value) return null;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/check-user?username=${username}&email=${email}&portal=agent`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.exists; // { exists: true/false }
  };

  const useCheckUserExistence = (field: string, value: string) => {
    return useQuery({
      queryKey: ["check-user", field, value],
      queryFn: () => checkUserExistence(field, value),
      enabled: !!value,
      staleTime: 1000 * 10,
    });
  };

  const usernameQuery = useCheckUserExistence("username", username);
  const emailQuery = useCheckUserExistence("email", email);
  // -----------------------------------------------------------------

  // ✅ Submit handler
  function onSubmit(values: z.infer<typeof CreateAgentFormSchema>) {
    console.log("VALUES in ON SUBMIT", values);

    // safeguard — although Zod already enforces it
    const hasIncompleteTemplates = (values.awardingBodyTemplates ?? []).some(
      (t) => !t.awardingBodyId || !t.commissionTemplateId
    );

    if (hasIncompleteTemplates) {
      toast.error("Please select commission templates for all awarding bodies");
      return;
    }

    if (values.agreementStatus === true) {
      createNewAgentMutation.mutate(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-4">
        {/* ✅ all actual fields rendered inside Form_field */}
        <Form_field
          usernameQuery={usernameQuery}
          emailQuery={emailQuery}
          form={form}
        />

        {/* Actions */}
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            type="submit"
            className="py-2 px-8 active:scale-75 bg-[#013E5B] hover:bg-[#73b7d6]"
            disabled={createNewAgentMutation?.isPending}
          >
            Create
            {createNewAgentMutation?.isPending && (
              <Loader2 className="animate-spin ml-2" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateNewAgentForm;

