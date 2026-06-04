/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseQueryResult } from "@tanstack/react-query";
interface FormType {
  control: any;
}

const Form_field = ({
  form,
  portalList,
  usernameQuery,
  emailQuery,
  mobileQuery,
}: {
  usernameQuery: UseQueryResult<boolean, Error>;
  emailQuery: UseQueryResult<boolean, Error>;
  mobileQuery: UseQueryResult<boolean, Error>;
  form: FormType;
  portalList: any;
}) => {
  // console.log("roles-----", roles);
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
    </>
  );
};

export default Form_field;
