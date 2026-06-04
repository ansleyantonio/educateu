/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import toast from "react-hot-toast";
import { z } from "zod";
import { CreateAwardingBodyFormSchema } from "../interface/CreateAwardingBodySchema";
import Form_field from "./form_field";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { useRouter } from "next/navigation"; 

const CreateNewAwardingBodyForm = ({ setOpen }: { setOpen: any }) => {

  const router = useRouter();

  const form = useForm<z.infer<typeof CreateAwardingBodyFormSchema>>({
    resolver: zodResolver(CreateAwardingBodyFormSchema),
    defaultValues: {
      name: "",
      abbreviation: "",
      intakePeriod: [],
      grades: [{ classification: "", percentageRange: "", ukGpaEquivalent: 0 }],
      selectRequiredDocuments: [],
    },
  });

  const createAwardingBodyMutation = useApiMutation({
    method: "POST",
    path: "awarding-bodies",
    onSuccess: () => {
      toast.success("Successfully created Awarding Body!");
      form.reset();
      setOpen(false);
      router.push("/admin/business-development-management/awarding-body");
    },
    onError: (error: any) => {
      console.error("Error creating awarding body:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create awarding body"
      );
    },
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateAwardingBodyFormSchema>
  > = (data: z.infer<typeof CreateAwardingBodyFormSchema>) => {
    const { grades, ...rest } = data;
    const payload = {
      ...rest,
      code: "1",
      newGrade: grades.map((g) => ({
        ...g,
        ukGpaEquivalent: g.ukGpaEquivalent ?? undefined,
      })),
    };
    createAwardingBodyMutation.mutate(payload);
  };

  const onError: SubmitErrorHandler<
    z.infer<typeof CreateAwardingBodyFormSchema>
  > = (error) => {
    return error;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-4 px-4"
      >
        <Form_field form={form} />

        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => {
              setOpen(false);
              form.reset();
              router.push("/admin/business-development-management/awarding-body");
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="py-2 px-8 active:scale-75 bg-[#013E5B] hover:bg-[#73b7d6]"
            disabled={false}
          >
            {createAwardingBodyMutation?.isPending ? "Creating..." : "Create Awarding Body"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateNewAwardingBodyForm;
