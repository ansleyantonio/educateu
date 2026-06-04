import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center transition-all ease-in-out duration-300 active:scale-95 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // ---- Base Variants ----
        default:
          "bg-button-primary text-button-primary-text shadow hover:bg-button-primary-hover",

        primary:
          "bg-button-primary text-button-primary-text shadow hover:bg-button-primary-hover",

        outline:
          "border border-button-outline-border text-button-outline-text bg-background hover:bg-button-outline-hover",

        secondary:
          "bg-button-secondary text-button-secondary-text shadow hover:bg-button-secondary-hover",

        ghost: "hover:bg-button-outline-hover hover:text-button-outline-text",

        link: "text-blue-600 underline-offset-4 hover:underline",

        // ---- Status Variants ----
        confirm:
          "bg-button-confirm text-button-confirm-text shadow hover:bg-button-confirm-hover",

        cancel:
          "bg-button-cancel text-button-cancel-text shadow hover:bg-button-cancel-hover",

        destructive:
          "bg-button-destructive text-button-destructive-text shadow hover:bg-button-destructive-hover",

        success:
          "bg-button-success text-button-success-text shadow hover:bg-button-success-hover",

        update:
          "border-2 border-button-update-border bg-button-update-bg text-button-update-text shadow-sm hover:border-button-update-hoverBorder hover:bg-button-update-hoverBg transition-colors",

        // ---- Special Variants ----
        tooltip:
          "bg-button-tooltip text-button-tooltip-text shadow-sm hover:bg-button-tooltip-hover",

        icon: "border !p-2 border-button-icon-border px-2 py-1 shadow-sm hover:bg-button-icon-hoverBg hover:border-button-icon-hoverBorder hover:text-button-icon-text",

        primaryIcon:
          "bg-button-primaryIcon !p-2 text-button-primaryIcon-text font-semibold shadow-sm px-3 py-[1px] hover:bg-button-primaryIcon-hover",
      },

      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "!rounded-full",
      },

      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 rounded-md p-1 px-3 !font-bold text-xs",
        xs: "h-5 rounded-md px-2 py-1 text-xs",
        lg: "h-10 rounded-md !px-4",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
