import { Search } from "lucide-react";

const AgentSearch = () => {
  return (
    <div className="bg-[#FFFFFF] flex justify-start items-center gap-x-2 w-full mb-2 xl:mb-0 xl:w-[300px] px-4 py-2 rounded-lg border border-1 border-[#CFD6DD]">
      <Search size={16} />
      <input
        type="text"
        placeholder="Search"
        className="bg-transparent flex-grow outline-none text-black placeholder:text-gray-500"
      />
    </div>
  );
};

export default AgentSearch;
