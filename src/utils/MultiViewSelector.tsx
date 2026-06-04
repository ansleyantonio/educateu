/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, Select, Space, Tag } from "antd";
import { CustomTagProps } from "rc-select/lib/BaseSelect";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

// Avatar with Fallback
const AvatarWithFallback = ({
  image,
  label,
}: {
  image?: string;
  label: string;
}) => (
  <Space>
    <Avatar src={image || undefined} size={16} style={{ fontSize: 10 }}>
      {!image && label[0]?.toUpperCase()}
    </Avatar>
  </Space>
);

// Props Interface
interface MultiViewSelectorProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  isImage?: boolean;
  options: any[];
}

// Main Component
const MultiViewSelector = <T extends FieldValues>({
  form,
  name,
  label,
  isImage = false,
  options,
}: MultiViewSelectorProps<T>) => {
  const { control, setValue } = form;

  // Handle change event
  const handleChange = (selected: string[]) => {
    // console.log("Selected:", form.watch());
    setValue(name, selected as any);
  };

  // Render selected tags
  const tagRender = ({ label, value, closable, onClose }: CustomTagProps) => {
    const selectedItem = options.find((opt) => opt.value === value);

    return (
      <Tag
        closable={closable}
        onClose={onClose}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        {isImage && (
          <AvatarWithFallback
            image={selectedItem?.image}
            label={selectedItem?.label || value}
          />
        )}
        {label}
      </Tag>
    );
  };

  // Option Renderer
  const renderOption = (option: any) => (
    <div className="flex gap-2 items-center">
      {isImage && (
        <AvatarWithFallback image={option.image} label={option.label} />
      )}
      <span>{option.label}</span>
    </div>
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              className="custom-multiselect"
              placeholder="Select countries"
              options={options}
              value={field.value || []}
              onChange={handleChange}
              optionRender={({ data }) => renderOption(data)}
              tagRender={tagRender}
              getPopupContainer={(node) => node.parentNode as HTMLElement}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default MultiViewSelector;
