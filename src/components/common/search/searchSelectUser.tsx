/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/custom_ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Empty } from "antd";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import CommonSearch from "./commonSearch";

export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
}

export interface SelectedUser {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

interface UserSearchFieldProps {
  form: UseFormReturn<any, any>;
  assignTo: any;
  name: string;
  label: string;
  searchText: string;
  isLoading: boolean;
  setSearchText: (text: string) => void;
  users: { id: string; userPortalCategory: { user: User } }[];
}

export const CusAvatar = ({
  user,
  size = "w-6 h-6",
}: {
  user: User;
  size?: string;
}) =>
  user.image ? (
    <Image
      src={user.image}
      alt={user?.name ? user.name : user.firstName + " " + user.lastName}
      width={24}
      height={24}
      className={`${size} rounded-full object-cover`}
    />
  ) : (
    <div
      className={`${size} flex items-center justify-center bg-red-400 text-white font-bold rounded-full`}
    >
      {user?.name ? user.name[0] : user?.firstName?.[0] ?? "?"}
    </div>
  );

export const SelectedUser = ({
  user,
  onClear,
  onClick,
  clear = false,
}: {
  user: SelectedUser;
  onClear?: () => void;
  onClick?: () => void;
  clear?: boolean;
}) => (
  <div className="flex gap-2 items-center px-2 rounded-md border bg-muted">
    <CusAvatar user={user} />
    <Input
      readOnly
      value={
        user?.name
          ? `${user?.name}`
          : `${user?.firstName ?? ""} ${user?.lastName ?? ""}`
      }
      className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      onClick={onClick}
    />
    {clear && (
      <Button
        variant="tooltip"
        size="xs"
        type="button"
        onClick={onClear}
        className="rounded-full"
        aria-label="Clear selection"
      >
        <X className="w-4 h-4" />
      </Button>
    )}
  </div>
);

export function UserSearchField({
  form,
  assignTo,
  name,
  label,
  searchText,
  setSearchText,
  users,
  isLoading,
}: UserSearchFieldProps) {
  const [selected, setSelected] = useState<SelectedUser | undefined>(assignTo);

  const handleSelect = (userData: any) => {
    form.setValue(name, userData.id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setSelected(userData.userPortalCategory.user);
    setSearchText("");
  };

  const handleClear = () => {
    form.setValue(name, "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setSelected(undefined);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className="relative">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              {selected ? (
                <SelectedUser
                  user={selected}
                  onClear={handleClear}
                  clear={true}
                />
              ) : (
                <CommonSearch
                  searchText={searchText}
                  setSearchText={setSearchText}
                  width="full"
                />
              )}

              {isLoading && (
                <div className="flex overflow-auto absolute z-10 justify-center items-center mt-1 w-full h-full bg-white rounded-md border shadow min-h-20">
                  <Loader2 className="animate-spin" />
                </div>
              )}

              {searchText.length > 0 && users && (
                <div className="overflow-auto absolute z-10 mt-1 w-full max-h-60 bg-white rounded-md border shadow">
                  {users.length === 0 ? (
                    <div className="flex justify-center items-center h-40">
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                  ) : (
                    users.map((userData) => {
                      const user = userData.userPortalCategory.user;
                      return (
                        <div
                          key={user.id}
                          onClick={() => handleSelect(userData)}
                          className="flex gap-2 items-center p-2 cursor-pointer hover:bg-gray-100"
                        >
                          <CusAvatar user={user} />
                          <span className="truncate">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
