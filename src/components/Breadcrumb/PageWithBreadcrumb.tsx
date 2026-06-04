"use client";

import { useBreadcrumb } from "@/app/hook/breadcrumb/useBreadcrumb";
import { ReactNode, useEffect } from "react";

type BreadcrumbItem = {
  title: string;
  href?: string;
  icon?: string;
  imageSrc?: string;
};

interface Props {
  items: BreadcrumbItem[];
  children: ReactNode;
}

export const PageWithBreadcrumb = ({ items, children }: Props) => {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs(items);
    return () => {
      // Clear breadcrumbs on unmount (e.g., route change)
      setBreadcrumbs([]);
    };
  }, [items, setBreadcrumbs]);
  return <>{children}</>;
};
