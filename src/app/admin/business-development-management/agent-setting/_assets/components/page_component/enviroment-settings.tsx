import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "antd";
import { useState, useEffect } from "react";
import {
  updateAgentSetting,
  fetchAgentSetting,
} from "../../query_controller/environmentVariable";
import { useAuths } from "@/hooks/userContext";
import ActionButton from "@/components/common/button/actionButton";

type EnviromentSettingsProps = {
  hasPostAndDeletePermission?: boolean;
};

export const EnviromentSettings = ({
  hasPostAndDeletePermission,
}: EnviromentSettingsProps) => {
  const user = useAuths();
  const token = user?.user?.token;
  const [enrollmentValue, setEnrollmentValue] = useState("");
  const [newApplicationStatus, setNewApplicationStatus] = useState("");
  const [loading, setLoading] = useState({
    enrollment: false,
    application: false,
    initial: true, // Indicate if the initial load is in progress
  });
  const [error, setError] = useState({
    enrollment: "",
    application: "",
    fetch: "",
  });

  // Effect to fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;

      try {
        setLoading((prev) => ({ ...prev, initial: true })); // Start loading

        const enrollmentData = await fetchAgentSetting("enrollment", token);
        const applicationData = await fetchAgentSetting(
          "newapplication",
          token
        );

        // Update state with fetched values
        setEnrollmentValue(enrollmentData.data?.value || "");
        setNewApplicationStatus(applicationData.data?.value || "enable");
        console.log("Enrollment Value", enrollmentValue);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setError((prev) => ({ ...prev, fetch: "Failed to load settings" }));
      } finally {
        setLoading((prev) => ({ ...prev, initial: false })); // Stop loading
      }
    };

    fetchSettings();
  }, [token]);

  // Save enrollment setting
  const handleEnrollmentSave = async () => {
    if (!enrollmentValue) {
      setError((prev) => ({ ...prev, enrollment: "Please select a value" }));
      return;
    }

    setLoading((prev) => ({ ...prev, enrollment: true }));
    setError((prev) => ({ ...prev, enrollment: "" }));

    try {
      await updateAgentSetting({
        name: "enrollment",
        value: enrollmentValue,
        token: token || "",
      });

      // Re-fetch to confirm update
      const updatedData = await fetchAgentSetting("enrollment", token || "");
      setEnrollmentValue(updatedData.data?.value || "");
    } catch (error) {
      console.error("Error updating enrollment:", error);
      setError((prev) => ({
        ...prev,
        enrollment: "Failed to update enrollment setting",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, enrollment: false }));
    }
  };

  // Toggle new application setting
  const toggleNewApplication = async () => {
    const newValue = newApplicationStatus === "enable" ? "disable" : "enable";

    setLoading((prev) => ({ ...prev, application: true }));
    setError((prev) => ({ ...prev, application: "" }));

    try {
      await updateAgentSetting({
        name: "newapplication",
        value: newValue,
        token: token || "",
      });

      // Re-fetch to confirm update
      const updatedData = await fetchAgentSetting(
        "newapplication",
        token || ""
      );
      setNewApplicationStatus(updatedData.data?.value || "enable");
    } catch (error) {
      console.error("Error updating new application setting:", error);
      setError((prev) => ({
        ...prev,
        application: "Failed to update application setting",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, application: false }));
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="py-3 bg-[#F5F7F9]">
        <CardTitle className="font-semibold text-xl text-[#272E35]">
          Environment Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        {/* {loading.initial ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading settings...</p>
          </div>
        ) : error.fetch ? (
          <div className="text-red-500 p-4">{error.fetch}</div>
        ) : ( */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end mb-2">
          {/* Agent Enrollment */}
          <div className="flex items-end gap-4 w-full">
            <div className="flex flex-col lg:w-80">
              <Label className="font-medium text-md">Agent Enrollment</Label>
              <Select
                value={enrollmentValue}
                onValueChange={(value) => {
                  if (!hasPostAndDeletePermission) return;
                  setEnrollmentValue(value);
                  setError((prev) => ({ ...prev, enrollment: "" }));
                }}
                disabled={!hasPostAndDeletePermission}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select enrollment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="close">Close</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {error.enrollment && (
                <p className="text-red-500 text-sm mt-1">{error.enrollment}</p>
              )}
            </div>
            <ActionButton
              handleOpen={handleEnrollmentSave}
              isPending={loading.enrollment}
              disabled={!hasPostAndDeletePermission}
              // className="bg-[#013E5B] text-white p-5 rounded-md self-end flex items-center justify-center"
              btnStyle={`bg-[#013E5B] text-white p-5 rounded-md self-end flex items-center justify-center ${
                !hasPostAndDeletePermission
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              buttonContent="Save"
              loadingContent="Saving..."
            />
          </div>

          {/* New Application */}
          <div className="flex items-center gap-2">
            <ActionButton
              handleOpen={toggleNewApplication}
              isPending={loading.application}
              // className={`w-[246px] rounded-md px-4 py-2 text-sm font-medium ${
              //   newApplicationStatus === "enable"
              //     ? "bg-[#013E5B] text-white hover:bg-[#013E5B]/90"
              //     : "bg-white hover:bg-red-50 text-red-600"
              // }`}
              disabled={!hasPostAndDeletePermission}
              btnStyle={`w-[246px] border border-[#CFD6DD] border-1 rounded-md px-4 py-2 text-sm font-medium ${
                newApplicationStatus === "enable"
                  ? "bg-[#013E5B] text-white hover:bg-[#013E5B]/90"
                  : "bg-white hover:bg-red-50 text-red-600"
              } ${
                !hasPostAndDeletePermission
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              buttonContent={
                newApplicationStatus === "enable"
                  ? "Enable New Application"
                  : "Disable New Application"
              }
            />
            {error.application && (
              <p className="text-red-500 text-sm">{error.application}</p>
            )}
          </div>
        </div>

        {/* )} */}
      </CardContent>
    </Card>
  );
};
