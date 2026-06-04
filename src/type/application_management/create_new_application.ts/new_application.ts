import { academic_background_formSchema } from "./academic_background_schema";
import { personal_information_fromSchema } from "./personal_information_schema";

// create new application all step schema file merge
const fromSchema = personal_information_fromSchema.merge(
  academic_background_formSchema
);

// default value for new application from
// const default_value = fromSchema.parse({});

export const new_application = {
  fromSchema,
  //   default_value,
};
