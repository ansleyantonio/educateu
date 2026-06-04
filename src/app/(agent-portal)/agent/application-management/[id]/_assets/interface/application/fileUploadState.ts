export type UploadState = {
  cv: { file: File | null; preview: string | null };
  englishCertificates: { file: File | null; preview: string | null };
  essay: { file: File | null; preview: string | null };
  passportId: { file: File | null; preview: string | null };
  proofOfNameChange: { file: File | null; preview: string | null };
  qualification: { file: File | null; preview: string | null };
  nationalIdentification: { file: File | null; preview: string | null };
  policeClearance: { file: File | null; preview: string | null };
  transcripts: { file: File | null; preview: string | null };
  references: { file: File | null; preview: string | null };
  otherDocument: { file: File | null; preview: string | null };
};
