"use client";
import { GoDotFill } from "react-icons/go";

interface Props {
  text: string;
  color: string;
  background: string;
}

const Indicator = ({ text, color, background }: Props) => {
  return (
    <div
      style={{ backgroundColor: background, color: color }}
      className={`flex gap-1 text-xs items-center py-[1px] px-2 rounded-md w-fit`}
    >
      <GoDotFill />
      <p>{text}</p>
    </div>
  );
};

export default Indicator;

