/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isPathActive } from "../utils/isActivePath";

export const NestedMenu = ({ items }: { items: any[] }) => {
  const pathname = usePathname();
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = isPathActive(pathname, item);
        const hasNested = item.subMenu && item.subMenu.length > 0;

        return (
          <div
            key={item.href}
            className="border border-transparent h-fit group min-w-[280px]"
          >
            {/* <Link
              href={item.href}
              className="flex gap-2 items-center p-2 text-white rounded hover:bg-[#013E5B]"
            >
              <Image
                src={item.icon?.src}
                alt={item.label || item.title}
                width={18}
                height={18}
              />
              <span className="text-sm">{item.label || item.title}</span>
              {hasNested && (
                <ChevronRight className="ml-auto w-4 h-4 text-white" />
              )}
            </Link> */}

            {!hasNested ? (
              // Navigable link
              <Link
                href={item.href}
                className={`flex gap-2 items-center p-2 text-white rounded hover:bg-[#013E5B] ${
                  isActive ? "bg-[#002F45] my-1" : ""
                }
`}
              >
                <Image
                  src={item.icon?.src}
                  alt={item.label || item.title}
                  width={18}
                  height={18}
                />
                <span className="text-xs">{item.label || item.title}</span>
              </Link>
            ) : (
              // Just a clickable div without navigation
              <div
                className={`flex gap-2 items-center p-2 my-1 text-white rounded cursor-pointer hover:bg-[#013E5B] ${
                  isActive ? "bg-[#002F45] my-1" : ""
                }
`}
              >
                <Image
                  src={item.icon?.src}
                  alt={item.label || item.title}
                  width={18}
                  height={18}
                />
                <span className="text-xs">{item.label || item.title}</span>
                <ChevronRight className="ml-auto w-4 h-4 text-white" />
              </div>
            )}

            {/* Recursive nested flyout menu */}
            {hasNested && (
              <div
                className={`absolute left-[75%]  hidden group-hover:block bg-[#002F45] border border-transparent rounded-md shadow-md  min-w-[260px] p-2`}
              >
                {/* <NestedMenu items={item.subMenu} /> */}
                <div className="ml-5">
                  {item.subMenu.map((subItem: any) => {
                    const isActive = isPathActive(pathname, subItem); // ✅ move logic here

                    return (
                      <Link
                        href={subItem.href}
                        key={subItem.href}
                        className={`flex gap-2 items-center py-3 px-2 text-white rounded hover:bg-[#013E5f] ${
                          isActive ? "bg-[#013E5f] my-1" : ""
                        }`}
                      >
                        <Image
                          src={subItem.icon?.src}
                          alt={subItem.label || subItem.title}
                          width={18}
                          height={18}
                        />
                        <span className="text-sm">
                          {subItem.label || subItem.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* <div className="ml-4">
                  {item.subMenu.map((nested: any) => {
                    const nestedActive = isPathActive(pathname, nested);
                    return (
                      <Link
                        href={nested.href}
                        key={nested.href}
                        className={`block p-2 ${
                          nestedActive ? "bg-[#013E5B]" : ""
                        }`}
                      >
                        {nested.label}
                      </Link>
                    );
                  })}
                </div> */}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
