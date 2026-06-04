/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import image from "/public/assets/logo/dashboard_management/image.png";

const SingleNote = ({ item }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const formatDateTime = (date: string) =>
    new Date(date)
      .toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "");

  return (
    <Card className="p-6 shadow-md">
      {/* Note Content */}
      <div className="overflow-hidden mt-4 text-sm text-gray-700 whitespace-pre-wrap break-words">
        {isExpanded || item?.note?.length <= 150 ? (
          <p>
            {item?.note}
            {item?.note?.length > 150 && (
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
            {item?.note?.slice(0, 150)}...
            <span
              className="text-blue-600 cursor-pointer"
              onClick={handleToggle}
            >
              See More
            </span>
          </p>
        )}
      </div>

      {/* User Details */}
      <div className="flex justify-between items-center mt-4 text-sm font-thin text-[#717171]">
        <div className="flex gap-4 items-center">
          <Image
            src={image}
            alt={`${name}'s photo`}
            className="rounded-full w-[20px] h-[20px]"
            width={20}
            height={20}
          />
          <p className="capitalize">{item?.createdBy}</p>
          <p className="px-2 text-xs text-blue-800 capitalize bg-blue-100 rounded-full py-[1px] w-fit">
            {item?.role}
          </p>
        </div>
        <p className="text-sm">{formatDateTime(item?.createdAt)}</p>
      </div>
    </Card>
  );
};

export default SingleNote;
