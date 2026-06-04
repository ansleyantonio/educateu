/* eslint-disable @typescript-eslint/no-explicit-any */
import MenuItem from "antd/es/menu/MenuItem";

type MenuItem = {
  href: string;
  icon: string;
  label: string;
  order?: number;
  customLabelName?: string;
};

type SubMenuItem = {
  title: string;
  href: string;
  icon: string;
  order?: number;
};

type SubMenuMap = {
  [key: string]: SubMenuItem[];
};

type Module = {
  moduleId: string;
  moduleGroup?: string; // Changed to optional, matches your data
  moduleName: string;
  modulePermission: string[];
  permissionType: string;
  permissionStartDate: null | Date;
  permissionEndDate: null | Date;
  manualRevocation: boolean;
};

export type FinalMenuItem = {
  label: string;
  href?: string;
  icon: string;
  permissions?: string[];
  subMenu?: FinalSubMenuItem[];
  order?: number;
  customLabelName?: string; //
  groupName?: string;
};

type FinalSubMenuItem = {
  label?: string;
  title?: string;
  href: string;
  icon?: string;
  permissions?: string[];
  subMenu: FinalSubMenuItem[];
  customLabelName?: string; //
};

/**
 * Builds a nested menu structure grouped by moduleGroup (if present),
 * filtering modules with valid icons and permissions.
 *
 * @param moduleList List of modules with permissions and grouping info
 * @param menuWithIcons List of menu items with href and icons
 * @param subMenuMap Mapping from moduleName to its nested submenu items
 * @returns Array of FinalMenuItem representing grouped and nested menu structure
 */
export const buildFinalMenuStructure = (
  moduleList: Module[] = [],
  menuWithIcons: MenuItem[] = [],
  subMenuMap: SubMenuMap = {}
): FinalMenuItem[] => {
  // sorting TOTO
  // Create a label-to-index map based on adminModuleItemsList order
  const labelOrderMap = new Map(
    menuWithIcons.map((item, index) => [item.label, index])
  );

  // Only include modules that have a matching icon in menuWithIcons and non-empty permissions
  const filteredModules = moduleList.filter(
    (mod) =>
      mod.modulePermission.length > 0 &&
      menuWithIcons.some((menu) => menu.label === mod.moduleName)
  );

  // Store grouped menu entries keyed by moduleGroup or moduleName
  const groupedMap: Record<string, FinalMenuItem> = {};

  for (const mod of filteredModules) {
    const menuItem = menuWithIcons.find((m) => m.label === mod.moduleName);
    if (!menuItem) continue;

    // Create submenu entries if subMenuMap has entries for this module
    const subMenus: FinalSubMenuItem[] = (subMenuMap[mod.moduleName] || []).map(
      (sub) => ({
        title: sub.title,
        href: sub.href,
        icon: sub.icon,
        subMenu: [], // Assuming no further nesting in this example
        order: sub?.order,
      })
    );

    const menuEntry: FinalMenuItem = {
      label: mod.moduleName,
      href: menuItem.href!, // Add the ! operator to assert that href is not null or undefined
      icon: menuItem.icon,
      permissions: mod.modulePermission,
      subMenu: subMenus,
      order: menuItem.order,
      customLabelName: menuItem?.customLabelName || mod.moduleName,
      groupName: mod.moduleGroup,
    };

    // Use moduleGroup if available, else fallback to moduleName as group key
    const groupKey = mod.moduleGroup || mod.moduleName;

    if (groupKey !== mod.moduleName) {
      // Group modules under their moduleGroup key
      if (!groupedMap[groupKey]) {
        // Find group icon and order from menuWithIcons
        const groupMenuItem = menuWithIcons.find(
          (item) => item.label === groupKey
        );

        groupedMap[groupKey] = {
          label: groupKey,
          icon: groupMenuItem?.icon || menuItem.icon,
          permissions: [],
          subMenu: [],
          order: groupMenuItem?.order || menuItem.order,
          customLabelName: groupMenuItem?.customLabelName || groupKey, //
          groupName: mod.moduleGroup,
        };
      }

      // Append current module as a submenu of the group
      groupedMap[groupKey].subMenu?.push(menuEntry as FinalSubMenuItem);

      // Merge permissions into group permissions without duplicates
      groupedMap[groupKey].permissions = Array.from(
        new Set([
          ...(groupedMap[groupKey].permissions || []),
          ...mod.modulePermission,
        ])
      );
    } else {
      // Single top-level module without grouping
      groupedMap[groupKey] = menuEntry;
    }
  }

  // sorting TOTO
  // return Object.values(groupedMap); without sorting  // option 1
  // --------------------------------------------------- option -2
  /**
   * Recursively sort subMenus by 'order'
   */
  const sortSubMenus = (menu: any): FinalMenuItem => {
    if (menu.subMenu && menu.subMenu.length > 0) {
      menu.subMenu = menu.subMenu
        .map(sortSubMenus)
        .sort((a: any, b: any) => (a.order ?? 9999) - (b.order ?? 9999));
    }
    return menu;
  };

  // Convert groupedMap to array, sort all levels, and return
  return Object.values(groupedMap)
    .map(sortSubMenus)
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
};
