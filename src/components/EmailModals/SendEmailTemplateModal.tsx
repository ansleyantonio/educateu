/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { CustomField } from "@/components/common/fields/cusInputField";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { fileToBase64 } from "@/utils/convertBase64";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronUp,
  File,
  FileText,
  ImageIcon,
  Loader2,
  Mail,
  Minimize2,
  Paperclip,
  RotateCcw,
  Send,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import EmailEditor, { type EditorRef } from "react-email-editor";
import { useForm } from "react-hook-form";
import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createSendEmailSchema = (hasBulkList: boolean) =>
  z.object({
    email_subject: z.string().min(1, "Subject is required"),
    email_body: z.string().optional(),
    email_to: hasBulkList
      ? z.array(z.string().email()).optional()
      : z.array(z.string().email()).min(1, "At least one To email is required"),
    email_cc: z.array(z.string().email()).optional(),
    email_bcc: z.array(z.string().email()).optional(),
    email_list: hasBulkList
      ? z
          .array(z.string().email())
          .min(1, "Please select at least one recipient from the list")
      : z.array(z.string().email()).optional(),
  });

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface SendEmailModalProps {
  open: boolean;
  onClose: () => void;
  emailList?: string[] | null;
  email_subject?: string;
  email_body?: string;
  email_to?: string[];
  email_cc?: string[];
  email_bcc?: string[];
  viewOnly?: boolean;
}

