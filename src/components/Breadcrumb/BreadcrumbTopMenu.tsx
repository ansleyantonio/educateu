"use client";

import { useBreadcrumb } from "@/app/hook/breadcrumb/useBreadcrumb";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SliceText } from "@/utils/slice/slice";
import { ChevronRight, House } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function BreadcrumbTopMenu() {
  const { breadcrumbs } = useBreadcrumb();
  const pathname = usePathname();
  const firstSegment = pathname.split("/")[1] || "";
  const homeHref = `/${firstSegment}`;

  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return (
    <div className="bg-white-50 px-3 py-5">
      {" "}
      {/* Adjust top if header height changes */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <BreadcrumbItem key={index}>
                {isLast ? (
                  <BreadcrumbLink className="text-muted-foreground capitalize">
                    {item?.title?.length > 20 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{SliceText(item.title, 20)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      item?.title
                    )}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      // href={item.href || "#"}
                      href={
                        item.title.toLowerCase() === "home"
                          ? homeHref
                          : item.href || "#"
                      }
                      className="capitalize"
                    >
                      {item.title.toLowerCase() === "home" ? (
                        <House />
                      ) : item?.imageSrc ? (
                        <div className="flex items-center justify-center gap-1">
                          <Image
                            src={item.imageSrc}
                            alt={item.imageAlt || "icon"}
                            width={14}
                            height={14}
                          />
                          <span className="text-sm">{item.title}</span>
                        </div>
                      ) : item?.icon ? (
                        <span className="flex items-center gap-1 justify-center ">
                          {item.icon}
                          <span className="text-sm">{item.title}</span>
                        </span>
                      ) : (
                        item.title
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="w-4 h-4" />
                  </BreadcrumbSeparator>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
