import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface SelectComponentProps {
  label?: string;
  options: Option[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  errorMessage?: string;
  className?: string;
}

export const SelectComponent = ({
  label,
  options,
  placeholder = "(None)",
  value,
  onChange,
  required = false,
  errorMessage,
  className = "",
}: SelectComponentProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Optional Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Optional Error Message */}
      {required && !value && errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};
