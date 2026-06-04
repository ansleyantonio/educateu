/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ReactNode, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import ActionButton from "@/components/common/button/actionButton";
import pdf from "/public/assets/icons/pdf.svg";
import Image from "next/image";

type ApplicantPdfBehavior = "preview" | "download";

interface PdfManagerWrapperProps {
  data: any;
  isLoading: boolean;
  behavior?: ApplicantPdfBehavior;
  pdfComponent: ReactNode;
}

const PdfManagerWrapper = ({
  data,
  isLoading,
  behavior = "preview",
  pdfComponent,
}: PdfManagerWrapperProps) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDownload, setConfirmDownload] = useState(false);

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;

    try {
      const element = pdfRef.current;

      // Ensure the element is visible for capture
      const originalDisplay = element.style.display;
      element.style.display = "block";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Restore original display
      element.style.display = originalDisplay;

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Application_${data?.application?.id || "Unknown"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleAction = () => {
    if (behavior === "preview") {
      setShowPreview(true);
    } else if (behavior === "download") {
      setConfirmDownload(true);
    }
  };

  // Handle direct download (when behavior is "download")
  const handleDirectDownload = async () => {
    setConfirmDownload(false);
    await handleDownloadPdf();
  };

  return (
    <div>
      {/* Action Button */}
      <div className="flex gap-4">
        <ActionButton
          icon={
            behavior === "preview" ? (
              <Eye size={28} color="#555F6D" />
            ) : (
              <Image src={pdf} alt="PDF" width={16} height={16} />
            )
          }
          variant="icon"
          handleOpen={handleAction}
          tooltipContent={
            behavior === "preview" ? "Preview PDF" : "Download PDF"
          }
        />
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="overflow-y-auto max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Application PDF Preview</DialogTitle>
          </DialogHeader>

          <div ref={pdfRef}>{pdfComponent}</div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleDownloadPdf}>Download</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDownload} onOpenChange={setConfirmDownload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Download Confirmation</DialogTitle>
          </DialogHeader>

          <p>Are you sure you want to download this application as a PDF?</p>

          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setConfirmDownload(false)}>
              Cancel
            </Button>
            <Button onClick={handleDirectDownload}>Yes, Download</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden render area for download behavior */}
      {behavior === "download" && (
        <div
          ref={pdfRef}
          style={{
            position: "absolute",
            left: "-9999px",
            top: "0",
            width: "210mm", // A4 width
            backgroundColor: "white",
          }}
        >
          {pdfComponent}
        </div>
      )}
    </div>
  );
};

export default PdfManagerWrapper;
