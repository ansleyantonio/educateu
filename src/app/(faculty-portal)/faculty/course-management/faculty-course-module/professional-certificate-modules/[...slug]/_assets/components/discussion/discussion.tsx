import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscussionTable } from "./discussion_table";

const DiscussionTab = () => {
  return (
    <Card className="mt-9">
      {/* Header */}
      <div className="flex justify-between items-center p-4 w-full">
        <h1>Students List</h1>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a value" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="export">Export</SelectItem>
              <SelectItem value="import">Import</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DiscussionTable />
    </Card>
  );
};

export default DiscussionTab;
