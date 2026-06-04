import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview",
  description: "Finance Management",
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Page Content */}
      <div className="pr-2 w-full">{children}</div>
    </>
  );
}
