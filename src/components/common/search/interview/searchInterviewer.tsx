/* eslint-disable @typescript-eslint/no-explicit-any */

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, X } from "lucide-react";
import { Empty } from "antd";
import { useState } from "react";
import CommonSearch from "../commonSearch";
import { CusAvatar, SelectedUser, User } from "../searchSelectUser";

interface UserSearchFieldProps {
  form: UseFormReturn<any, any>;
  name: string;
  label: string;
  searchText: string;
  isLoading: boolean;
  setSearchText: (text: string) => void;
  users: User[];
}
export function InterviewerSearchField({
  form,
  name,
  label,
  searchText,
  setSearchText,
  users,
  isLoading,
}: UserSearchFieldProps) {
  const [selected, setSelected] = useState<User | undefined>();

  const handleSelect = (userData: any) => {
    form.setValue(name, userData?.id);
    setSelected(userData);
    setSearchText("");
  };

  const handleClear = () => {
    form.setValue(name, "");
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

              {searchText.length > 0 && (
                <div className="overflow-auto absolute z-10 mt-1 w-full bg-white rounded-md border shadow h-30">
                  {users?.length === 0 ? (
                    <div className="flex justify-center items-center h-40">
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </div>
                  ) : (
                    users?.map((user) => {
                      return (
                        <div
                          key={user.id}
                          onClick={() => handleSelect(user)}
                          className="flex gap-2 items-center p-2 cursor-pointer hover:bg-gray-100"
                        >
                          <CusAvatar user={user} />
                          <span className="truncate">{user?.name}</span>
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
