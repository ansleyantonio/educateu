"use client";
import ClipboardJS from "clipboard";
import { CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
// import Copy from "/public/assets/logo/admin/agents/copy-svg.svg"
import { Copy } from "lucide-react";

export function CopyWithIcon({
  text,
  color = "white",
  size = 3
}: {
  text: string;
  color?: string;
  size?: number;
}) {

  const buttonRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const clipboard = new ClipboardJS(buttonRef.current!, {
      text: () => text,
    });

    clipboard.on("success", () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

    clipboard.on("error", (e) => console.error("Copy failed:", e));

    return () => clipboard.destroy();
  }, [text]);

  return (
    <button ref={buttonRef} className="cursor-pointer w-fit">
      {copied ? (
        <CheckCircle size={16} className="text-green-500" strokeWidth={4} />
      ) : (
        <Copy className={`text-${color}`} size={16} strokeWidth={size} />
      )}
    </button>
  );
}
