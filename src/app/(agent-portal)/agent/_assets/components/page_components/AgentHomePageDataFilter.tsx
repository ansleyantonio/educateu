"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import filter from "/public/assets/logo/dashboard_management/application-management/filter.svg";
const formSchema = z.object({
  intake_period: z.string().optional(),
  application_year: z.string().optional(),
});

interface FilterBody {
  intake_period?: string;
  application_year?: string;
}

export function AgentHomePageDataFilter({ setFilterLists }: any) {
  const [body, setBody] = useState<FilterBody>({});
  const [openFilterListOpen, setOpenFilterListOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intake_period: "",
      application_year: "",
    },

    mode: "onChange",
  });

  //
  const auth = useAuths();
  const token = auth?.user?.token as string;

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
      application_year: "",
    });

    setFilterLists({});
    setBody({});
    //
  };
  return (
    <Sheet open={openFilterListOpen} onOpenChange={setOpenFilterListOpen}>
      <SheetTrigger asChild>
        <button className="flex gap-x-2 items-center py-2 px-4 border rounded-md text-[#4A545E] bg-[#FFFFFF]">
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
                name="intake_period"
                render={({ field }) => (
                  <FormItem>
                    <label className="cusFormLabel">Intake</label>
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
                          <SelectValue placeholder="Select an intake" />
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

              <FormField
                control={form.control}
                name="application_year"
                render={({ field }) => (
                  <FormItem>
                    <label className="cusFormLabel">Year</label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handelChange("application_year", value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select application stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
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
