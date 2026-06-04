/* eslint-disable no-unused-vars */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/custom_ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { fetchFilterListOfApplications } from "../../query_controller/fetchFilterListOfApplications";
import filter from "/public/assets/logo/dashboard_management/application-management/filter.svg";
const formSchema = z.object({
  application_status: z.string().optional(),
  intake_period: z.string().optional(),
  application_stage: z.string().optional(),
});

interface FilterBody {
  intake_period?: string;
  application_status?: string;
  application_stage?: string;
}

export function ApplicationFilter({ setFilterLists, filterableValues }: any) {
  // console.log(
  //   "FILTERED VALUES IN APPLICATION FILTER",
  //   filterableValues
  // );
  const [body, setBody] = useState<FilterBody>({});
  const [openFilterListOpen, setOpenFilterListOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intake_period: "",
      application_status: "",
      application_stage: "",
    },

    mode: "onChange",
  });

  //
  const auth = useAuths();
  const token = auth?.user?.token as string;
  const { data, isLoading } = useQuery({
    queryKey: [
      "fetch-filter-list-of-applications",
      { openFilterListOpen, body },
    ],
    queryFn: ({ queryKey }: any) =>
      fetchFilterListOfApplications({
        queryKey: [queryKey[0], {}],
        token: token,
        body: queryKey[1]?.body,
        page: queryKey[1]?.page,
      }),
  });

  if (!isLoading) {
    console.log("filter body", body);
    console.log("filter data", data);
  }
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    const newURL = createPageURL(page);
    router.push(newURL);
  };

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values);

    setFilterLists(body);
    handlePageChange(1);
  }

  const handelChange = (fieldName: keyof FilterBody, value: string) => {
    form.setValue(fieldName, value, {
      shouldValidate: true,
    });
    setBody((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    //set form value
  };

  const handelResetFilterList = () => {
    form.reset({
      intake_period: "",
      application_status: "",
      application_stage: "",
    });

    setFilterLists({});
    setBody({});
    //
  };
  return (
    <Sheet open={openFilterListOpen} onOpenChange={setOpenFilterListOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="flex gap-x-2 items-center py-2 px-4 rounded-md text-[#4A545E] bg-[#FFFFFF] hover:bg-[#fffdfd]"
        >
          <Image src={filter} alt="create" width={16} height={16} />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 capitalize"
            >
              <FormField
                control={form.control}
                name="intake_period"
                render={({ field }) => (
                  <FormItem>
                    <label className="cusFormLabel">Application intake</label>
                    <Select
                      defaultValue={field.value}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handelChange("intake_period", value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select application intake" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filterableValues?.intake?.length > 0 ? (
                          filterableValues.intake.map((item: any) => (
                            <SelectItem key={item} value={`${item}`}>
                              {item}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value={`${body?.intake_period}`}>
                            {`${body?.intake_period}`}
                          </SelectItem>
                        )}

                        {/* <SelectItem value="ASSIGN">ASSIGN</SelectItem>
                        <SelectItem value="CHECK">CHECK</SelectItem>
                        <SelectItem value="SUBMIT">SUBMIT</SelectItem>
                        <SelectItem value="OUTCOME">OUTCOME</SelectItem> */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="application_stage"
                render={({ field }) => (
                  <FormItem>
                    <label className="cusFormLabel">Application Stage</label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handelChange("application_stage", value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select application stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {
                        // data?.data?.filterableValues?.stage &&
                        filterableValues.stage.length > 0 ? (
                          filterableValues.stage.map((item: any) => (
                            <SelectItem key={item} value={`${item}`}>
                              {item}
                            </SelectItem>
                          ))
                        ) 
                        : (
                          <SelectItem value={`${body?.application_stage}`}>
                            {`${body?.application_stage}`}
                          </SelectItem>
                        )}

                        {/* <SelectItem value="ASSIGN">ASSIGN</SelectItem>
                        <SelectItem value="CHECK">CHECK</SelectItem>
                        <SelectItem value="SUBMIT">SUBMIT</SelectItem>
                        <SelectItem value="OUTCOME">OUTCOME</SelectItem> */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="application_status"
                render={({ field }) => (
                  <FormItem>
                    <label className="cusFormLabel">Application status</label>
                    <Select
                      defaultValue={field.value}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handelChange("application_status", value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select application status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {
                        // data?.data?.filterableValues?.status &&
                        filterableValues.status.length > 0 ? (
                        filterableValues.status.map((item: any) => (
                            <SelectItem key={item} value={`${item}`}>
                              {item}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value={`${body?.application_status}`}>
                            {`${body?.application_status}`}
                          </SelectItem>
                        )}

                        {/* <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="APPROVED">APPROVED</SelectItem>
                        <SelectItem value="REJECTED">REJECTED</SelectItem> */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center text-capitalize">
                <button
                  onClick={handelResetFilterList}
                  className="py-3 px-7 text-sm font-semibold tracking-wide leading-4 rounded-md active:scale-x-110 bg-[#FFFFFF] border-[1.2px] border-[#E3E5E5] text-[#192128]"
                  type="button"
                >
                  Reset
                </button>
                <button
                  className="p-3 font-semibold tracking-wide leading-4 rounded-md bg-[#013E5B] ext-sm text-[#FBFBFB] text-capitalize active:bg-[#0b2c3b]"
                  type="submit"
                >
                  Apply Filter
                </button>
              </div>
            </form>
          </Form>
        </div>
        {/* <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
