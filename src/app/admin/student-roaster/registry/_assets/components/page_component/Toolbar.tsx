// components/Toolbar.tsx
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";

interface ToolbarProps {
  total: number;
  search: string;
  setSearch: (val: string) => void;
  onDownload: () => void;
}

export function Toolbar({
  total,
  search,
  setSearch,
  onDownload,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap justify-between items-center p-4 bg-white border-b gap-4">
      {/* Left side */}
      <div className="flex gap-2 items-center">
        <h2 className="text-lg font-semibold text-black">Total Registry</h2>
        <span className="py-1 px-3 text-xs text-blue-600 bg-blue-50 rounded-full">
          {total} Candidates
        </span>
      </div>

      {/* Right side */}
      <div className="flex gap-3 items-center">
        <div className="relative">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-[250px]"
          />
          <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-500 -translate-y-1/2" />
        </div>
        <Button type="submit" variant="secondary" onClick={onDownload}>
          <Download /> Download
        </Button>
      </div>
    </div>
  );
}
