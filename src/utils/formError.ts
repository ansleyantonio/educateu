/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldError } from "react-hook-form";

const onFormError = (errors: any) => {
  Object.entries(errors).forEach(([key, value]) => {
    const err = value as FieldError;
    console.error(`- ${key}: ${err?.message}`);
  });
};

export default onFormError;
