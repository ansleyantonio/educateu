/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import { FacultySchema, IFilterFacultyForm } from "../../schemas/facultySchema";
import Filter_Form_field from "../formField/Filter_form_field";

const FilterFacultyFrom = ({
  setFilterData,
  setCurrentPage,
}: {
  setFilterData: any;
  setCurrentPage: (page: number) => void;
}) => {
  // const auth = useAuth();
  // const token = auth?.user?.accessToken as string;
  // const queryClient = useQueryClient();

  // const defaultValue = {
  //   ...LessonDefaultValue(),
  //   moduleStatus: "",
  // };

  const form = useForm<IFilterFacultyForm>({
    resolver: zodResolver(FacultySchema.filter),
    // defaultValues: defaultValue,
  });

  //. Define a submit handler.
  function onSubmit(values: IFilterFacultyForm) {
    // createNewSubAgentMutation.mutate(values);
    const filterData = RemoveEmptyFields(values);
    console.log("filter data", filterData);
    setFilterData(filterData);
    setCurrentPage(1);
  }

  const handelResetForm = () => {
    // console.log("reset form", defaultValue);
    // form.reset(LessonDefaultValue()); //
    setFilterData({});
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="">
          <Filter_Form_field form={form} />
        </div>

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => handelResetForm()}
            type="button"
            variant="outline"
            className="active:scale-75"
          >
            Reset
          </Button>
          <Button
            // disabled={updateAdvanceModuleMutation?.isPending}
            type="submit"
            className="active:scale-75 py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
          >
            {/* {updateAdvanceModuleMutation?.isPending && (
              <Loader2 className="animate-spin" />
            )} */}
            Apply Filter
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FilterFacultyFrom;
