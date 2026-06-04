import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const CommonSearch = ({
  width,
  searchText,
  setSearchText,
}: {
  width?: string;
  searchText?: string;
  setSearchText?: (text: string) => void;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [inputValue, setInputValue] = useState(searchText);

  useEffect(() => {
    setInputValue(searchText || "");
  }, [searchText]);

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

  useEffect(() => {
    handleSearch(inputValue ?? "");
  }, [handleSearch, inputValue]);

  const clearSearch = () => {
    setInputValue("");
    if (setSearchText) setSearchText("");
    const params = new URLSearchParams(searchParams);
    params.delete("query");
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      className={`flex gap-x-2 justify-start items-center py-2 px-4 rounded-lg border bg-[#FFFFFF] relative ${
        width ? `w-[${width}]` : "w-[150px] lg:w-[270px] 2xl:w-[300px]"
      } border border-[#CFD6DD]`}
    >
      <Search size={16} />
      <input
        type="text"
        placeholder="Search"
        onChange={(e) => setInputValue(e.target.value)}
        value={inputValue}
        className="flex-grow pr-6 w-full text-black bg-transparent outline-none placeholder:text-gray-500"
      />
      {inputValue && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default CommonSearch;

