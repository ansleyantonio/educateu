import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EducateU | Finance | Advanced Course Fee",
  description: "Course Fee",
};

export default function AdvancedCourseFee({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      <div>{children}</div>
    </section>
  );
}
