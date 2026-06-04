export interface FileItem {
  id: string;
  name: string;
  size: string;
  progress?: number;
  status?: "uploading" | "complete";
  timeLeft?: string;
  type: "pdf" | "image" | "other";
  path?: string;
  uploadStartTime?: number;
  lastProgressTime?: number;
  fieldName?: keyof UploadState;
}

export type UploadState = {
  cv: { files: File[]; previews: string[] };

  personalStatement: { files: File[]; previews: string[] };
  consentForm: { files: File[]; previews: string[] };
  englishCertificates: { files: File[]; previews: string[] };
  essay: { files: File[]; previews: string[] };
  passportId: { files: File[]; previews: string[] };
  proofOfNameChange: { files: File[]; previews: string[] };
  qualification: { files: File[]; previews: string[] };
  nationalIdentification: { files: File[]; previews: string[] };
  policeClearance: { files: File[]; previews: string[] };
  transcripts: { files: File[]; previews: string[] };
  references: { files: File[]; previews: string[] };
  otherDocument: { files: File[]; previews: string[] };
};
