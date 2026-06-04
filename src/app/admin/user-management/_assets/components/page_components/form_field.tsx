/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { UseQueryResult } from "@tanstack/react-query";
import { passwordRules } from "@/utils/passwordRules";

interface FormType {
  control: any;
}

const Form_field = ({
  form,
  portalList,
  usernameQuery,
  emailQuery,
  mobileQuery,
  roleList,
  selected,
  setSelected,
}: {
  usernameQuery: UseQueryResult<boolean, Error>;
  emailQuery: UseQueryResult<boolean, Error>;
  mobileQuery: UseQueryResult<boolean, Error>;
  form: FormType;
  portalList: any;
  selected: any;
  roleList: any;
  setSelected: any;
}) => {
  const [passwordValue, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    password: false,
  });
  // function transformPortalCategories(portalCategories: any) {
  //   return portalCategories?.map((category: any) => ({
  //     label: category.name,
  //     value: category.id,
  //   }));
  // }
  // console.log("portalList", portalList);
  // console.log("ROle List i form field", roleList?.roles);
  // const optionList = transformPortalCategories(portalList);
  // const optionList = transformPortalCategories(portalList);
  return (
    <>
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <label className="cusFormLabel">
              First Name <small>(Required)</small>
            </label>
            <FormControl>
              <Input placeholder="Enter Your First Name Here" {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <label className="cusFormLabel">
              Last Name <small>(Required)</small>
            </label>
            <FormControl>
              <Input placeholder="Enter Your Last Name Here" {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <label className="cusFormLabel">
              Username <small>(Required)</small>
            </label>
            <FormControl>
              <Input placeholder="Enter Your Username Here" {...field} />
            </FormControl>
            {/* <FormMessage /> */}
            <FormMessage>
              {usernameQuery.isLoading
                ? "Checking..."
                : usernameQuery.data
                ? "Username already exists!"
                : ""}
            </FormMessage>
          </FormItem>
        )}
      />
      {/* <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <label className="cusFormLabel">
              Password <small>(Required)</small>
            </label>
            <FormControl>
              <Input
                type="password"
                placeholder="Enter Your Password Here"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <label className="cusFormLabel">
              Password <small>(Required)</small>
            </label>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword.password ? "text" : "password"}
                  placeholder="Enter Your Password Here"
                  {...field}
                  value={passwordValue}
                  onChange={(e) => {
                    field.onChange(e);
                    setPasswordValue(e.target.value);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      password: !showPassword.password,
                    })
                  }
                >
                  {showPassword.password ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </FormControl>

            {passwordValue && (
              <ul className="mt-2 space-y-1 text-sm">
                {passwordRules.map((rule, index) => {
                  const passed = rule.test(passwordValue);
                  return (
                    <li
                      key={index}
                      className={`flex items-center gap-2 ${
                        passed ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full inline-block ${
                          passed ? "bg-green-600" : "bg-gray-400"
                        }`}
                      />
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <label className="cusFormLabel">
              Email Address <small>(Required)</small>
            </label>
            <FormControl>
              <Input placeholder="Enter Your Email Address Here" {...field} />
            </FormControl>
            {/* <FormMessage /> */}

            <FormMessage>
              {emailQuery.isLoading
                ? "Checking..."
                : emailQuery.data
                ? "Email already exists!"
                : ""}
            </FormMessage>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="mobile"
        render={({ field }) => (
          <FormItem>
            <label className="cusFormLabel">Mobile Number</label>
            <FormControl>
              <Input placeholder="Enter Your Mobile Number Here" {...field} />
            </FormControl>
            {/* <FormMessage /> */}
            <FormMessage>
              {mobileQuery.isLoading
                ? "Checking..."
                : mobileQuery.data
                ? "Mobile number already exists!"
                : ""}
            </FormMessage>
          </FormItem>
        )}
      />

      {/* <FormField
        control={form.control}
        name="portalCategoryId"
        render={({ field }) => (
          <FormItem>
            <label className="cusFormLabel">
              User Category <small>(Required)</small>
            </label>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {portalList?.portals &&
                    portalList?.portals?.map((portal: any) => (
                      <SelectItem key={portal.id} value={portal.id}>
                        {portal.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}

      <FormField
        control={form.control}
        name="RoleId"
        render={({ field }) => (
          <FormItem>
            <label className="cusFormLabel">Assign Role</label>
            <FormControl>
              <Select
                onValueChange={(selectedValue) => {
                  const selectedRole = roleList?.roles?.find(
                    (role: any) => role.id === selectedValue
                  );
                  if (!selectedRole) {
                    field.onChange(undefined);
                  } else {
                    field.onChange({
                      label: selectedRole.name,
                      value: selectedRole.id,
                    });
                  }
                }}
                value={field.value?.value || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleList?.roles?.map((role: any) => (
                    <SelectItem key={role.id} value={role.id}>
                      {/* {role.name} */}
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* <MultiSelectorComponent
        label="portalCategoryId"
        options={optionList}
        selected={selected as []}
        setSelected={setSelected}
      />
      <p className="text-sm text-red-500">
        {selected.length == 0 && "Please select at least one portal"}
      </p> */}
    </>
  );
};

export default Form_field;
