/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FieldPropsInterface {
  form?: any;
  name: string;
  placeholder: string;
  labelName?: string;
  options?: string[];
  optional?: boolean;
  disabled?: boolean;
  isArray?: boolean;
  style?: string;
  defaultValue?: any;
  viewOnly?: boolean;
  maxLength?: number;
  suffix?: string;
  mode?: "normal" | "validate";
  customMessage?: React.ReactNode;
  onValueChange?: (value: any) => void;
  isLoading?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface DatePickerFieldPropsInterface {
  form: any;
  name: string;
  labelName?: string;
  optional?: boolean;
  placeholder?: string;
  isEditMode?: boolean;
  isDisabled?: boolean;
  viewOnly?: boolean;
  type?: "date" | "time" | "year" | "month" | "week";
  mode?: "previous" | "future" | "normal" | "current";
  defaultDateSelect?: boolean;
  customMessage?: string;
}

export interface DatePickerProps {
  onChange: (value: Date | null) => void;
  value?: Date | null; // Made optional
  isEditMode?: boolean;
  mode?: "previous" | "future" | "normal" | "current";
}
