/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { z } from "zod";
import Form_field from "./form_field";
import { UpdateAwardingBodyFormSchema } from "../interface/CreateAwardingBodySchema";
import { AwardingBody } from "./Schema/viewAwardingBody";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import toast from "react-hot-toast";
import ActionButton from "@/components/common/button/actionButton";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  data: AwardingBody[];
  isOpen: boolean;
  awardingBodyId: string | null;
  isDisabled: boolean;
  setOpen: (value: boolean) => void;
  setisDisabled: (value: boolean) => void;
  refetchData?: () => void;
}

export function AwardingBodyEditModal({
  isOpen,
  awardingBodyId,
  isDisabled,
  setisDisabled,
  setOpen,
  data,
}: Props) {
  const queryClient = useQueryClient();
  const awardingBody = awardingBodyId
    ? data?.find((award) => award.id === awardingBodyId)
    : undefined;

  const form = useForm<z.infer<typeof UpdateAwardingBodyFormSchema>>({
    resolver: zodResolver(UpdateAwardingBodyFormSchema),
    defaultValues: {},
  });

  const { mutate, isPending } = useApiMutation({
    method: "PATCH",
    path: `awarding-bodies/${awardingBodyId}`,
    onSuccess: (data) => {
      setisDisabled(false);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-awarding-bodies"] });
      toast.success("Awarding Body Updated Successfully");
      
    },
    onError: (error) => {
      console.error("Update failed:", error);
      setisDisabled(false);
    },
  });

  useEffect(() => {
    if (awardingBody) {
      form.reset({
        name: awardingBody.name,
        abbreviation: awardingBody.abbreviation,
        status: awardingBody.status,
        intakePeriod: awardingBody?.intakePeriods as (
          "january-april" | "may-august" | "september-december"
        )[],
        selectRequiredDocuments: awardingBody?.requiredDocuments as (
          | "passport-id"
          | "transcripts"
          | "essay"
          | "cv"
          | "proof-of-name-change"
          | "english-certificates"
          | "personal-statement"
          | "qualification"
          | "other"
          | "consent-form"
          | "national-identification"
          | "police-clearance"
          | "references"
        )[],
        grades: awardingBody.grades || [],
      });
    }
  }, [awardingBody, form]);

  const onSubmit = (formData: z.infer<typeof UpdateAwardingBodyFormSchema>) => {
    setisDisabled(true);

    const payload = {
      name: formData.name,
      code: formData.abbreviation,
      abbreviation: formData.abbreviation,
      status: formData.status,
      intakePeriod: formData?.intakePeriod,
      newGrade: formData.grades?.map((g) => ({
        classification: g.classification,
        percentageRange: g.percentageRange,
        ukGpaEquivalent: g.ukGpaEquivalent,
      })),
      selectRequiredDocuments: formData.selectRequiredDocuments,
    };
    mutate(payload);
  };

  const onError: SubmitErrorHandler<z.infer<typeof UpdateAwardingBodyFormSchema>> = (errors) => {
    console.log("Form errors:", errors);
    return errors;
  };

  return (
    <Dialog onOpenChange={setOpen} open={isOpen}>
      <DialogTrigger asChild className="hidden"></DialogTrigger>

      <DialogContent className="min-w-[85%] max-h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isDisabled ? "View Awarding Body" : "Edit Awarding Body"}</DialogTitle>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
              <Form_field form={form} isDisabled={isDisabled} />

                <div className="flex gap-x-3 justify-end items-center">
                  <ActionButton type="submit" buttonContent="Submit" loadingContent="Updating..." disabled={isDisabled} isPending={isPending}/>
                </div>
              
            </form>
          </Form>
        </div>
        <DialogFooter className="hidden"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}