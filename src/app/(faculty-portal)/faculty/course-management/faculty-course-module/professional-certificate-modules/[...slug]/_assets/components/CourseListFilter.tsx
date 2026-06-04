/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "../schema/filterFormSchema";
import filter from "/public/assets/logo/dashboard_management/application-management/filter.svg";

const CourseListFilter = ({ setFilterLists }: { setFilterLists: any }) => {
  const [openFilterListOpen, setOpenFilterListOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_title: "",
    },

    mode: "onChange",
  });

  // Submit handler to apply filters
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // onApplyFilter(values);
    setOpenFilterListOpen(false);
  };

  return (
    <Sheet open={openFilterListOpen} onOpenChange={setOpenFilterListOpen}>
      <SheetTrigger asChild>
        <button className="text-[#4A545E] border border-[#CFD6DD] bg-[#FFFFFF] rounded-md py-2 px-4 flex items-center gap-x-2">
          <Image src={filter} alt="create" width={16} height={16} />
          Filter
        </button>
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
                name="course_title"
                render={({ field }) => (
                  <FormItem>
                    <label className="cusFormLabel">Application intake</label>
                    <Select
                      defaultValue={field.value}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select application intake" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ASSIGN">ASSIGN</SelectItem>
                        <SelectItem value="CHECK">CHECK</SelectItem>
                        <SelectItem value="SUBMIT">SUBMIT</SelectItem>
                        <SelectItem value="OUTCOME">OUTCOME</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center text-capitalize">
                <button
                  // onClick={handelResetFilterList}
                  className="bg-[#FFFFFF] active:scale-x-110 px-7 py-3 rounded-md border-[1.2px] border-[#E3E5E5] text-sm font-semibold leading-4 tracking-wide text-[#192128]"
                  type="button"
                >
                  Reset
                </button>
                <button
                  className="bg-[#013E5B] active:bg-[#0b2c3b]  rounded-md p-3 ext-sm font-semibold leading-4 tracking-wide text-[#FBFBFB] text-capitalize"
                  type="submit"
                >
                  Apply Filter
                </button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CourseListFilter;
