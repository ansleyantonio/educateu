"use client";

type SectionHeaderPropsType = {
  title: string;
  total: number;
  label: string;
  labels?: string;
};

export function SectionHeader({ title, total, label, labels }: SectionHeaderPropsType) {
  return (
    <div className="flex gap-2 justify-start items-center">
      <h1 className="text-lg font-bold leading-6 text-black">{title}</h1>
      <span className="py-1 px-3 text-sm text-blue-600 bg-blue-50 rounded-full text-nowrap">
        {total === 1 ? `1 ${label}` : `${total} ${labels}`}
      </span>
    </div>
  );
}