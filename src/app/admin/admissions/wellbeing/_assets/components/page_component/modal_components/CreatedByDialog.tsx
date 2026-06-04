"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/custom_ui/button";

type AgentData = {
  roleData: {
    set: {
      note: string;
      endDate: string;
      agentType: string;
      agreementStatus: boolean;
      commissionTemplate: string;
      aggrementExpiryDate: string;
    };
  };
  userPortalCategory: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      mobile: string;
      username: string;
      address: string;
      emailVerified: boolean;
      passwordChanged: boolean;
      createdAt: string;
      updatedAt: string;
      userStatus: string;
      isForceLogout: boolean;
    };
  };
  role: {
    name: string;
  };
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DEACTIVATED: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
};

const CreatedByDialog = ({ agentData }: { agentData: AgentData }) => {
  const [open, setOpen] = useState(false);
  const user = agentData.userPortalCategory.user;
  const roleData = agentData.roleData.set;

  const fullName = `${user.firstName} ${user.lastName}`;
  const status = user.userStatus as keyof typeof statusColors;

  const labelValue = (label: string, value: string | boolean | undefined) => (
    <div className="flex justify-between text-sm">
      <span className="font-medium">{label}</span>
      <span>
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value || "—"}
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="xs" className="capitalize -px-0">
          {fullName}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6">
        {/* Profile Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <h2 className="text-xl capitalize">{fullName}</h2>
          <Badge
            className={cn(
              "text-xs px-3 py-1 rounded-full",
              statusColors[status] ?? "bg-gray-100 ",
            )}
          >
            {user.userStatus}
          </Badge>
          <div className="text-sm text-muted-foreground">
            Role: {agentData.role.name}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Contact Info */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Contact</h3>
          {labelValue("Email", user.email)}
          {labelValue("Mobile", user.mobile)}
          {labelValue("Address", user.address)}
        </div>

        <Separator className="my-4" />

        {/* Agent Info */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Agent Details</h3>
          {labelValue("Agent Type", roleData?.agentType)}
          {labelValue("Agreement Status", roleData?.agreementStatus)}
          {labelValue("Agreement Expiry", roleData?.aggrementExpiryDate)}
        </div>

        <Separator className="my-4" />

        {/* Account Info */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Account Info</h3>
          {labelValue("Username", user.username)}
        </div>

        <Separator className="my-4" />

        {/* Timestamps */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Timestamps
          </h3>
          {labelValue(
            "Created At",
            user.createdAt ? format(new Date(user.createdAt), "PPPpp") : "—",
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatedByDialog;
