"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import image from "/public/assets/logo/dashboard_management/image.png";

interface SingleNoteProps {
  note: string;
  role: string;
  name: string;
}

const SingleLetter = ({ note, name }: SingleNoteProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Card className="p-6 shadow-md">
      {/* Note Content */}
      <div className="mt-4 text-sm text-gray-700">
        {isExpanded || note.length <= 150 ? (
          <p>
            {note}{" "}
            {note.length > 150 && (
              <span
                className="text-blue-600 cursor-pointer"
                onClick={handleToggle}
              >
                See Less
              </span>
            )}
          </p>
        ) : (
          <p>
            {note.slice(0, 150)}...
            <span
              className="text-blue-600 cursor-pointer"
              onClick={handleToggle}
            >
              See More
            </span>
          </p>
        )}
      </div>
       <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mt-4 text-sm font-thin text-[#717171]">
        {/* User Details */}
        <div className="flex gap-2 items-center">
          <p>sent:</p>
          <Image
            src={image}
            alt={`${name}'s photo`}
            className="rounded-full w-[20px] h-[20px]"
            width={20}
            height={20}
          />
          <p>{name}</p>
        </div>
        <p className="text-sm">Thu Aug 15, 2024 09:27 AM</p>
      </div>
    </Card>
  );
};

export default SingleLetter;
