/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";
import { Input } from "@/components/ui/input";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { useState } from "react";
const AwardingBodyInformationInputForm = ({
  form,
  isEdit,
  modulesPerCourses,
}: {
  form: any;
  isEdit: boolean;
  modulesPerCourses?: boolean;
}) => {
  const [searchTerms, setSearchTerms] = useState({
    awardingBodyId: "",
  });

  const { options: awardingBodyOptions } = DataFetcher.fetchAwardingBodies({
    filter: {
      search: searchTerms.awardingBodyId,
      status: "ACTIVE",
      pageSize: 10,
    },
  });

  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        Awarding Body Information
      </h1>
      <div className="grid grid-cols-2 gap-4 py-6 px-3 rounded-md bg-[#FFFFFF]">
        {/* Awarding Body */}
        {/* <CustomField.SelectField
          form={form}
          name="awardingBodyId"
          labelName="awarding Body"
          placeholder="awarding Body"
          options={awardingBodyOptions}
          optional={false}
          onSearch={(value) =>
            setSearchTerms((prev) => ({ ...prev, awardingBodyId: value }))
          }
        /> */}

        <CustomField.SelectField
          form={form}
          viewOnly={isEdit || modulesPerCourses}
          // viewOnly={isEdit}
          name={"awardingBodyId"}
          labelName={"Awarding Institution Name"}
          placeholder={"Awarding Institution Name"}
          optional={false}
          options={awardingBodyOptions}
          onSearch={(value) =>
            setSearchTerms((prev) => ({ ...prev, awardingBodyId: value }))
          }
        />
        {/* Awarding Body Code */}
        <div className="flex flex-col space-y-3">
          <label className="text-sm font-semibold text-[#272E35]">
            Awarding Body Code
          </label>
          <Input
            className="py-2 px-3 text-sm text-gray-900 bg-white rounded-md border border-gray-200 min-h-[40px]"
            readOnly={true}
            value={
              awardingBodyOptions?.find(
                (item: any) => item.value == form.watch("awardingBodyId")
              )?.code ?? ""
            }
            placeholder="Awarding Body Code"
          />
        </div>
      </div>
    </div>
  );
};

export default AwardingBodyInformationInputForm;
