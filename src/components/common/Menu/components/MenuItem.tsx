/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NestedMenu } from "./NestedMenu";
import { isPathActive } from "../utils/isActivePath";

export const AppMenuItem = ({
  item,
  navigation,
  level = 0,
}: {
  item: any;
  navigation: boolean;
  level?: number;
}) => {
  const pathname = usePathname();
  const hasSubmenu = item.subMenu && item.subMenu.length > 0;
  const isActive = isPathActive(pathname, item);

  const [isOpen, setIsOpen] = useState(isActive);
  const label = item.customLabelName || item.label || item.title;

  const handleClick = () => {
    if (hasSubmenu) {
      setIsOpen(!isOpen);
    }
  };

  const content = (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between w-full gap-2 p-2 rounded-md cursor-pointer hover:bg-[#002F45] transition-all ${
        isActive ? "bg-[#002F45] my-1" : ""
      }`}
    >
      <div className="flex gap-2 items-center">
        <Image src={item.icon?.src} alt={label} width={24} height={24} />
        {navigation && (
          <span className={` text-sm  capitalize text-white`}>{label}</span>
        )}
      </div>

      {hasSubmenu && navigation && (
        <ChevronRight
          className={`text-white w-4 h-4 transform transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      )}
    </div>
  );

  // === CASE 1: Sidebar Collapsed, No Submenu ===
  if (!navigation && !hasSubmenu) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={item.href}>
            <div>{content}</div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  // === CASE 2: Sidebar Collapsed, With Submenu ===
  if (!navigation && hasSubmenu) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{content}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="w-auto bg-[#011C28] p-0 flex flex-col gap-0">
          {/* Menu Item Label */}
          <div className="px-4 py-3 text-sm text-white font-medium border-b border-[#002F45] text-center capitalize">
            {label.replace(/-/g, " ")}
          </div>
          {/* Submenu */}
          <div className="px-3 py-2">
            <NestedMenu items={item.subMenu} />
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // === CASE 3: Sidebar Expanded ===
  return (
    <div className="w-full">
      {item.href && !hasSubmenu ? (
        <Link href={item.href}>{content}</Link>
      ) : (
        <div>{content}</div>
      )}

      {hasSubmenu && isOpen && (
        <div className="ml-4 space-y-2">
          {item.subMenu.map((subItem: any) => (
            <AppMenuItem
              key={subItem.href || subItem.label}
              item={subItem}
              navigation={navigation}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};