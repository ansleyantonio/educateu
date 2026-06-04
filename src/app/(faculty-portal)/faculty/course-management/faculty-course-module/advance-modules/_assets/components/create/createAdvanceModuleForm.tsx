/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  AdvanceModuleSchema,
  IAdvanceModuleForm,
} from "../../schemas/moduleSchema";
import { AdvanceModuleDefaultValue } from "../../utils/advanceModuleDefaultValue";
import Form_field from "../formField/form_field";

const CreateAdvanceModuleForm = ({
  setOpen,
}: {
  setOpen: (data: boolean) => void;
}) => {
  const auth = useAuths();
  const token = auth?.user?.token as string;
  const form = useForm<IAdvanceModuleForm>({
    resolver: zodResolver(AdvanceModuleSchema.create),
    defaultValues: AdvanceModuleDefaultValue(),
  });

  //. Define a submit handler.
  function onSubmit(values: IAdvanceModuleForm) {
    // createNewAgentMutation.mutate(values);
    const newAdvanceModule = RemoveEmptyFields(values);
    console.log("advance Module", newAdvanceModule);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Form_field form={form} />

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit"> submit</Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateAdvanceModuleForm;
