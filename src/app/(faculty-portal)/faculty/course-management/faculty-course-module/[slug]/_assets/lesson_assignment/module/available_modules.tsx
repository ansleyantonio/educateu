/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import CommonSearch from "@/components/common/search/commonSearch";
import { Button } from "@/components/ui/custom_ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

const AvailableModulesComponent = (data: any) => {
  const [searchText, setSearchText] = useState("");

  return (
    <div>
      {/* Title */}
      <div className="flex justify-between items-center mb-4">
        <h3>Available Lessons & Quizes</h3>
        <Button variant="primary">
          <PlusIcon /> Create a New Lesson
        </Button>
      </div>

      {/* Search Bar  */}
      <div>
        <CommonSearch
          width="100%"
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </div>

      {/* List of Modules  */}
      <div className="mt-4">
        {data?.data?.map((module: any, i: number) => (
          <div
            className="flex justify-between items-center p-2 mb-4 rounded-md border border-gray-200"
            key={i}
          >
            <div>
              <h2 className="text-lg font-semibold">{module.name}</h2>
              <p className="mb-2 text-sm text-gray-400">{module.description}</p>
              <p className="text-xs text-gray-400"> 27 June 2023 11:00 AM</p>
            </div>
            <Button variant="secondary">select</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableModulesComponent;
