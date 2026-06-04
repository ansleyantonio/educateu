import { CamelToTitle } from "@/utils/CaseConverter";

/* eslint-disable @typescript-eslint/no-explicit-any */
function generateModuleTreeData(modules: { moduleName: string }[]): any[] {
  const actions = ["VIEW", "EDIT", "DELETE"];

  return modules?.map(({ moduleName }) => {
    const key = camelCase(moduleName);

    return {
      title: CamelToTitle(moduleName?.replace(/-/g, " ")),
      value: key,
      key,
      children: actions?.map((action) => ({
        title: action,
        value: `${key}-${action}`,
        key: `${key}-${action}`,
      })),
    };
  });

  function camelCase(str: string): string {
    return str
      .split("-")
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join("");
  }
}

type RoleItem = {
  id: string;
  name: string;
};

type FormattedRole = {
  value: string;
  label: string;
};

function transformRoleArray(roles: RoleItem[]): FormattedRole[] {
  return roles?.map(({ name }) => ({
    value: name,
    label: name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));
}

export const formatDate = {
  generateModuleTreeData,
  transformRoleArray,
};
