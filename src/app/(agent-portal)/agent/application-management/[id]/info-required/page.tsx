"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/custom_ui/button";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { useAuths } from "@/hooks/userContext";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type UpdateRequest = {
  fieldName: string;
  note: string;
  type: "ADDITIONAL_CHECK" | "CHECK" | string;
  attachmentName?: string;
  attachmentUrl?: string;
};

//

const InfoRequire = () => {
  const auth = useAuths();
  const token = auth?.user?.token;

  const params = useParams();
  const applicationId = params?.id as string;

  const { data, isLoading, isError } = useFetchData({
    queryKey: "update-request",
    path: `application-management/notes/application?applicationId=${applicationId}`,
    method: "GET",
    enabled: !!token && !!applicationId,
  });

  // const { data, isLoading, isError } = useQuery({
  //   queryKey: ["update-request", applicationId],
  //   queryFn: () =>
  //     fetchUpdateRequest({
  //       queryKey: ["update-request", { applicationId, token }],
  //     }),
  //   enabled: !!token && !!applicationId,
  // });

  // console.log("updateRequests", data?.data?.applicationNotes);
  // console.log("applicationId", applicationId);

  return (
    <ScrollArea className="overflow-y-hidden h-[calc(100vh-120px)]">
      <div>
        <h1 className="text-lg font-bold pb-3">Update Requests</h1>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" size={16} />
            Loading update requests...
          </div>
        ) : isError ? (
          <p className="text-sm text-red-500">
            Failed to fetch update requests.
          </p>
        ) : (
          data?.data?.applicationNotes?.map(
            (note: UpdateRequest, index: number) => (
              <div key={index} className="mb-5">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {note.fieldName?.replace(/^file[-_]?/i, "") ||
                        note.attachmentName ||
                        "Required Information"}
                    </CardTitle>
                    <CardDescription className="hidden" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="w-full border text-[12px] h-fit min-h-[90px] pb-6 leading-4 rounded-md p-2">
                      {note.note}
                    </div>

                    {note.type == "UPDATE_REQUEST" && (
                      <Link
                        href={`/agent/application-management/${applicationId}/profile?open=${note.fieldName}`}
                        className="flex justify-end"
                      >
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            console.log("Update Now clicked", note);
                          }}
                          className="text-[#FFFFFF] bg-[#013E5B] mt-1 rounded-md px-4 py-2 flex items-center gap-x-2"
                        >
                          Update Now
                        </Button>
                      </Link>
                    )}

                    {note.type == "FILE_UPDATE_REQUEST" &&
                      note.attachmentName && (
                        <>
                          <div className="flex justify-end mt-4 items-center gap-3">
                            {/* <div className="flex gap-4 text-sm text-blue-600">
                              <a
                                href={note.attachmentUrl || "#"}
                                download
                                className="hover:underline"
                              >
                                Download
                              </a>
                              <a
                                href={note.attachmentUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                View
                              </a>
                            </div> */}
                            <Link
                              href={`/agent/application-management/${applicationId}/document`}
                              className="flex justify-end"
                            >
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  console.log("Update Now clicked", note);
                                }}
                                className="text-[#FFFFFF] bg-[#013E5B] mt-1 rounded-md px-4 py-2 flex items-center gap-x-2"
                              >
                                Update Now
                              </Button>
                            </Link>
                          </div>
                        </>
                      )}
                  </CardContent>
                  {/* <CardFooter className="hidden" /> */}
                  <CardFooter className="flex justify-end hidden">
                    <button
                      type="button"
                      onClick={() => {
                        console.log("Update Now clicked", note);
                      }}
                      className="text-[#FFFFFF] bg-[#013E5B] rounded-md px-4 py-2 flex items-center gap-x-2"
                    >
                      Update Now
                    </button>
                  </CardFooter>
                </Card>
              </div>
            )
          )
        )}
      </div>
    </ScrollArea>
  );
};

export default InfoRequire;
