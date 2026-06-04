/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { FormMessage } from "@/components/ui/form";
import { TextCaseFormat } from "@/utils/textFormate";
import { Select, Space } from "antd";
import { Controller } from "react-hook-form";

export const CustomSingleSelect = ({
  control,
  name,
  label,
  options,
  disabled = false,
  optional = false,
}: any) => {
  // console.log("sss", options);
  return (
    <div className="space-y-1">
      {label && (
        <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
          {TextCaseFormat(label)}
          {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
        </label>
      )}
      {/* <label className="cusFormLabel">{label}</label> */}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            showSearch
            style={{ width: "100%", height: "40px" }}
            placeholder="select one country"
            value={field.value ? field.value : undefined}
            onChange={field.onChange}
            options={options}
            disabled={disabled}
            className="custom-disabled-select"
            optionRender={(option) => (
              <Space>
                <span role="img" aria-label={option.data.label}>
                  {option.data.flag}
                </span>
                {/* <Image
                  src={option.data.emoji}
                  width={20}
                  height={20}
                  alt="emoji"
                /> */}

                {option.data.label}
              </Space>
            )}
          />
        )}
      />
      {/* Error message */}
      <FormMessage />
    </div>
  );
};
