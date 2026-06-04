/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { TextCaseFormat } from "@/utils/textFormate";
import type { ConfigProviderProps } from "antd";
import { Avatar, Select, Space } from "antd";
import Image from "next/image";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

type SizeType = ConfigProviderProps["componentSize"];

/**
 * Renders an avatar with fallback support:
 * - Emoji (e.g. "🇺🇸")
 * - Image (flag or avatar or anyOne google image)
 * - First letter fallback if no image is available
 */
const AvatarWithFallback = ({
  image,
  label,
  size = 20,
  isFlag = true,
}: {
  image?: string;
  label: string;
  size?: number;
  isFlag?: boolean;
}) => {
  // Handle emoji (single character) vs URL
  const isEmoji = (str: string) => {
    return typeof str === "string" && !str.startsWith("http");
  };
  // if emoji provided
  if (image && isEmoji(image)) {
    return (
      <span role="img" aria-label={label} style={{ fontSize: size }}>
        {image}
      </span>
    );
  }

  if (isFlag) {
    if (!image) {
      return (
        !image && (
          <span className="p-1 bg-gray-200">{label[0]?.toUpperCase()} </span>
        )
      );
    }
    return <Image src={image || ""} alt={label} width={size} height={size} />;
  }
  return (
    <Avatar
      src={image || undefined}
      size={size}
      style={{
        // fontSize: size * 0.5,
        objectFit: "cover",
      }}
    >
      {!image && label[0]?.toUpperCase()}
    </Avatar>
  );
};

//Represents a dropdown option.
interface OptionType {
  label: string;
  value: string | number | boolean;
  image?: string;
  disabled?: boolean;
}

// Props for the SelectField component
interface SelectFieldProps<T extends FieldValues> {
  form?: UseFormReturn<T> | any;
  name: Path<T>;
  placeholder: string;
  labelName?: string;
  options?: (string | OptionType)[];
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  showSearch?: boolean;
  isImageShow?: boolean;
  isFlag?: boolean;
  type?: "single" | "multiple";
  onValueChange?: (value: any) => void; // optional callback for value changes
  isLoading?: boolean;
  onSearch?: (value: string) => void;
  size?: SizeType;
}

/**
 * SelectField is a reusable, typed, react-hook-form-compatible dropdown field.
 * - Supports avatars, emojis, or text fallback
 * - Supports single or multi-select
 * - Integrates Ant Design's <Select>
 */

export const SelectField = <T extends FieldValues>({
  form,
  name,
  labelName,
  optional = true,
  disabled = false,
  options = [],
  placeholder = "Select an option",
  showSearch = true,
  isImageShow = false,
  isFlag = false,
  type = "single",
  viewOnly = false,
  onValueChange,
  isLoading = false,
  onSearch,
  size = "large",
}: SelectFieldProps<T>) => {
  let transformedOptions: OptionType[] = options?.map((option) => {
    if (typeof option === "string") {
      return {
        label: TextCaseFormat(option),
        value: option,
      };
    }
    return option;
  });

  // If loading or no options, override with a disabled message
  if (isLoading) {
    transformedOptions = [
      { label: "Loading...", value: "loading", disabled: true },
    ];
  } else if (transformedOptions.length === 0) {
    transformedOptions = [
      { label: "No options available", value: "no-options", disabled: true },
    ];
  }

  // Renders each dropdown option in the list
  const renderOption = (option: OptionType) => (
    <Space>
      {isImageShow && (
        <AvatarWithFallback
          image={option.image}
          label={option.label}
          size={20}
          isFlag={isFlag}
        />
      )}
      <span>{option.label}</span>
    </Space>
  );

  // Renders the selected value (visible inside the input field)
  const renderLabel = (option: OptionType) => (
    <Space>
      {isImageShow && (
        <AvatarWithFallback
          image={option.image}
          label={option.label}
          size={16}
        />
      )}
      <span>{option.label}</span>
    </Space>
  );

  //

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const error = form.formState.errors?.[name];
        const isError = !!error;
        // Check which option matches
        const match = transformedOptions.find((opt) => {
          if (Array.isArray(field.value)) {
            return field.value.includes(opt.value);
          }
          return field.value === opt.value;
        });
        // Find selected option for custom label rendering
        const selectedOption = transformedOptions.find(
          (opt) => opt.value === field.value
        );

        const selectedValue = field.value;

        const displaySingle =
          transformedOptions.find((opt) => opt.value === field.value)?.label ||
          "-";

        const displayMultiple =
          Array.isArray(selectedValue) && type === "multiple"
            ? selectedValue
                .map(
                  (val: string) =>
                    transformedOptions.find((opt) => opt.value === val)
                      ?.label || val
                )
                .join(", ")
            : "-";

        return (
          <FormItem>
            {labelName && (
              <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
                {TextCaseFormat(labelName)}
                {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
              </label>
            )}

            {viewOnly ? (
              <div className="flex items-center px-3 text-sm text-gray-900 capitalize bg-white rounded-md border border-gray-200 min-h-[40px]">
                <p>{type === "multiple" ? displayMultiple : displaySingle}</p>
              </div>
            ) : (
              <>
                <FormControl>
                  <div className="relative w-full">
                    <Select
                      size={size}
                      showSearch={showSearch}
                      onSearch={onSearch}
                      style={{
                        width: "100%",
                        height: "40px",
                      }}
                      mode={type === "multiple" ? "multiple" : undefined}
                      placeholder={TextCaseFormat(placeholder)}
                      value={field.value || undefined}
                      onChange={(value, option) => {
                        field.onChange(value); // update react-hook-form state
                        if (onValueChange) {
                          onValueChange(value); // call your custom callback if provided
                        }
                      }}
                      onBlur={(f) => {
                        field.onBlur();
                      }}
                      options={transformedOptions}
                      disabled={disabled}
                      status={isError ? "error" : undefined}
                      className={`custom-disabled-select focus-visible:ring-0 focus-visible:ring-offset-0`}
                      // Custom option renderer
                      optionRender={({ data }) => renderOption(data)}
                      // Custom label renderer for selected value
                      labelRender={({ label, value }) => {
                        if (isImageShow && selectedOption) {
                          return renderLabel(selectedOption);
                        }
                        return label;
                      }}
                      // Search filter function
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      // Popup container
                      getPopupContainer={(node) =>
                        node.parentNode as HTMLElement
                      }
                      // Additional props for better multiple selection handling
                      maxTagCount={
                        type === "multiple" ? "responsive" : undefined
                      }
                      maxTagPlaceholder={(omittedValues) =>
                        `+${omittedValues.length} more`
                      }
                      dropdownRender={(menu) => (
                        <div className="[&_.ant-select-item-option-content]:whitespace-normal [&_.ant-select-item-option-content]:break-words [&_.ant-select-item-option-content]:leading-snug">
                          {menu}
                        </div>
                      )}
                    />
                    {field.value && (
                      <button
                        type="button"
                        className="
                          absolute right-3 top-1/2 -translate-y-1/2 
                          text-gray-400 hover:text-gray-600
                        "
                        onClick={() =>
                          field.onChange(type === "multiple" ? [] : null)
                        }
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </>
            )}
          </FormItem>
        );
      }}
    />
  );
};
