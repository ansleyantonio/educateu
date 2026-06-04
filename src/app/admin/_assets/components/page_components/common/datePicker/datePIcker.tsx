/* eslint-disable @typescript-eslint/no-explicit-any */
// import { DatePicker, DatePickerProps, Space } from "antd";
// import React from "react";

// const CusDatePicker: React.FC<{
//   onChange: (value: DatePickerProps) => void;
// }> = ({ onChange }) => (
//   <Space direction="vertical">
//     <DatePicker onChange={onChange} />
//   </Space>
// );

// export default CusDatePicker;

import { DatePicker, Space } from "antd";
import dayjs from "dayjs";

interface DatePickerProps {
  onChange: (value: Date | null) => void;
  value?: Date | null; // Made optional
  isEditMode?: boolean;
}

const CusDatePicker: React.FC<DatePickerProps> = ({
  onChange,
  value,
  isEditMode,
}) => {
  const handleDateChange = (_date: any | null) => {
    // Pass the date as a JavaScript Date object
    onChange(_date ? dayjs(_date).toDate() : null);
  };

  return (
    <div className="!w-full">
      <Space direction="vertical" className="w-full">
        <DatePicker
          disabled={isEditMode ? true : false}
          value={value ? dayjs(value) : null}
          className="w-full"
          onChange={handleDateChange}
        />
      </Space>
    </div>
  );
};

export default CusDatePicker;

// import { DatePicker, Space } from "antd";
// import dayjs from "dayjs";

// const CusDatePicker: React.FC<{ onChange: (value: string) => void }> = ({
//   onChange,
// }) => {
//   const handleDateChange = (date: Date, dateString: string | string[]) => {
//     const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : "";
//     onChange(formattedDate); // Pass the formatted date to parent
//   };

//   return (
//     <Space direction="vertical">
//       <DatePicker onChange={handleDateChange} />
//     </Space>
//   );
// };

// export default CusDatePicker;
