/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DynamicFileUploadField } from "@/components/common/fields/assets/components/FileUpload/DynamicFileUpload";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";

interface FormType {
  form: any;
  viewOnly?: boolean;
  nonEdit?: boolean;
  // mode?: "create" | "edit";
  setUploading?: (val: boolean) => void;
}

const Form_field = ({ form, viewOnly, nonEdit, setUploading }: FormType) => {
  const isViewOnly = viewOnly;

  const [searchTerms, setSearchTerms] = useState({
    awardingBodyId: "",
  });

  const { options: awardingBodyOptions } = DataFetcher.fetchAwardingBodies({
    filter: {
      search: searchTerms.awardingBodyId,
      status: "ACTIVE",
      pageSize: 10,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contents",
  });

  const handleAddRow = async () => {
    const lastIndex = fields.length - 1;
    const isValid = await form.trigger(`contents.${lastIndex}`);

    if (!isValid) {
      toast.error(
        "Please complete the current content before adding a new one.",
      );
      return;
    }

    append({ title: "", description: "", type: "", paths: [] });
  };

  // Watch the `type` field
  const lessonType = form.watch("type");

  useEffect(() => {
    if (!lessonType) return;

    // If type is CPD or PROFESSIONAL_CERTIFICATE → clear awardingBodyId
    if (lessonType === "CPD" || lessonType === "PROFESSIONAL_CERTIFICATE") {
      form.setValue("awardingBodyId", undefined, { shouldValidate: true });
    }

    // If type is DEGREE or DIPLOMA → clear accreditation
    if (lessonType === "DEGREE" || lessonType === "DIPLOMA") {
      form.setValue("accreditation", undefined, { shouldValidate: true });
    }
  }, [lessonType, form, nonEdit]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-top">
        <CustomField.Text
          form={form}
          name="title"
          labelName="lesson Title"
          placeholder="lesson Title"
          optional={false}
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="code"
          labelName="lesson Code"
          placeholder="lesson Code"
          // optional={false}
          viewOnly={isViewOnly}
        />

        <CustomField.SelectField
          form={form}
          name="type"
          labelName="lesson Type"
          placeholder="lesson Type"
          options={[
            {
              label: "Diploma",
              value: "DIPLOMA",
            },
            {
              label: "Degree",
              value: "DEGREE",
            },
            {
              label: "CPD",
              value: "CPD",
            },
            {
              label: "Professional Certificate",
              value: "PROFESSIONAL_CERTIFICATE",
            },
          ]}
          optional={false}
          viewOnly={isViewOnly}
        />

        {/* Awarding Body */}
        {["DEGREE", "DIPLOMA"].includes(form.watch("type")) && (
          <CustomField.SelectField
            form={form}
            name="awardingBodyId"
            labelName="awarding Body"
            placeholder="awarding Body"
            options={awardingBodyOptions}
            optional={false}
            viewOnly={isViewOnly || nonEdit}
            onSearch={(value) =>
              setSearchTerms((prev) => ({ ...prev, awardingBodyId: value }))
            }
          />
        )}

        {/* Professional Accreditation  */}

        {["PROFESSIONAL_CERTIFICATE", "CPD"].includes(form.watch("type")) && (
          <CustomField.Text
            form={form}
            name="accreditation"
            labelName="Accreditation Body"
            placeholder="Enter Accreditation Body"
            viewOnly={isViewOnly}
            optional={false}
          />
        )}

        <CustomField.Number
          form={form}
          name="estimatedTimeToComplete"
          labelName="Estimated Time To Complete (in hours)"
          placeholder="estimated Time To Complete"
          viewOnly={isViewOnly}
        />
      </div>

      <CustomField.TextArea
        form={form}
        optional={false}
        name="outcome"
        labelName="learning Outcome"
        placeholder="learning Outcome"
        viewOnly={isViewOnly}
      />

      <div className="mt-6 space-y-4">
        <div className="mb-2 font-semibold text-md">Lesson Contents</div>
        {fields.map((field, index) => {
          const uploadedFiles = form.watch(`contents.${index}.paths`) || [];

          return (
            <div
              key={field.id}
              className="relative p-4 space-y-4 rounded-md border"
            >
              <div
                className={`grid gap-4 ${
                  uploadedFiles.length > 0
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                <div className={`${uploadedFiles.length > 0 && "grid-cols-2"}`}>
                  <CustomField.Text
                    form={form}
                    name={`contents.${index}.title`}
                    labelName="Content Title"
                    placeholder="Content Title"
                    optional={false}
                    viewOnly={isViewOnly}
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <CustomField.SelectField
                    form={form}
                    name={`contents.${index}.type`}
                    labelName="Select Content Type"
                    options={[
                      { label: "Video", value: "video" },
                      { label: "Image", value: "image" },
                      { label: "PDF", value: "pdf" },
                      { label: "DOC", value: "doc" },
                      { label: "Excel", value: "excel" },
                      { label: "CSV", value: "csv" },
                    ]}
                    placeholder="select Content Type"
                    optional={false}
                    viewOnly={true}
                  />
                )}

                {index > 0 && !isViewOnly && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <CustomField.TextArea
                form={form}
                name={`contents.${index}.description`}
                labelName="Content Description"
                optional={false}
                placeholder="Content Description"
                viewOnly={isViewOnly}
              />

              <DynamicFileUploadField
                form={form}
                name={`contents.${index}.paths`}
                labelName="Upload Files"
                viewOnly={isViewOnly}
                maxSizeMB={1080}
                onUploadStart={() => setUploading?.(true)} // ✅ mark start
                onUploadComplete={() => setUploading?.(false)}
                onValueChange={(files) => {
                  if (files.length > 0) {
                    const fileType = files[0]?.fileType?.toLowerCase() ?? "";

                    let typeValue = "doc";
                    if (fileType.includes("image")) typeValue = "image";
                    else if (fileType.includes("video")) typeValue = "video";
                    else if (fileType.includes("pdf")) typeValue = "pdf";
                    else if (
                      fileType.includes("excel") ||
                      files[0].name.toLowerCase().endsWith("xls") ||
                      files[0].name.toLowerCase().endsWith("xlsx") ||
                      files[0].name.toLowerCase().endsWith("sheet")
                    ) {
                      typeValue = "excel";
                    } else if (files[0].name.toLowerCase().endsWith("csv")) {
                      typeValue = "csv";
                    } else if (
                      fileType.includes("word") ||
                      fileType.includes("doc")
                    ) {
                      typeValue = "doc";
                    }

                    form.setValue(`contents.${index}.type`, typeValue);
                  }
                }}
              />
            </div>
          );
        })}
        {!isViewOnly && (
          <Button type="button" onClick={handleAddRow} variant="outline">
            <Plus className="mr-2 w-4 h-4" />
            Add Content
          </Button>
        )}
      </div>
    </>
  );
};

export default Form_field;
