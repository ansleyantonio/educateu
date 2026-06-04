/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import ActionButton from "@/components/common/button/actionButton"
import { CustomField } from "@/components/common/fields/cusInputField"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Form } from "@/components/ui/form"
import { useAuths } from "@/hooks/userContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import z from "zod"
import history from "/public/assets/logo/admin/history.svg"
import { VersionHistoryModal } from "./version-history-modal"
import useFetchData from "@/app/hook/TanstackQueries/useFetchData"

type AgreementAccordionProps = {
  groupType: "internal" | "external"
  templateData: any
  isLoading: boolean
  handleDownload: any
  handleSave: (templateData: any) => void
  isPending: boolean
  isSubmitting: boolean
  viewOnly?: boolean
  hasPostAndDeletePermission?: boolean
  matchId?: string
}

type VersionHistoryItem = {
  id: string
  version: string
  content: string
  editedBy: string
  editedAt: string
  changeDescription?: string
}

// Schema for individual template forms
const TemplateFormSchema = z.object({
  agreement: z.string().min(2, {
    message: "Content needed.",
  }),
  commissionGroupId: z.string().min(2, {
    message: "Commission Group ID needed.",
  }),
  awardingBodyId: z.string().min(2, {
    message: "Awarding Body ID needed.",
  }),
  name: z.string().min(2, {
    message: "Template Name needed.",
  }),
  awardingBodyName: z.string().min(2, {
    message: "Awarding Body needed.",
  }),
  commissionGroupName: z.string().min(2, {
    message: "Commission Group needed.",
  }),
})

export const AgreementAccordion = ({
  groupType,
  isLoading,
  templateData,
  handleDownload,
  handleSave,
  isPending,
  isSubmitting,
  viewOnly = false,
  matchId,
}: AgreementAccordionProps) => {
  const { editAccess } = useAuths()
  const [editTemplate, setEditTemplate] = useState(false)
  const [openVersionModal, setOpenVersionModal] = useState(false)

  // Each accordion manages its own form state
  const form = useForm<z.infer<typeof TemplateFormSchema>>({
    resolver: zodResolver(TemplateFormSchema),
    defaultValues: {
      agreement: templateData?.templateText || "",
      commissionGroupId: templateData?.commissionGroupId || "",
      awardingBodyId: templateData?.awardingBodyId || "",
      name: templateData?.name || "",
      commissionGroupName: templateData?.commissionGroupName || "",
      awardingBodyName: templateData?.awardingBodyName || "",
    },
  })

  useEffect(() => {
    if (templateData && !editTemplate) {
      form.reset({
        agreement: templateData?.templateText || "",
        commissionGroupId: templateData?.commissionGroupId || "",
        awardingBodyId: templateData?.awardingBodyId || "",
        name: templateData?.name || "",
        commissionGroupName: templateData?.commissionGroupName || "",
        awardingBodyName: templateData?.awardingBodyName || "",
      })
    }
  }, [templateData, editTemplate])

  const { data: versionHistory } = useFetchData({
    path: `business-development-management/agent/agreement/history/${matchId}`,
    queryKey: "fetch-template-version-history",
    method: "GET",
  })

  const onSubmit = () => {
    const formData = form.getValues()

    // Validate form before submission
    form.trigger().then((isValid) => {
      if (!isValid) {
        toast.error("Please fill in all required fields")
        return
      }

      handleSave({
        ...formData,
        id: templateData?.id,
        commissionGroupId: templateData?.commissionGroupId,
        awardingBodyId: templateData?.awardingBodyId,
      })
    })
  }

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center my-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <Form {...form}>
          <Accordion type="single" collapsible className="w-full bg-[#F5F7F9] rounded-xl border border-[#E2E8F0] mt-2">
            <AccordionItem value={`${groupType}-${templateData.id}`}>
              <AccordionTrigger className="flex justify-between items-center p-5">
                <div className="flex justify-between items-center w-full mr-4">
                  <h2 className="font-medium text-md">{templateData.name}</h2>
                  <div className="flex justify-center items-center gap-2">
                    <ActionButton
                      btnSize="sm"
                      handleOpen={() => {
                        if (templateData?.id) {
                          handleDownload(templateData.id)
                        } else {
                          toast.error("Template ID not found")
                        }
                      }}
                      isPending={isPending}
                      buttonContent="Download"
                      loadingContent="Downloading..."
                      disabled={handleDownload.isPending}
                      btnStyle="mr-2"
                    />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#CFD6DD] hidden data-[state=open]:block" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4">
                  <div className="flex justify-around gap-4 items-center my-4">
                    <div className="w-full">
                      <CustomField.Text
                        form={form}
                        name="awardingBodyName"
                        labelName="Awarding Body *"
                        placeholder="Enter awarding body"
                        viewOnly={viewOnly}
                      />
                    </div>
                    <div className="w-full">
                      <CustomField.Text
                        form={form}
                        name="commissionGroupName"
                        labelName="Commission Group *"
                        placeholder="Enter commission group"
                        viewOnly={viewOnly}
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <CustomField.RichTextEditor
                      form={form}
                      name="agreement"
                      labelName="Template Content *"
                      placeholder={
                        groupType === "external"
                          ? "Enter external agent agreement template content"
                          : "Enter internal agent agreement template content"
                      }
                      viewOnly={!editAccess || !editTemplate}
                    />
                  </div>
                  <div className="mt-6 flex justify-between w-full">
                    <div className="">
                      <ActionButton
                        variant="icon"
                        imageSrc={history}
                        handleOpen={() => setOpenVersionModal(true)}
                        tooltipContent="Edit History"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <ActionButton
                        handleOpen={setEditTemplate.bind(null, !editTemplate)}
                        disabled={!editAccess}
                        buttonContent={!editTemplate ? "Edit" : "Cancel"}
                        btnStyle={`${editTemplate ? "bg-black" : "bg-[#013E5B]"} text-white ${
                          !editAccess ? "cursor-not-allowed opacity-50" : ""
                        }`}
                      />
                      <ActionButton
                        handleOpen={onSubmit}
                        disabled={isSubmitting || !editAccess || !editTemplate}
                        buttonContent="Save"
                        loadingContent="Saving..."
                        isPending={isSubmitting}
                        hidden={!editTemplate ? true : false}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Form>
      )}

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={openVersionModal}
        onClose={() => setOpenVersionModal(false)}
        templateName={templateData?.name || "Template"}
        versionHistory={versionHistory?.data || []}
      />
    </>
  )
}
