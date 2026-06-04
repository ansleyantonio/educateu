/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { CustomField } from "@/components/common/fields/cusInputField";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ICourseFeeForm } from "../schemas/courseFeeSchema";

interface FormType {
  form: UseFormReturn<ICourseFeeForm>;
  isEditMode?: boolean;
}

const Form_field = ({ form, isEditMode }: FormType) => {
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

  const { data: availableCourses, isLoading: isLoadingCourses } = useFetchData({
    path: `courses/get`,
    queryKey: "fetch-session-course-codes-data",
    method: "POST",
    filterData: {
      courseType: "CPD_COURSE",
      status: ["PUBLISHED"],
      searchTerm: search,
      page: 1,
      pageSize: 10,
    },
  });

  // Watch schedule type to show/hide custom input
  const scheduleType = form.watch("scheduleType");

  useEffect(() => {
    setShowCustomSchedule(scheduleType === "custom");
    // Clear custom value if schedule type changes away from custom
    if (scheduleType !== "custom") {
      form.setValue("scheduleType", scheduleType);
    }
  }, [scheduleType, form]);

  // Generate dropdown options from created tiers
  // const getTierDropdownOptions = () => {
  //   return tiers
  //     .filter(tier => validateTierCompleteness(tier))
  //     .map(tier => ({
  //       label: `${tier.tierName} - ${tier.discountType === 'PERCENTAGE' ? tier.price + '%' : '$' + tier.price}`,
  //       value: tier.id.toString()
  //     }));
  // };

  // Validate tier completeness
  const validateTierCompleteness = (tier: any) => {
    return (
      tier.tierName.trim() !== "" && tier.price > 0 && tier.discountType !== ""
    );
  };

  // const addTier = () => {
  //   // Check if all current tiers are complete before adding new one
  //   const incompleteTiers = tiers.filter(tier => !validateTierCompleteness(tier));

  //   if (incompleteTiers.length > 0) {
  //     const newErrors: {[key: number]: string} = {};
  //     incompleteTiers.forEach(tier => {
  //       newErrors[tier.id] = "Please complete all fields in this tier before adding a new one";
  //     });
  //     setTierErrors(newErrors);
  //     return;
  //   }

  //   // Clear errors and add new tier
  //   setTierErrors({});
  //   const newId = Math.max(...tiers.map(t => t.id)) + 1;
  //   setTiers([...tiers, {
  //     id: newId,
  //     tierName: "",
  //     price: null,
  //     discountType: undefined,
  //   }]);
  // };

  // const removeTier = (id: number) => {
  //   if (tiers.length <= 1) return;

  //   setTiers(tiers.filter(tier => tier.id !== id));

  //   const newErrors = { ...tierErrors };
  //   delete newErrors[id];
  //   setTierErrors(newErrors);
  // };

  // const updateTier = (id: number, field: string, value: string | number) => {
  //   setTiers(tiers.map(tier =>
  //     tier.id === id ? { ...tier, [field]: value } : tier
  //   ));
  //   console.log(value,"value");
  //   // Clear error for this tier when user starts typing
  //   if (tierErrors[id]) {
  //     const newErrors = { ...tierErrors };
  //     delete newErrors[id];
  //     setTierErrors(newErrors);
  //   }
  // };

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

  return (
    <div className="space-y-8">
      {/* Course Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomField.SelectField
          form={form}
          name="courseId"
          labelName="Course Selection"
          optional={false}
          viewOnly={isEditMode}
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

      {/* Tiered Pricing Section */}
      {/* <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Pricing Tiers</h3>
        
        {tiers.map((tier) => (
          <div key={tier.id} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
              <CustomField.Text
                form={form}
                name={`tier_${tier.id}_tierName`}
                labelName="Tier Name"
                optional={false}
                viewOnly={isEditMode}
                placeholder="Early Bird"
                defaultValue={tier.tierName}
                onChange={(e: any) => updateTier(tier.id, 'tierName', e.target.value)}
              />

              <CustomField.SelectField
                form={form}
                name={`tier_${tier.id}_discountType`}
                labelName="Discount Type"
                optional={false}
                viewOnly={isEditMode}
                placeholder="Percentage"
                options={[
                  { label: "Percentage", value: "PERCENTAGE" },
                  { label: "Fixed Amount", value: "FIXED" },
                ]}
                onValueChange={(value: string) => updateTier(tier.id, 'discountType', value)}
              />

              <CustomField.Text
                form={form}
                name={`tier_${tier.id}_discountValue`}
                labelName="Discount Value"
                optional={false}
                viewOnly={isEditMode}
                placeholder={tier.discountType === 'PERCENTAGE' ? '15' : '15.00'}
                defaultValue={tier.price}
                onChange={(e: any) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  updateTier(tier.id, 'price', parseInt(value) || 0);
                }}
              />

              {!isEditMode && (
                <div className={`items-end ${tiers.length <= 1 ? 'hidden' : 'flex'}`}>
                  <button
                    type="button"
                    onClick={() => removeTier(tier.id)}
                    disabled={tiers.length <= 1}
                    className={`px-3 py-2 text-sm ${
                      tiers.length <= 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-600 hover:text-red-800'
                    }`}
                    title={tiers.length <= 1 ? "Cannot remove the last tier" : "Remove tier"}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            {tierErrors[tier.id] && (
              <p className="text-sm text-red-600 mt-1 ml-4">
                <AlertCircleIcon className="w-4 h-4 inline mr-1" />{tierErrors[tier.id]}
              </p>
            )}
          </div>
        ))}

        {!isEditMode && (
          <button
            type="button"
            onClick={addTier}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add Tier
          </button>
        )}
        
        {/* Dynamic Tiered Pricing Dropdown */}
      {/* <CustomField.SelectField
          form={form}
          name="pricingTierId"
          labelName="Select Tiered Pricing"
          optional={false}
          viewOnly={isEditMode}
          placeholder={getTierDropdownOptions().length > 0 ? "Select a pricing tier" : "Create a tier first"}
          options={getTierDropdownOptions()}
        />
        <p className="text-sm text-gray-600">
          {getTierDropdownOptions().length === 0 
            ? "Create and complete a tiered pricing plan above to see options here."
            : "Select from your created pricing tiers above."}
        </p>
      // </div> */}

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
          <CustomField.SelectField
            form={form}
            name="scheduleType"
            labelName="Schedule Type"
            optional={true}
            viewOnly={isEditMode}
            placeholder="Select Schedule Type"
            options={[
              { label: "Weekly", value: "weekly" },
              { label: "Bi-weekly", value: "biweekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Custom", value: "custom" },
            ]}
          />

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom Schedule Type Input - Shows when "Custom" is selected */}
          {showCustomSchedule && (
            <CustomField.Text
              form={form}
              name="scheduleType"
              labelName="Custom Schedule Type"
              optional={false}
              viewOnly={isEditMode}
              placeholder="Enter custom schedule (e.g., Every 3 weeks, Quarterly)"
            />
          )}

          <CustomField.SelectField
            form={form}
            name="scheduleFrequency"
            labelName="Schedule Frequency"
            optional={true}
            viewOnly={isEditMode}
            placeholder="Select Frequency"
            options={[
              { label: "Once", value: "once" },
              { label: "Recurring", value: "recurring" },
              { label: "On Demand", value: "on demand" },
            ]}
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
          }}
        />

        <p className="text-sm text-gray-600">
          Select one or more active promotional codes to apply discounts.
        </p>

        {selectedPromoCodes.length > 0 && (
          <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center mt-5">
            {selectedPromoCodes.map((selectedCodeId) => {
              const codeData =
                availablePromoCodes?.data?.promotionalCodes?.find(
                  (code: any) => code.id === selectedCodeId
                );
              if (!codeData) return null;

              return (
                <div
                  key={codeData.id}
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
                          onClick={() =>
                            setSelectedPromoCodes(
                              selectedPromoCodes.filter(
                                (id) => id !== selectedCodeId
                              )
                            )
                          }
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
                        Valid: {codeData.startDate || "N/A"} to{" "}
                        {codeData.endDate || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Promo Code Status */}
      <div className="flex items-center space-x-2">
        <CustomField.SelectField
            form={form}
            name="promoCodeStatus"
            labelName="Promotional Code Status"
            optional={true}
            viewOnly={isEditMode}
            placeholder="Select Status"
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
              { label: "Upcoming", value: "UPCOMING" },
            ]}
          />
      </div>
    </div>
  );
};

export default Form_field;
