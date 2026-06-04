import { MultiSelect } from "react-multi-select-component";

interface IOption {
  label: string;
  value: string;
}

interface MultiSelectorProps {
  options: IOption[];
  label: string;
  selected: [];
  setSelected: (selected: []) => void;
}

export function MultiSelectorComponent({
  label,
  selected,
  setSelected,
  options,
}: MultiSelectorProps) {
  return (
    <div>
      <h1 className="mb-2">{label}</h1>
      <MultiSelect
        options={options}
        value={selected}
        onChange={setSelected}
        labelledBy="Select"
        closeOnChangedValue
      />
    </div>
  );
}
