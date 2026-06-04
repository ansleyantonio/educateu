/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { useAuths } from "@/hooks/userContext";
import FileUploadFromLocal from "./FileUpload/fileUploadFromLocal";

type Props = {
  form: any;
  name: string;
  labelName?: string;
  optional?: boolean;
};

const calculateTimeLeft = (start: number, progress: number) => {
  const elapsed = (Date.now() - start) / 1000;
  if (elapsed < 1 || progress < 5) return "calculating...";
  const speed = progress / elapsed;
  const remaining = 100 - progress;
  const seconds = Math.ceil(remaining / speed);

  if (seconds < 60) return `${seconds} seconds left`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes left`;
  return `${Math.ceil(seconds / 3600)} hours left`;
};

const SingleFileUpload = ({
  form,
  name,

  labelName,
  optional = true,
}: Props) => {
  const auth = useAuths();
  const token = auth?.user?.token;

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          {labelName && (
            <label className="font-semibold text-sm leading-6">
              {labelName}
              {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
            </label>
          )}
          <FormControl>
            <>
              <FileUploadFromLocal
                fieldName={name}
                upload={form}
                triggerFileInput={form.trigger}
              />
            </>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SingleFileUpload;
