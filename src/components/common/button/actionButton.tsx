import { Button } from "@/components/ui/custom_ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import Image from "next/image";
import React, { forwardRef } from "react";

type ButtonType =
  | "link"
  | "icon"
  | "primaryIcon"
  | "success"
  | "primary"
  | "confirm"
  | "default"
  | "tooltip"
  | "outline"
  | "secondary"
  | "update"
  | "destructive"
  | "cancel"
  | "ghost"
  | null
  | undefined;

interface ButtonTooltipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: "submit" | "button" | "reset";
  btnSize?: "default" | "sm" | "lg" | "icon";
  btnStyle?: string;
  tooltipStyle?: string;
  variant?: ButtonType;
  tooltipContent?: string;
  buttonContent?: React.ReactNode;
  icon?: React.ReactNode;
  lastIcon?: React.ReactNode;
  imageSrc?: string;
  lastImageSrc?: string;
  isPending?: boolean;
  imageAlt?: string;
  imageSize?: number;
  handleOpen?: () => void;
  side?: "top" | "right" | "bottom" | "left";
  loadingContent?: React.ReactNode;
  disabled?: boolean;
  hidden?: boolean;
}

const ActionButton = forwardRef<HTMLButtonElement, ButtonTooltipProps>(
  (
    {
      type = "submit",
      btnSize = "default",
      btnStyle,
      tooltipStyle,
      variant = "primary",
      tooltipContent,
      buttonContent,
      icon,
      lastIcon,
      imageSrc,
      lastImageSrc,
      isPending = false,
      imageAlt = "icon",
      imageSize = 18,
      handleOpen,
      side = "top",
      loadingContent,
      disabled = false,
      hidden = false,
      ...props
    },
    ref,
  ) => {
    const buttonEl = (
      <Button
        ref={ref}
        type={type}
        size={btnSize}
        {...props}
        onClick={handleOpen}
        variant={variant}
        disabled={isPending || disabled}
        className={cn(
          "capitalize",
          hidden && "hidden",
          btnStyle,
          isPending && "opacity-60 cursor-not-allowed",
          (icon || imageSrc) &&
            (buttonContent || loadingContent || isPending) &&
            "gap-x-3",
        )}
      >
        {!isPending &&
          (imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt || "icon"}
              width={imageSize || 16}
              height={imageSize || 16}
            />
          ) : (
            icon
          ))}

        {(buttonContent || loadingContent || isPending) && (
          <span>
            {isPending ? (loadingContent ?? buttonContent) : buttonContent}
          </span>
        )}

        {!isPending &&
          (lastImageSrc ? (
            <Image
              src={lastImageSrc}
              alt={imageAlt || "icon"}
              width={imageSize || 16}
              height={imageSize || 16}
            />
          ) : (
            lastIcon
          ))}

        {isPending && (
          <Loader className="ml-2 w-4 h-4 animate-spin" strokeWidth={3} />
        )}
      </Button>
    );

    // Wrap in tooltip only if tooltipContent exists
    if (!tooltipContent) return buttonEl;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
        <TooltipContent side={side} className={cn("bg-gray-500", tooltipStyle)}>
          <p className="text-[10px]">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    );
  },
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
/**
 * ActionButton is a flexible button with optional tooltip and loading state.
 *
 * - `variant`: Button style.
 * - `btnStyle`: Extra class for custom button styling.
 * - `tooltipContent`: Text to show inside tooltip.
 * - `tooltipStyle`: Extra class for tooltip styling.
 * - `buttonContent`: Text to show on the button.
 * - `icon`: Optional icon element.
 * - `lastIcon`: Optional lastIcon element.
 * - `imageSrc`: Optional image instead of icon.
 * - `lastImageSrc`: Optional lastImage instead of icon.
 * - `imageAlt`: Alt text for image (default: "icon").
 * - `imageSize`: Image size in pixels (default: 18).
 * - `handleOpen`: Function to call on button click.
 * - `side`: Tooltip position (top, bottom, left, right).
 * - `isPending`: Shows loading spinner and disables button.
 * - `loadingContent`: Text to show when loading.
 */
