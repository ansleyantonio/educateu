"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DynamicFileUploadField } from "@/components/common/fields/assets/components/FileUpload/DynamicFileUpload";
import { UploadProfilePicture } from "@/components/common/fields/assets/components/ProfileUpload";
import RichTextEditor from "@/components/custom_tiptap/RichTextEditor";
import DownloadCSV from "@/components/Download/CSV_XLSX/ExportasCSV";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import { SendEmailTemplateModal } from "../../components/EmailModals/SendEmailTemplateModal";

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  image: z.any(),
  html: z
    .string()
    .min(5, { message: "Content must be at least 5 characters." }),
});

function InputForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: `<p>fndskjfnjksdnfkdsnfndskn</p>`,
      image: "",
      html: `<p>fndskjfnjksdnfkdsnfndskn</p>`,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Data submitted:", data);
  }
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* <CustomField.RichTextEditor
          form={form}
          name="username"
          labelName="Username"
          placeholder="Username"
        /> */}
        <RichTextEditor
          form={form}
          name="username"
          labelName="Username"
          placeholder="Username"
        />
        <UploadProfilePicture
          form={form}
          name="image"
          labelName="Profile Image"
        />
        <DynamicFileUploadField
          form={form}
          name="dynamicFile"
          labelName="Dynamic File Upload"
          acceptedTypes="image-pdf"
          maxSizeMB={5}
        />
        {/* <SendEmailModalRichText
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          // emailList={["abc@email.com", "def@email.com","ghi@email.com"]}
          email_to={["pulok@arbreesolutions.com"]}
        /> */}
        <SendEmailTemplateModal
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          // emailList={["abc@email.com", "def@email.com","ghi@email.com"]}
          email_to={["pulok@arbreesolutions.com"]}
        />
        <DownloadCSV
          buttonName="Download CSV"
          fileName="enrollmentData"
          data={[]}
        />

        <Button type="submit">Submit</Button>
        <Button type="button" onClick={() => setDialogOpen(true)}>
          Open Email Modal
        </Button>
      </form>
    </Form>
  );
}
export default InputForm;
