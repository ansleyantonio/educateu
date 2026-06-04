/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import Image from "next/image";
import { CustomField } from "../../fields/cusInputField";
import info from "/public/assets/logo/application/Info.svg";

const Criminal_background_step_9 = ({ form, viewOnly = false }: any) => {
  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  const isDisabled = viewOnly || !hasPostAndDeletePermission;
  const offenseOrPenaltyRowValue = form.watch(
    "criminalBackground.offenseOrPenalty"
  );
  const offenseOrPenalty = offenseOrPenaltyRowValue === "YES";

  const disqualificationOrSanctionRowValue = form.watch(
    "criminalBackground.disqualificationOrSanction"
  );
  const disqualificationOrSanction =
    disqualificationOrSanctionRowValue === "YES";

  return (
    <div className="">
      <div className="flex justify-start gap-2 items-center">
        <p className="text-sm text-[#272E35] font-bold leading-6 tracking-[0.02em]">
          It is mandatory to complete this section. If it is not complete the
          application will be invalid and will be declined
        </p>

        <Image
          src={info}
          width={15}
          height={15}
          alt="Applicant Avatar"
          className=""
        />
      </div>

      <div className="mt-6">
        <label
          htmlFor="convictions"
          className="text-sm font-normal leading-6 tracking-[0.02em]"
        >
          Have you ever been convicted by the courts, cautioned, reprimanded, or
          given a final warning by the police?
        </label>
        <p className="text-sm font-normal leading-6 tracking-[0.02em] pb-3">
          {` Please give details of offenses, penalties, and dates in the table
          below. (Note that the post you have applied for is exempted under the
          Rehabilitation of Offenders Act (Exceptions Order) 1974, which means
          that all convictions, cautions, reprimands, and final warnings on your
          criminal record need to be disclosed.`}
        </p>

        <CustomField.SelectField
          form={form}
          name="criminalBackground.offenseOrPenalty"
          // labelName="Offense or Penalty"
          options={[
            { value: "YES", label: "Yes" },
            { value: "NO", label: "No" },
          ]}
          placeholder="Select"
          showSearch={false}
          viewOnly={isDisabled}
        />
      </div>
      {/* Details of Judgement or Civil Penalty */}
      <div className="my-6" hidden={!offenseOrPenalty}>
        <CustomField.Text
          form={form}
          name="criminalBackground.offenseOrPenaltyDetails"
          labelName="Details of Judgement or Civil Penalty"
          placeholder="Enter your details of Judgement or Civil Penalty"
          viewOnly={isDisabled}
        />
      </div>
      {/* Do you have Police Clearance? */}
      <div className="my-6">
        <label className="">
          Have you ever been disqualified from working with children or
          vulnerable adults or subject to any other sanctions imposed by a
          regulatory body?
        </label>
        <CustomField.SelectField
          form={form}
          name="criminalBackground.disqualificationOrSanction"
          // labelName="Offense or Penalty"
          options={[
            { value: "YES", label: "Yes" },
            { value: "NO", label: "No" },
          ]}
          placeholder="Select"
          showSearch={false}
          viewOnly={isDisabled}
        />
      </div>
      {/* Detailed info on disqualification or sanctions by a regulatory body */}
      <div className="my-6" hidden={!disqualificationOrSanction}>
        <label className="pb-5">
          Detailed info on disqualification or sanctions by a regulatory body
        </label>
        <CustomField.Text
          form={form}
          name="criminalBackground.disqualificationOrSanctionDetails"
          // labelName=" Detailed info on disqualification or sanctions by a regulatory
          //       body"
          placeholder="Enter your disqualification Or SanctionDetails"
          viewOnly={isDisabled}
        />
      </div>
      {/* Do you have Police Clearance? */}
      <div>
        <label className="">Do you have Police Clearance?</label>

        <CustomField.SelectField
          form={form}
          name="criminalBackground.policeClearance"
          // labelName="Offense or Penalty"
          options={[
            { value: "YES", label: "Yes" },
            { value: "NO", label: "No" },
          ]}
          placeholder="Select"
          showSearch={false}
          viewOnly={isDisabled}
        />
      </div>
    </div>
  );
};

export default Criminal_background_step_9;
