"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex justify-between h-14 space-x-4 px-2 items-center rounded-lg  text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex p-4 cursor-pointer items-center w-full justify-center !font-semibold whitespace-nowrap text-md data-[state=active]:font-medium transition-all disabled:opacity-50 focus-visible:outline-none outline-none  border-b-[3px] border-transparent data-[state=active]:text-[#011C28]  data-[state=active]:border-b-[#011C28] focus:outline-none focus:ring-0 shadow-none",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Tab Button  interface
interface TabWithCountProps {
  value: string;
  label: string;
  onClick: (value: string) => void;
  className?: string;
  total?: number;
}

const TabButton: React.FC<TabWithCountProps> = ({
  value,
  label,
  onClick,
  total,
  className = "",
}) => {
  return (
    <TabsTrigger
      onClick={() => onClick(value)}
      value={value}
      className={`inline-flex justify-center items-center font-semibold  p-4 whitespace-nowrap cursor-pointer ${className}`}
    >
      {label}
      <span className="ml-2 text-xs font-thin text-gray-400">{total}</span>
    </TabsTrigger>
  );
};

export { Tabs, TabsList, TabsTrigger, TabButton, TabsContent };
