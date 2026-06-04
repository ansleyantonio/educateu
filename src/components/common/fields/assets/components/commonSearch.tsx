"use client";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const CommonSearch = ({
  width,
  searchText,
  setSearchText,
}: {
  width?: string;
  searchText: string;
  setSearchText: (text: string) => void;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [inputValue, setInputValue] = useState(searchText); // Local state for input

  useEffect(() => {
    setInputValue(searchText || "");
  }, [searchText]);

  // Debounced function to update the search state
  const handleSearch = useDebouncedCallback((text: string) => {
    if (setSearchText) {
      setSearchText(text);
    }
    const params = new URLSearchParams(searchParams);
    if (text) {
      params.set("query", text);
      params.delete("page");
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 800);

  // Update search text after 800ms when user stops typing
  useEffect(() => {
    // handleSearch(inputValue);
    handleSearch(inputValue ?? ""); //only run if inputValue is not null TODO
  }, [handleSearch, inputValue]); // Runs when inputValue changes

  return (
    <div
      className={`flex gap-x-2 justify-start items-center py-2 px-4 rounded-lg border bg-[#FFFFFF] ${
        width ? `w-[${width}]` : "w-[150px] xl:w-[300px]"
      } border border-[#CFD6DD]`}
    >
      <Search size={16} />
      <input
        type="text"
        placeholder="Search"
        onChange={(e) => setInputValue(e.target.value)} // Update local state
        value={inputValue}
        className="flex-grow w-full text-black bg-transparent outline-none placeholder:text-gray-500"
      />
    </div>
  );
};

export default CommonSearch;
