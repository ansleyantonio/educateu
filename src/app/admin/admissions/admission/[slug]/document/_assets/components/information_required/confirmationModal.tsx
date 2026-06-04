/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuths } from "@/hooks/userContext";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
  note: z.string().min(2).max(50),
});
export function InformationRequiredModal({
  fieldName,
  applicationIid,
}: {
  fieldName: string;
  applicationIid: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const user = useAuths();
  const token = user?.user?.token;
  // const queryClient = useQueryClient();

  const matchedModule = useMatchedModule();

  const hasPostAndDeletePermission =
    matchedModule?.modulePermission.includes("POST") ||
    matchedModule?.modulePermission.includes("DELETE");

  // console.log("fieldName", fieldName);

  const informationRequiredMutation = useMutation({
    mutationFn: async (data: any) => {
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admission/checks/general-file-checks/${applicationIid}`,
        data, // Note: Where is 'body' coming from? You might want to use 'newApplication' here
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: (data: any) => {
      setIsDialogOpen(false);
      // console.log("data--------------", data);
      if (data?.data.statusCode == 200) {
        toast.success(data?.data?.message || "Update successful");
      } else {
        toast.error(data?.message || "Update failed");
      }
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        toast.error(error.response?.data?.message || "update failed");
        // if (
        //   error.response?.data?.message ==
        //   "Cannot update general file check status after approval"
        // ) {
        //   toast.error("This file  Already approved ");
        // } else {
        //   toast.error(error.response?.data?.message);
        // }
      } else {
        toast.error(error.message || "An error occurred");
      }
    },
  });
  const handelConfirm = () => {
    const note = form.getValues("note");
    // safe parse
    const isValid = formSchema.safeParse({
      note,
    });
    // console.log("mutation body", note);

    if (!isValid.success) {
      const rowMessage = isValid?.error?.issues?.[0]?.message;
      setErrorMessage(rowMessage);
    }

    const body = [
      {
        attachmentName: fieldName,
        status: "INFORMATION_REQUIRED",
        note: note,
      },
    ];
    if (note !== "") {
      informationRequiredMutation.mutate(body);
    }
    // generalFileCheckMutation.mutate(body);
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    // preventDefault();
    // console.log(values);
  }

  const handelOpenModal = () => {
    setIsDialogOpen(true);
    form.reset();
  };
  return (
    // <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (open) form.reset(); // only reset when opening
      }}
    >
      <DialogTrigger asChild className="">
        <Button
          size="sm"
          variant="outline"
          className={`capitalize `}
          disabled={!hasPostAndDeletePermission}
        >
          InFo Required
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="capitalize">File Check</DialogTitle>
          <DialogDescription className="hidden">
            Are you sure you want to proceed? This action is final and
            cannot be reversed
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">
                      Add a message for {fieldName}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        onChange={(e) => {
                          setErrorMessage("");
                          field.onChange(e);
                        }}
                        className="w-full"
                        rows={5}
                        placeholder="Write here the details"
                      />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />

              <div>
                <p className="text-red-400 ">{errorMessage && errorMessage}</p>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    form.reset();
                    setIsDialogOpen(false);
                  }}
                  className="capitalize"
                  size={"sm"}
                  variant="outline"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handelConfirm}
                  className="capitalize"
                  size={"sm"}
                  disabled={informationRequiredMutation.isPending}
                  type="button"
                >
                  {informationRequiredMutation.isPending && (
                    <Loader2 className="animate-spin" />
                  )}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
