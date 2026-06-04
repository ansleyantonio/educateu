import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { TextCaseFormat } from "@/utils/textFormate";
import { DatePicker as AntDatePicker, Space } from "antd";
import dayjs from "dayjs";
import { DatePickerFieldPropsInterface } from "../interface/inputPropsType";

const { RangePicker } = AntDatePicker;

/**
 * DateRangePickerAnd
 * A reusable Ant Design RangePicker component integrated with react-hook-form.
 *
 * Features:
 * - Supports "future", "previous", and "normal" date selection modes.
 * - Automatically sets today's date range in "current" mode.
 * - Supports disabled and edit-only modes.
 */
export const RangeDatePickerAnd = ({
  form,
  name,
  labelName,
  placeholder,
  optional = true,
  isEditMode = false,
  isDisabled = false,
  mode = "normal",
}: DatePickerFieldPropsInterface) => {
  const now = dayjs();

  const getDisabledDate = (current: dayjs.Dayjs) => {
    if (mode === "future") {
      return current && current > now.endOf("day");
    } else if (mode === "previous") {
      return current && current < now.startOf("day");
    }
    return false;
  };

  //   useEffect(() => {
  //     const currentVal = form.getValues(name);
  //     if (
  //       mode === "current" &&
  //       (!currentVal || !currentVal[0] || !currentVal[1])
  //     ) {
  //       form.setValue(name, [now.toDate(), now.toDate()]);
  //     }
  //   }, [mode, form, name, now]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {labelName && (
            <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
              {TextCaseFormat(labelName)}
              {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
            </label>
          )}
          <FormControl>
            <div className="!w-full">
              <Space direction="vertical" className="w-full">
                <RangePicker
                  className="w-full"
                  placeholder={
                    placeholder
                      ? [
                          TextCaseFormat(placeholder[0]),
                          TextCaseFormat(placeholder[1]),
                        ]
                      : ["Start Date", "End Date"]
                  }
                  disabled={isEditMode || isDisabled}
                  value={
                    Array.isArray(field.value) &&
                    field.value[0] &&
                    field.value[1]
                      ? [dayjs(field.value[0]), dayjs(field.value[1])]
                      : null
                  }
                  onChange={(dates) =>
                    form.setValue(
                      name,
                      dates
                        ? [
                            dates[0]?.format("YYYY-MM-DD"),
                            dates[1]?.format("YYYY-MM-DD"),
                          ]
                        : undefined,
                    )
                  }
                  format="YYYY-MM-DD"
                  // disabledDate={getDisabledDate}
                />
              </Space>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
