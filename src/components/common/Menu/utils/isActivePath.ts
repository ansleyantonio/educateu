export interface MenuItem {
  href?: string;
  subMenu?: MenuItem[];
}

export function isPathActive(pathname: string, item: MenuItem): boolean {
  const cleanPath = pathname.split("?")[0];
  const hasSubmenu = !!(item.subMenu && item.subMenu.length > 0);

  const currentSegments = cleanPath.split("/");
  const itemSegments = item.href?.split("/") || [];

  // Checks
  const isHrefActive = item.href && cleanPath === item.href.split("?")[0];

  const isParentPathActive =
    item.href &&
    currentSegments.slice(0, itemSegments.length).join("/") ===
      itemSegments.join("/");

  // Recursive submenu check
  const checkActiveNested = (items: MenuItem[]): boolean => {
    return items.some((sub) => {
      const subHref = sub.href?.split("?")[0];
      const subSegments = subHref?.split("/") || [];

      return (
        (subHref && cleanPath === subHref) ||
        (subHref &&
          currentSegments.slice(0, subSegments.length).join("/") ===
            subSegments.join("/")) ||
        (sub.subMenu && checkActiveNested(sub.subMenu))
      );
    });
  };

  const isNestedActive = hasSubmenu && checkActiveNested(item.subMenu!);

  return Boolean(isHrefActive || isParentPathActive || isNestedActive);
}