export function SendEmailTemplateModal({
  open,
  onClose,
  emailList = [],
  email_subject = "",
  email_body = "",
  email_to = [],
  email_cc = [],
  email_bcc = [],
  viewOnly = false,
}: SendEmailModalProps) {
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [emailEditorLoaded, setEmailEditorLoaded] = useState(false);
  const [isEmptyBody, setIsEmptyBody] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emailEditorRef = useRef<EditorRef>(null);

  const isBulkMode = Boolean(emailList && emailList.length > 0);
  const sendEmailSchema = createSendEmailSchema(isBulkMode);
  type SendEmailFormData = z.infer<typeof sendEmailSchema>;

  const form = useForm<SendEmailFormData>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      email_subject,
      email_body,
      email_to: !isBulkMode ? email_to : [],
      email_cc: email_cc || [],
      email_bcc: email_bcc || [],
      email_list: isBulkMode ? emailList ?? [] : [],
    },
    mode: "onBlur",
  });

  const sendEmail = useApiMutation({
    safe: false,
    path: `communication/send-bulk-emails`,
    method: "POST",
    dataType: "application/json",
    onSuccess: (data) => {
      showToast("success", data?.message || "Email sent successfully");
      form.reset();
      setAttachments([]);
      onClose();
    },
    onError: (error) => {
      showToast("error", error?.message || "Failed to send email");
    },
  });

  const isEmptyContent = () => {
    if (emailEditorRef.current) {
      emailEditorRef.current.editor?.exportHtml((editorData: any) => {
        let isEmpty = true;
        const {
          design: { body },
        } = editorData;
        const { rows } = body;

        outerLoop: for (let i = 0; i < rows.length; i++) {
          const { columns } = rows[i];
          for (let j = 0; j < columns.length; j++) {
            const { contents } = columns[j];
            if (contents.length) {
              isEmpty = false;
              break outerLoop; // Exit all loops once content is found
            }
          }
        }

        if (isEmpty) {
          setIsEmptyBody(true);
        } else {
          setIsEmptyBody(false);
        }
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: AttachmentFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        showToast(
          "error",
          `File "${file.name}" is too large. Maximum size is 10MB.`
        );
        continue;
      }

      newAttachments.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (
      type.includes("pdf") ||
      type.includes("document") ||
      type.includes("text")
    )
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const onSubmit = async (data: SendEmailFormData) => {
    isEmptyContent();
    if (isEmptyBody) {
      showToast("error", "Email body is empty");
      return;
    }
    const base64Attachments = await Promise.all(
      attachments.length > 0
        ? attachments?.map(async (att) => ({
            filename: att.name,
            content: (await fileToBase64(att.file)).split(",")[1], // remove prefix
            encoding: "base64",
            contentType: att.type,
          }))
        : []
    );
    if (emailEditorRef.current) {
      emailEditorRef.current.editor?.exportHtml((editorData: any) => {
        const { html } = editorData;

        const emailPayload = {
          subject: data.email_subject,
          body: html,
          email: isBulkMode
            ? data.email_list || []
            : Array.from(
                new Set([...(data.email_to || []), ...(data.email_list || [])])
              ),
          cc: data.email_cc || [],
          bcc: data.email_bcc || [],
          attachments:
            base64Attachments.length > 0 ? base64Attachments : undefined,
        };
        sendEmail.mutate(emailPayload);
      });
    }
  };

  const onEditorReady = () => {
    setEmailEditorLoaded(true);
    if (email_body && emailEditorRef.current) {
      try {
        const templateJson = JSON.parse(email_body);
        emailEditorRef.current.editor?.loadDesign(templateJson);
      } catch {
        console.error("Failed to parse email body as JSON", email_body);
      }
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset({
        email_subject,
        email_body,
        email_to: !isBulkMode ? email_to : [],
        email_cc: email_cc || [],
        email_bcc: email_bcc || [],
        email_list: isBulkMode ? [] : [],
      });
      setShowCC(false);
      setShowBCC(false);
      setEmailEditorLoaded(false);
      setIsMinimized(false);
      setAttachments([]);
    }
  }, [open, isBulkMode]);

  const handleArrayInputChange =
    (fieldName: keyof SendEmailFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const arr = rawValue
        .split(/[\s,]+/) // split on spaces or commas
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      form.setValue(fieldName, arr as any, { shouldValidate: true });
    };

  const handleSelectAll = () => {
    const allSelected =
      form.watch("email_list")?.length === (emailList ?? []).length;
    form.setValue("email_list", allSelected ? [] : [...(emailList ?? [])]);
  };

  const selectedCount = form.watch("email_list")?.length || 0;
  const totalRecipients = isBulkMode
    ? selectedCount
    : (email_to?.length || 0) + selectedCount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl max-h-[95vh] p-0 gap-0 bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Compose Email</DialogTitle>
        </DialogHeader>

        {/* Gmail-like Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">New Message</span>
            </div>
            {totalRecipients > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-2" />
                {totalRecipients} recipient{totalRecipients !== 1 ? "s" : ""}
              </Badge>
            )}
            {attachments.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                {attachments.length} attachment
                {attachments.length !== 1 ? "s" : ""}
              </Badge>
            )}
            {isBulkMode && (
              <Badge variant="outline" className="text-xs">
                Bulk Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 absolute right-10 top-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              {isMinimized ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-4 max-h-[calc(95vh-80px)] overflow-y-auto">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit, onFormError)}
                    className="space-y-6"
                  >
                    {/* Recipients Section - Gmail Style */}
                    <div className="space-y-3">
                      {!isBulkMode && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                            <label className="text-sm font-medium text-gray-700 w-12">
                              To
                            </label>
                            <div className="flex-1">
                              <CustomField.Text
                                name="email_to"
                                placeholder="Recipients"
                                form={form}
                                viewOnly={viewOnly}
                                disabled={viewOnly}
                                isArray={true}
                                onChange={handleArrayInputChange("email_to")}
                              />
                            </div>
                            <div className="flex gap-1">
                              {!showCC && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowCC(true)}
                                  className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
                                >
                                  Cc
                                </Button>
                              )}
                              {!showBCC && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowBCC(true)}
                                  className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
                                >
                                  Bcc
                                </Button>
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {showCC && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="flex items-center gap-3 py-2 border-b border-gray-100"
                              >
                                <label className="text-sm font-medium text-gray-700 w-12">
                                  Cc
                                </label>
                                <div className="flex-1">
                                  <CustomField.Text
                                    name="email_cc"
                                    placeholder="Carbon copy"
                                    form={form}
                                    onChange={handleArrayInputChange(
                                      "email_cc"
                                    )}
                                    isArray={true}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowCC(false)}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {showBCC && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="flex items-center gap-3 py-2 border-b border-gray-100"
                              >
                                <label className="text-sm font-medium text-gray-700 w-12">
                                  Bcc
                                </label>
                                <div className="flex-1">
                                  <CustomField.Text
                                    name="email_bcc"
                                    placeholder="Blind carbon copy"
                                    form={form}
                                    onChange={handleArrayInputChange(
                                      "email_bcc"
                                    )}
                                    isArray={true}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowBCC(false)}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Bulk Email List */}
                      {emailList && emailList.length > 0 && (
                        <Card className="border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  {isBulkMode
                                    ? "Select Recipients"
                                    : "Bulk Email List"}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {emailList.length}
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleSelectAll}
                                className="text-xs h-7 bg-transparent"
                              >
                                {selectedCount === emailList?.length
                                  ? "Deselect All"
                                  : "Select All"}
                              </Button>
                            </div>
                            <CustomField.SelectField
                              name="email_list"
                              options={emailList?.map((email) => ({
                                label: email,
                                value: email,
                              }))}
                              placeholder={
                                isBulkMode
                                  ? "Select recipients *"
                                  : "Select emails *"
                              }
                              form={form}
                              type="multiple"
                            />
                            {selectedCount > 0 && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                {selectedCount} email
                                {selectedCount !== 1 ? "s" : ""} selected
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Subject Line - Gmail Style */}
                    <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <label className="text-sm font-medium text-gray-700 w-12">
                        Subject
                      </label>
                      <div className="flex-1">
                        <CustomField.Text
                          name="email_subject"
                          placeholder="Email Subject *"
                          form={form}
                        />
                      </div>
                    </div>

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Paperclip className="h-4 w-4" />
                          Attachments ({attachments.length})
                        </div>
                        <div className="space-y-2">
                          {attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-gray-500">
                                  {getFileIcon(attachment.type)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(attachment.id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Email Editor */}
                    <div className="space-y-2">
                      <div className="border rounded-lg overflow-hidden bg-white min-h-[400px]">
                        {!emailEditorLoaded && (
                          <div className="flex items-center justify-center h-96 bg-gray-50">
                            <div className="text-center">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                              <p className="text-sm text-gray-500">
                                Loading email editor...
                              </p>
                            </div>
                          </div>
                        )}
                        <EmailEditor
                          ref={emailEditorRef}
                          onReady={onEditorReady}
                          minHeight={400}
                          options={{
                            displayMode: "email",
                            locale: "en",
                          }}
                        />
                      </div>
                      {isEmptyBody && (
                        <p className="text-sm text-red-500">
                          Please add email content.
                        </p>
                      )}
                    </div>

                    {/* Floating Sticky Footer */}
                    <div
                      className="sticky bottom-1 left-0 right-0 z-50 flex justify-between items-center
             bg-gray-50 border-2 rounded-lg shadow-lg p-3 mx-6"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {(totalRecipients || (emailList?.length ?? 0)) > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {totalRecipients || (emailList?.length ?? 0)}{" "}
                            recipient
                            {(totalRecipients || (emailList?.length ?? 0)) !== 1
                              ? "s"
                              : ""}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {/* <Button
                          type="button"
                          variant="ghost"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={sendEmail.isPending}
                          size="sm"
                        >
                          <Paperclip className="h-4 w-4 mr-1" />
                          Attach
                        </Button> */}
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            form.reset();
                            setAttachments([]);
                          }}
                          disabled={sendEmail.isPending}
                          size="sm"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                        <Button
                          type="submit"
                          disabled={sendEmail.isPending}
                          className="min-w-[100px]"
                        >
                          {sendEmail.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                  </form>
                </Form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
