/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card } from "@/components/ui/card";
import { useAuths } from "@/hooks/userContext";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
// import AddNote from "./_assets/components/dialog/note/add_note";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import SingleNote from "./_assets/components/single_note";

const NotesPage = () => {
  const id = usePathname().split("/")[3];
  const auth = useAuths();
  const token = auth?.user?.token;

  const { data, isLoading } = useFetchData({
    queryKey: "get-applicant-note",
    path: `application-management/notes/application?applicationId=${id}`,
    method: "GET",
    enabled: !!id,
  });

  // const { data, isLoading } = useQuery({
  //   queryKey: ["get-applicant-note", token, id],
  //   queryFn: getApplicantNoteController,
  // });

  // console.log("data", data);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-black">All Notes</h1>
        {/* <AddNote /> */}
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center my-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          data?.data?.applicationNotes?.map((item: any, i: number) => (
            <SingleNote key={i} item={item} />
          ))
        )}
      </div>
    </Card>
  );
};
export default NotesPage;
