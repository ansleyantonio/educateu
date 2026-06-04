"use client";
import { Card } from "@/components/ui/card";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomInputField } from "@/components/common/fields/custom_input_field";
import { Button } from "@/components/ui/button";

type FormValues = {
  warningType: string;
  description: string;
};

const SendWarning = () => {

  const form = useForm<FormValues>({
    defaultValues: {
      warningType: "",
      description: "",
    },
  });

  const { watch, setValue, handleSubmit, control } = form;

  const warningType = watch("warningType");
  const description = watch("description");

  const isButtonDisabled = !warningType && !description?.trim();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Form Submitted:", data);
  };

  return (
    <Card className="w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-md">Send Warning</h3>
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warning Type
            </label>
            <Select
              onValueChange={(value) => setValue("warningType", value)}
              value={warningType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Warning type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attendance">Attendance Issue</SelectItem>
                <SelectItem value="behavior">Behavioral Warning</SelectItem>
                <SelectItem value="performance">Performance Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CustomInputField.TextArea
            fControl={control}
            name="description"
            labelName="Warning Description"
            optional={false}
          />

          <Button type="submit" variant="primary" disabled={isButtonDisabled}>
            Send Warning
          </Button>
        </form>
      </FormProvider>
    </Card>
  );
};

export default SendWarning;