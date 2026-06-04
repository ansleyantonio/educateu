import RichTextEditor from "@/components/custom_tiptap/RichTextEditor";
import CommonSearch from "../search/commonSearch";
import { DatePickerAnd } from "./assets/components/AndDesignDatePicker";
import { CheckField } from "./assets/components/CheckField";
import { DynamicFileUploadField } from "./assets/components/FileUpload/DynamicFileUpload";
import { MultiCheckField } from "./assets/components/MulticheckField";
import { Number } from "./assets/components/NumberField";
import { NumberText } from "./assets/components/NumberText";
import { OTP } from "./assets/components/otpVerifyField";
import { Password } from "./assets/components/PasswordField";
import { PhoneNumber } from "./assets/components/PhoneNumberField";
import { UploadProfilePicture } from "./assets/components/ProfileUpload";
import { RangeDatePickerAnd } from "./assets/components/RangeDatePicker";
// import RichTextEditor from "./assets/components/RichTextEditor";
import { SingleSelectField } from "./assets/components/SingleSelectField";
import { SelectField } from "./assets/components/SingleSelectFieldAnd";
import { SwitchField } from "./assets/components/SwitchField";
import { TextArea } from "./assets/components/TextAreaField";
import { Text } from "./assets/components/TextField";
import { UploadVideoFile } from "./assets/components/VideoUpload";
import LimitField from "./cus_limitField";

export const CustomField = {
  MultiCheckField,
  CheckField,
  Text,
  TextArea,
  Number,
  OTP,
  Password,
  DatePickerAnd,
  RangeDatePickerAnd,
  SingleSelectField,
  PhoneNumber,
  SelectField,
  SwitchField,
  CommonSearch,
  UploadProfilePicture,
  UploadVideoFile,
  RichTextEditor,
  DynamicFileUploadField,
  LimitField,
  NumberText,
};
