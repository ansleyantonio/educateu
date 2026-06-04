"use client";

import React from "react";
import type { ReactNode } from "react";
import { useState, useLayoutEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import ActionButton from "./actionButton";

interface ResponsiveButtonGroupProps {
  children: ReactNode;
  gap?: number;
}

export function ResponsiveButtonGroup({
  children,
  gap = 8,
}: ResponsiveButtonGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const childArray = React.Children.toArray(children);
  const [visibleCount, setVisibleCount] = useState(childArray.length);

  // Calculate how many buttons can fit in the container
  useLayoutEffect(() => {
    const calculate = () => {
      if (!containerRef.current || !measureRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const buttons = Array.from(measureRef.current.children) as HTMLElement[];
      const widths = buttons.map((btn) => btn.offsetWidth);

      // Check if all buttons fit
      const totalWidth = widths.reduce(
        (sum, w, i) => sum + w + (i > 0 ? gap : 0),
        0,
      );
      if (totalWidth <= containerWidth) {
        setVisibleCount(childArray.length);
        return;
      }

      // Calculate how many buttons fit before dropdown
      const availableWidth = containerWidth - 48 - gap; // 48px for dropdown button
      let usedWidth = 0;
      let count = 0;

      for (let i = 0; i < widths.length; i++) {
        const nextWidth = usedWidth + widths[i] + (i > 0 ? gap : 0);
        if (nextWidth <= availableWidth) {
          usedWidth = nextWidth;
          count++;
        } else break;
      }

      setVisibleCount(Math.max(0, count));
    };

    calculate();
    // Observe container resize
    const observer = new ResizeObserver(calculate);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [childArray, gap]);

  // Split into visible and hidden buttons
  const visible = childArray.slice(0, visibleCount);
  const hidden = childArray.slice(visibleCount);

  return (
    <div ref={containerRef} className="flex gap-2 items-center w-full">
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        className="flex fixed gap-2 opacity-0 pointer-events-none -z-50"
      >
        {childArray}
      </div>

      {/* Visible buttons */}
      {visible}

      {/* Dropdown for overflow buttons */}
      {hidden.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ActionButton
              type="button"
              icon={<MoreHorizontal />}
              variant="icon"
              tooltipContent="More Actions"
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="flex z-50 gap-2 min-w-[150px]"
          >
            {hidden.map((child, idx) => (
              <DropdownMenuItem
                key={idx}
                // Prevents auto-close when clicking buttons
                onSelect={(e) => e.preventDefault()}
              >
                {child}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
