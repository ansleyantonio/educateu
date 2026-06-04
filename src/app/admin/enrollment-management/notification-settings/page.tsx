"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { Switch } from "@/components/ui/custom_ui/switch";
import { useState } from "react";

type Setting = {
  key: string;
  title: string;
  description: string;
};

const settingsList: Setting[] = [
  {
    key: "comments",
    title: "Comments",
    description:
      "These are notifications for comments on your posts and replies to your comments.",
  },
  {
    key: "tags",
    title: "Tags",
    description:
      "These are notifications for when someone tags you in a comment, post or story.",
  },
  {
    key: "reminders",
    title: "Reminders",
    description:
      "These are notifications to remind you of updates you might have missed.",
  },
  {
    key: "activity",
    title: "More activity about you",
    description:
      "These are notifications for posts on your profile, likes and other reactions to your posts, and more.",
  },
];
const NotificationSettings = () => {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    comments: true,
    tags: true,
    reminders: true,
    activity: true,
  });

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <PageWithBreadcrumb 
      items={[
      { title: "Home", href: "/admin" },
      // { title: "Enrollment Management", href: "/admin/enrollment-management/notification-settings" },
      { title: "Notification Settings", href: "/admin/enrollment-management/notification-settings" }]}
    >
      <div>
      <div className="pt-5 mx-6">
        <h1 className="text-lg font-bold leading-6 text-[#000000]">
          Notification Settings
        </h1>
        <p className="pb-5 text-[#475467] font-normal text-sm pt-1">
          Get emails to find out what’s going on when you’re not online. You can
          turn them off anytime.
        </p>
        <hr />
      </div>

      {/* option enable or disable */}
      <div className="mt-8 w-full">
        <div className="space-y-6 p-4 mx-auto">
          {settingsList.map((setting) => (
            <div
              key={setting.key}
              className="flex items-start justify-between border-b pb-4"
            >
              <div className="lg:max-w-[30%]">
                <h3 className="font-semibold">{setting.title}</h3>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <label className="inline-flex items-center cursor-pointer ml-4 mt-1 text-gray-900">
                <Switch
                  checked={settings[setting.key]}
                  onCheckedChange={() => toggleSetting(setting.key)}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
      </PageWithBreadcrumb>
  );
};

export default NotificationSettings;
