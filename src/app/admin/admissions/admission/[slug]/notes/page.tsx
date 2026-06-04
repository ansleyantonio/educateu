/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import CusPagination from "@/components/common/pagination/paginations";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/custom_ui/tabs";
import { useAuths } from "@/hooks/userContext";
import { useQueries } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import AddNote from "./_assets/components/dialog/note/add_note";
import SingleNote from "./_assets/components/single_note";
import { getApplicantNoteController } from "./_assets/queryClient/queryController";

const NotesPage = ({ params }: { params: { slug: string } }) => {
  const id = params.slug;
  const { user } = useAuths();
  const token = user?.token;
  const [tabValue, setTabValue] = useState("private_note");
  const [privateNotePage, setPrivateNotePage] = useState(1);
  const [publicNotePage, setPublicNotePage] = useState(1);

  const result = useQueries({
    queries: [
      {
        queryKey: [
          "get-applicant-private-note",
          token,
          id,
          "PRIVATE",
          privateNotePage,
        ],
        queryFn: getApplicantNoteController,
        enabled: !!privateNotePage,
      },
      {
        queryKey: [
          "get-applicant-public-note",
          token,
          id,
          "PUBLIC",
          publicNotePage,
        ],
        queryFn: getApplicantNoteController,
        enabled: !!publicNotePage,
      },
    ],
  });

  const [privateNote, publicNote] = result;

  const { isLoading: isLoadingPrivateNote, data: privateNoteData } =
    privateNote;
  const { isLoading: isLoadingPublicNote, data: publicNoteData } = publicNote;

  return (
    <PageWithBreadcrumb
      items={[
        {
          title: "Admissions",
        },
        { title: "Applications", href: "/admin/admissions/admission" },
        { title: "Notes" },
      ]}
    >
      <Card className="px-4">
        <Tabs value={tabValue} onValueChange={setTabValue}>
          {/* Header */}
          <div className="flex justify-between items-center p-4 w-full">
            <div className="flex gap-2 items-center">
              <h3>Notes</h3>
              <p className="flex justify-center items-center py-0 px-1 text-xs rounded-full border bg-[#F0F9FF]">
                {privateNoteData?.pagination?.total +
                  publicNoteData?.pagination?.total}
              </p>
            </div>
            {/* disable  */}
            <AddNote setTabValue={setTabValue} />
          </div>
          {/* Tabs */}
          <TabsList className="grid grid-cols-2 gap-x-2 p-2 mx-auto w-full">
            <TabsTrigger value="private_note">
              Private Note ({privateNoteData?.pagination?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="public_note">
              Public Note ({publicNoteData?.pagination?.total || 0})
            </TabsTrigger>
          </TabsList>
          {/* Private Note */}
          <TabsContent value="private_note">
            <div className="flex flex-col gap-4 mt-6 min-h-20">
              {isLoadingPrivateNote ? (
                <div className="flex justify-center items-center my-8">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                privateNoteData?.data?.applicationNotes?.map(
                  (item: any, i: number) => <SingleNote key={i} item={item} />
                )
              )}
            </div>
          </TabsContent>
          {/* Public Note */}
          <TabsContent value="public_note">
            <div className="flex flex-col gap-4 mt-6 min-h-20">
              {isLoadingPublicNote ? (
                <div className="flex justify-center items-center my-8">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                publicNoteData?.data?.applicationNotes?.map(
                  (item: any, i: number) => <SingleNote key={i} item={item} />
                )
              )}
            </div>
          </TabsContent>
          <br /> <br />
          <CusPagination
            totalPages={
              tabValue === "private_note"
                ? privateNoteData?.pagination?.totalPages
                : publicNoteData?.pagination?.totalPages
            }
            setCurrentPage={
              tabValue === "private_note"
                ? setPrivateNotePage
                : setPublicNotePage
            }
            currentPage={
              tabValue === "private_note" ? privateNotePage : publicNotePage
            }
          />
          {/* <Pagination
          totalPages={
            tabValue === "private_note"
              ? privateNoteData?.pagination?.totalPages
              : publicNoteData?.pagination?.totalPages
          }
          setCurrentPage={
            tabValue === "private_note" ? setPrivateNotePage : setPublicNotePage
          }
        /> */}
          <br />
        </Tabs>
      </Card>
    </PageWithBreadcrumb>
  );
};
export default NotesPage;
