/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TruncateText } from "@/utils/TruncateText";
import { CopyWithIcon } from "@/utils/CopyButton";

const SelectedApplicantListForMigrate = ({ Data }: any) => {
  return (
    <div>
      <Table className="border border-collapse table-auto bg-[#FFFFFF]">
        <TableHeader className="bg-[#F5F7F9]">
          <TableRow>
            <TableHead className="pl-4">Sr. No.</TableHead>
            <TableHead>Application</TableHead>
            <TableHead>Application ID </TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Data?.map((applicant: any, index: number) => (
            <TableRow key={index}>
              {/* <Checkbox /> */}
              <TableCell className="pl-4">{index + 1}</TableCell>

              <TableCell className="pl-4 capitalize">
                <TruncateText text={applicant?.fullName} />
              </TableCell>
              <TableCell className="flex gap-2" title={applicant?.id}>
                <p className="text-black truncate max-w-[100px]">
                  {applicant?.id}
                </p>
                <CopyWithIcon color="[#013E5B]" text={applicant?.id} />
              </TableCell>
              <TableCell>{applicant?.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SelectedApplicantListForMigrate;
