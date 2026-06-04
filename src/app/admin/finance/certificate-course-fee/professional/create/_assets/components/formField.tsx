/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { CustomField } from "@/components/common/fields/cusInputField";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ICourseFeeForm } from "../../../../_assets/schemas/courseFeeSchema";
interface FormType {
  form: UseFormReturn<ICourseFeeForm>;
  isEditMode?: boolean;
  existingPromoCodes?: any[];
}

const Form_field = ({ form, isEditMode, existingPromoCodes = [] }: FormType) => {
  const [tiers, setTiers] = useState([
    { id: 1, tierName: "", price: null, discountType: undefined },
  ]);
  const [selectedPromoCodes, setSelectedPromoCodes] = useState<string[]>([]);
  const [tierErrors, setTierErrors] = useState<{ [key: number]: string }>({});
  const [showCustomSchedule, setShowCustomSchedule] = useState(false);
  const [search, setSearch] = useState("");

  const { data: availablePromoCodes, isLoading: isLoadingCourseFee } =
    useFetchData({
      path: `promotional-codes/promotional-codes?page=1&limit=10&status=ACTIVE`,
      queryKey: "fetch-promotional-codes-data",
      method: "GET",
    });

   const { data: availableCourses, isLoading: isLoadingCourses } =
    useFetchData({
      path: `courses/get`,
      queryKey: "fetch-session-course-codes-data",
      method: "POST",
      filterData: { 
        courseType: "PROFESSIONAL_COURSE", 
        status: ["PUBLISHED"],
        searchTerm: search,
        page: 1,
        pageSize: 10
       },
    });

  // Initialize selected promo codes from form values or existing promo codes
  useEffect(() => {
    const formValues = form.getValues("promotionalCodes");
    if (formValues && formValues.length > 0) {
      setSelectedPromoCodes(formValues);
    } else if (existingPromoCodes.length > 0) {
      const ids = existingPromoCodes.map(code => code.promotionalCodeId || code.id);
      setSelectedPromoCodes(ids);
      form.setValue("promotionalCodes", ids);
    }
  }, [existingPromoCodes, form]);

  // Handle promo code status - FIXED VERSION
  useEffect(() => {
    const currentStatus = form.getValues("promoCodeStatus");
    const promotionalCodes = form.getValues("promotionalCodes");
    if (!promotionalCodes || promotionalCodes.length === 0) {
      form.setValue("promoCodeStatus", "INACTIVE");
    } else if (promotionalCodes.length > 0 && currentStatus) {
      form.setValue("promoCodeStatus", currentStatus);
    }
    // If currentStatus exists and promo codes exist, preserve it
  }, [form]);

  // Watch schedule type to show/hide custom input
  const scheduleType = form.watch("scheduleType");

  useEffect(() => {
    setShowCustomSchedule(scheduleType === "custom");
    // Clear custom value if schedule type changes away from custom
    if (scheduleType !== "custom") {
      form.setValue("scheduleType", scheduleType);
    }
  }, [scheduleType, form]);

  // Validate tier completeness
  const validateTierCompleteness = (tier: any) => {
    return (
      tier.tierName.trim() !== "" && tier.price > 0 && tier.discountType !== ""
    );
  };

  // Format fee input to ensure proper currency format
  const formatFeeInput = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");

    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    if (parts[1] && parts[1].length > 2) {
      return parts[0] + "." + parts[1].substring(0, 2);
    }

    return numericValue ? `$${numericValue}` : "";
  };

  // Helper function to get promo code data by ID
  const getPromoCodeById = (codeId: string) => {
    // First check in existing promo codes
    const existingCode = existingPromoCodes.find(
      code => (code.promotionalCodeId || code.id) === codeId
    );
    if (existingCode) return existingCode;

    // Then check in available promo codes
    return availablePromoCodes?.data?.promotionalCodes?.find(
      (code: any) => code.id === codeId
    );
  };

  return (
    <div className="space-y-8">
      {/* Course Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomField.SelectField
          form={form}
          name="courseId"
          labelName="Course Selection"
          optional={false}
          placeholder="Select Course"
          isLoading={isLoadingCourses}
          options={
            availableCourses?.data?.courses?.map(
              (course: any) => ({
                label: course?.title,
                value: course?.id,
              })
            ) || []
          }
          onSearch={setSearch}
        />

        <CustomField.Number
          form={form}
          name="overallCourseFee"
          labelName="Overall Course Fee"
          optional={false}
          viewOnly={isEditMode}
          placeholder="$300.00"
          onValueChange={(value: string) => {
            const formatted = formatFeeInput(value);
            form.setValue("overallCourseFee", formatted as any);
          }}
        />
        <CustomField.SelectField
          form={form}
          name="currencyType"
          labelName="Default Currency"
          optional={false}
          viewOnly={isEditMode}
          placeholder="USA Dollar ($)"
          options={[
            { label: "USA Dollar ($)", value: "USD" },
            { label: "Euro (€)", value: "EUR" },
            { label: "British Pound (£)", value: "GBP" },
            { label: "Bangladeshi Taka (৳)", value: "BDT" },
          ]}
        />
      </div>

      {/* Fee Validity & Scheduled Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Fee Validity & Scheduled
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomField.DatePickerAnd
            form={form}
            name="startDate"
            labelName="Start Date"
            optional={false}
            isEditMode={isEditMode}
            placeholder="Select Date"
          />

          <CustomField.DatePickerAnd
            form={form}
            name="endDate"
            labelName="End Date"
            optional={false}
            isEditMode={isEditMode}
            placeholder="Select Date"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomField.Number
            form={form}
            name="newCourseFee"
            labelName="New Fee"
            optional={true}
            viewOnly={isEditMode}
            placeholder="$560.00"
            onValueChange={(value: string) => {
              const formatted = formatFeeInput(value);
              form.setValue("newCourseFee", formatted as any);
            }}
          />
          <CustomField.DatePickerAnd
            form={form}
            name="effectiveDate"
            labelName="Effective Date"
            optional={true}
            isEditMode={isEditMode}
            placeholder="Select Date"
          />
        </div>
      </div>

      {/* Promotional Code Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Promotional Code</h3>

        <CustomField.SelectField
          type="multiple"
          form={form}
          name="promotionalCodes"
          labelName="Select Promotional Codes"
          optional={true}
          viewOnly={isEditMode}
          placeholder={
            isLoadingCourseFee
              ? "Loading promotional codes..."
              : "Select promotional codes"
          }
          options={
            availablePromoCodes?.data?.promotionalCodes?.map((code: any) => ({
              label: `${code.codeName} - ${
                code.discountType === "PERCENTAGE"
                  ? code.discountValue + "%"
                  : "$" + code.discountValue
              }`,
              value: code.id,
            })) || []
          }
          onValueChange={(selectedValues: string[]) => {
            setSelectedPromoCodes(selectedValues);
            form.setValue("promotionalCodes", selectedValues);
          }}
        />

        <p className="text-sm text-gray-600">
          Select one or more active promotional codes to apply discounts.
        </p>

        {selectedPromoCodes.length > 0 && (
          <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center mt-5">
            {selectedPromoCodes.map((selectedCodeId) => {
              const codeData = getPromoCodeById(selectedCodeId);
              if (!codeData) return null;

              return (
                <div
                  key={selectedCodeId}
                  className="p-4 rounded-lg border border-gray-200 !m-0"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-[#013E5B]">
                        {codeData.codeName}
                      </span>
                      {!isEditMode && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = selectedPromoCodes.filter(
                              (id) => id !== selectedCodeId
                            );
                            setSelectedPromoCodes(updated);
                            form.setValue("promotionalCodes", updated);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          aria-label={`Remove ${codeData.codeName}`}
                        >
                          <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm py-2">
                      <span className="text-[#013E5B] font-medium text-xs">
                        {codeData.discountType === "PERCENTAGE"
                          ? `${codeData.discountValue}%`
                          : `$${codeData.discountValue}`}
                      </span>
                      <span className="text-[#013E5B] text-xs">
                        Valid: {codeData.startDate ? new Date(codeData.startDate).toLocaleDateString() : "N/A"} to{" "}
                        {codeData.endDate ? new Date(codeData.endDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
         {/* Promotional Code Status */}
      <div className="flex items-center space-x-2">
        <CustomField.SelectField
            form={form}
            name="promoCodeStatus"
            labelName="Promotional Code Status"
            optional={true}
            viewOnly={isEditMode || selectedPromoCodes.length === 0}
            placeholder="Select Status"
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
              { label: "Upcoming", value: "UPCOMING" },
            ]}
          />
      </div>
      </div>
    </div>
  );
};

export default Form_field;