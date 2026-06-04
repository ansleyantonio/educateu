/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Tooltip from "@/app/admin/user-management/_assets/components/page_components/tooltip/Tooltip";
import DeleteTemporaryModal from "./deleteTemporaryModal";

const PERMISSION_LABELS = {
  GET: "Read",
  POST: "Edit",
  DELETE: "Delete",
} as const;
type PermissionKey = keyof typeof PERMISSION_LABELS;

const FormSchema = z.object({
  categories: z.array(z.any()),
  manualRevocation: z.boolean(),
  day: z.string(),
});

const formatDateRange = (startDate: string | null, endDate: string | null) => {
  if (!startDate || !endDate) return "Manual Revocation";

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const startStr = start.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
  const endStr = end.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

  const timeDiff = end.getTime() - now.getTime();
  const remainingDays = Math.max(
    0,
    Math.ceil(timeDiff / (1000 * 60 * 60 * 24)),
  );

  return `${startStr} - ${endStr} (${remainingDays} ${remainingDays === 1 ? "day" : "days"})`;
};

export function TempAccessForm({
  permissionData,
  closeModal,
}: {
  permissionData: {
    portalCategorieName: string;
    portalCategorieId: string;
    modules: {
      moduleName: string;
      moduleId: string;
      portalCategorieId: string;
      temporaryPermissions: string[];
      temporaryPermissionsInfo: {
        id: string;
        manualRevocation: boolean;
        permissionEndDate: string | null;
        permissionStartDate: string | null;
      } | null;
    }[];
  }[];
  closeModal: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      categories: permissionData.map((c) => ({
        portalCategoryName: c.portalCategorieName,
        portalCategoryId: c.portalCategorieId,
        modules: c.modules
          .filter((m) => m.temporaryPermissions.length > 0)
          .map((m) => ({
            ...m,
            modulePermission: m.temporaryPermissions,
          })),
      })),
      manualRevocation: false,
      day: "",
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-6">
        {form.watch("categories")?.map((category, i) => (
          <div key={i}>
            <h2 className="mb-4 text-lg font-semibold capitalize">
              {category.portalCategoryName}
            </h2>

            <div className="hidden grid-cols-12 gap-4 p-2 mb-2 rounded-md md:grid bg-muted/10">
              {[
                "Access ID",
                "Module Name",
                "Permissions",
                "Validity",
                "Action",
              ].map((h, i) => (
                <p
                  key={h}
                  className={
                    [
                      "col-span-2",
                      "col-span-3",
                      "col-span-4",
                      "col-span-2",
                      "col-span-1 text-right",
                    ][i]
                  }
                >
                  {h}
                </p>
              ))}
            </div>

            {category?.modules?.map((module) => (
              <div
                key={module.moduleId}
                className="grid grid-cols-1 gap-4 p-4 mb-4 rounded-md border md:grid-cols-12 md:p-2 md:mb-2 md:border-none hover:bg-muted/30"
              >
                <div className="font-medium md:hidden">
                  Module: {module.moduleName}
                </div>

                <div className="md:col-span-2">
                  <div className="text-xs md:hidden text-muted-foreground">
                    Access ID
                  </div>
                  <Tooltip copy lowercase text={module.moduleId} />
                </div>

                <div className="hidden col-span-3 gap-2 items-center md:flex">
                  <Checkbox
                    checked={["GET", "POST", "DELETE"].every((p) =>
                      module.modulePermission.includes(p),
                    )}
                    disabled
                  />
                  <span className="text-sm font-semibold capitalize">
                    {module.moduleName}
                  </span>
                </div>

                <div className="md:col-span-4">
                  <div className="mb-1 text-xs md:hidden text-muted-foreground">
                    Permissions
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {(["GET", "POST", "DELETE"] as PermissionKey[]).map((p) => (
                      <div key={p} className="flex gap-2 items-center">
                        <Checkbox
                          checked={module.modulePermission.includes(p)}
                          disabled
                        />
                        <span>{PERMISSION_LABELS[p]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-xs md:hidden text-muted-foreground">
                    Validity
                  </div>
                  {module.temporaryPermissionsInfo?.manualRevocation ===
                    false &&
                  module.temporaryPermissionsInfo?.permissionStartDate &&
                  module.temporaryPermissionsInfo?.permissionEndDate
                    ? formatDateRange(
                        module.temporaryPermissionsInfo.permissionStartDate,
                        module.temporaryPermissionsInfo.permissionEndDate,
                      )
                    : "Manual Revocation"}
                </div>

                <div className="md:col-span-1 md:text-right">
                  <div className="text-xs md:hidden text-muted-foreground">
                    Action
                  </div>
                  <DeleteTemporaryModal
                    closeModal={closeModal}
                    id={module?.temporaryPermissionsInfo?.id as string}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </form>
    </Form>
  );
}
