/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AgentFormData, AgentSchema } from "../../schema/agentSchema";
import { FormInput } from "./formInputField";
import edit from "/public/assets/logo/dashboard_management/edit-02.svg";

interface agentDataProps {
  role: string;
  token: string;
  id: string;
  agentInfo: any;
}

interface FormData {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string | null;
  username?: string;
  address?: string;
  userStatus?: string;
  companyName?: string;
  agreementExpiryDate?: string;
  potentialPayment?: string;
  awardingBody?: number;
  commissionRate?: string;
  agreementStatus?: boolean;
  applicationCount?: number;
  potentialPayout?: string;
  expiryDate?: string;
  agentName?: string;
  agentStatus?: string;
  subAgentCount?: number;
}

const ProfileViewForm = ({ role, id, agentInfo }: agentDataProps) => {
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  // console.log("test agent info", role);

  const form = useForm<AgentFormData>({
    resolver: zodResolver(AgentSchema.profileFormSchema),
    defaultValues: AgentSchema.agentDefaultValues(agentInfo),
  });

  const mutation = useApiMutation({
    path: `agent/${id}`,
    method: "PATCH",
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agent-profile"] });
      toast.success(data?.message);
      setIsEdit(false);
    },
  });

  const onSubmit = (data: FormData) => {
    const body = {
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
      mobile: data.mobile,
      email: data.email,
    };

    mutation.mutate(body);
  };

  return (
    <div className="mt-6 rounded-md border border-[#EAEDF0]">
      <div className="flex justify-between items-center py-4 px-6">
        <h1 className="text-base font-medium text-[#000000]">
          Profile Information
        </h1>
        {!isEdit ? (
          <Button variant="primary" onClick={() => setIsEdit(true)}>
            <Image
              src={edit}
              alt="edit"
              width={16}
              height={16}
              className="mr-2"
            />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2 items-center">
            <ActionButton
              icon={<Save />}
              buttonContent="Save"
              handleOpen={form.handleSubmit(onSubmit, onFormError)}
              isPending={mutation.isPending}
              loadingContent="Saving..."
            />

            <Button onClick={() => setIsEdit(false)} variant="outline">
              Cancel
            </Button>
          </div>
        )}
      </div>
      <hr />
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="p-6 mx-auto space-y-6 w-full"
        >
          {" "}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Agent ID */}
            <CustomField.Text
              form={form}
              name="userId"
              labelName={`${role} ID`}
              // optional={false}
              placeholder={`${role} ID`}
              disabled={true}
            />
            {/* <FormInput
              label={`${role} ID`}
              name="userId"
              form={form}
              readOnly={true}
            /> */}
            {/* Agent Name */}
            {/* {!isEdit ? (
              <div className="space-y-2 w-full">
                <Label htmlFor={`${role} Name`} className="capitalize">
                  {`${role} Name`}
                </Label>
                <Input
                  id={`${role} Name`}
                  readOnly
                  value={`${agentInfo?.user?.firstName ?? ""} ${
                    agentInfo?.user?.lastName ?? ""
                  }`}
                  className="w-full"
                />
              </div>
            ) : ( */}
            <>
              <CustomField.Text
                form={form}
                name="firstName"
                labelName={"First Name"}
                optional={false}
                placeholder={"First Name"}
                viewOnly={!isEdit}
              />
              {/* <FormInput
                label="First Name"
                name="firstName"
                form={form}
                readOnly={!isEdit}
                required={true}
              /> */}
              <CustomField.Text
                form={form}
                name="lastName"
                labelName={"Last Name"}
                optional={false}
                placeholder={"Last Name"}
                viewOnly={!isEdit}
              />
            </>
            {/* )} */}
            {/* Email */}
            <CustomField.Text
              form={form}
              name="email"
              labelName={"Email"}
              optional={false}
              placeholder={"Email"}
              viewOnly={!isEdit}
            />
            {/* Mobile */}
            <CustomField.PhoneNumber
              form={form}
              name="mobile"
              labelName={"Mobile"}
              optional={false}
              placeholder={"Mobile"}
              viewOnly={!isEdit}
            />
            {/* <FormInput
              label="Mobile"
              name="mobile"
              form={form}
              readOnly={!isEdit}
              required={true}
            /> */}
            {/* Agent Status */}
            <FormInput
              name="userStatus"
              label={`${role} Status`}
              form={form}
              readOnly={true}
            />
            {/* <CustomField.SingleSelectField
              form={form}
              name="userStatus"
              labelName={`${role} Status`}
              placeholder={`${role} Status`}
              options={["active", "inactive"]}
              viewOnly={true}
            /> */}
            {/* Company Name */}
            <CustomField.Text
              form={form}
              name="companyName"
              labelName={`${role} Company Name`}
              placeholder={"Company Name"}
              viewOnly={!isEdit}
            />
            {/* <FormInput
              label={`${role} Company Name`}
              name="companyName"
              form={form}  <FormInput
              label={`${role} Company Name`}
              name="companyName"
              form={form}
              readOnly={!isEdit}
            />
              readOnly={!isEdit}
            /> */}
            {/* Sub Agent Count */}
            {role === "agent" && (
              <CustomField.Text
                form={form}
                name="subAgentCount"
                labelName={`Number of Sub-Agents`}
                placeholder={"Number of Sub-Agents"}
                disabled={true}
              />
              // <FormInput
              //   label="Number of Sub-Agents"
              //   name="subAgentCount"
              //   form={form}
              //   readOnly={true}
              // />
            )}
            {/* Application Count */}
            <CustomField.Text
              form={form}
              name="applicationCount"
              labelName={`Number of Applications`}
              placeholder={"Number of Applications"}
              disabled={true}
            />

            {/* Commission Rate */}
            <CustomField.Text
              form={form}
              name="awardingBody"
              labelName="Awarding Body"
              placeholder="Awarding Body"
              disabled={true}
            />
            {/* Reporting Name */}
            {role === "sub-agent" && (
              <CustomField.Text
                form={form}
                name="agentName"
                labelName="Reporting Name"
                placeholder="Reporting Name"
                disabled={true}
              />
              // <FormInput
              //   label="Reporting Name"
              //   name="agentName"
              //   form={form}
              //   readOnly={true}
              // />
            )}
            {/* Reporting To */}
            {role === "sub-agent" && (
              <CustomField.Text
                form={form}
                name="reportingTo"
                labelName="Reporting To"
                placeholder="Reporting To"
                disabled={true}
              />
              // <FormInput
              //   label="Reporting To"
              //   name="reportingTo"
              //   form={form}
              //   readOnly={true}
              // />
            )}
            {/* Potential Payout */}

            <CustomField.Text
              form={form}
              name="potentialPayout"
              labelName="Potential Payout"
              placeholder="Potential Payout"
              disabled={true}
            />
            {/* Expiry Date */}
            <CustomField.Text
              form={form}
              name="expiryDate"
              labelName="Agreement Expiry Date"
              placeholder="Agreement Expiry Date"
              disabled={true}
            />
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ProfileViewForm;
