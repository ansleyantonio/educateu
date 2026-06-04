/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { X } from "lucide-react";

interface FormType {
  form: UseFormReturn<any>;
  isEditMode?: boolean;
}

const Form_field = ({ form, isEditMode }: FormType) => {
  const [tiers, setTiers] = useState([
    { id: 1, name: "Early Bird", discountType: "Percentage", discountValue: "15%" }
  ]);
  const [selectedPromoCodes, setSelectedPromoCodes] = useState<string[]>([]);
  const [availablePromoCodes] = useState([
    { id: 1, name: "Early Bird 15", discount: "15%", validFrom: "20 Jan 2024", validTo: "24 Sep 2025" },
    { id: 2, name: "Early Bird 20", discount: "20%", validFrom: "20 Jan 2024", validTo: "24 Sep 2025" },
    { id: 3, name: "Early Bird 25", discount: "25%", validFrom: "20 Jan 2024", validTo: "24 Sep 2025" },
    { id: 4, name: "Summer Sale", discount: "25%", validFrom: "01 Jun 2024", validTo: "31 Aug 2025" },
    { id: 5, name: "Student Discount", discount: "10%", validFrom: "01 Jan 2024", validTo: "31 Dec 2025" }
  ]);

  const addTier = () => {
    setTiers([...tiers, { 
      id: tiers.length + 1, 
      name: "", 
      discountType: "Percentage", 
      discountValue: "" 
    }]);
  };

  const removeTier = (id: number) => {
    setTiers(tiers.filter(tier => tier.id !== id));
  };

  const updateTier = (id: number, field: string, value: string) => {
    setTiers(tiers.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  return (
    <div className="space-y-8">
      {/* Course Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomField.SelectField
          form={form}
          name="courseType"
          labelName="Course Type"
          optional={false}
          viewOnly={isEditMode}
          placeholder="Select Course Type"
          options={[
            { label: "Diploma Courses", value: "diploma" },
            { label: "Certificate Courses", value: "certificate" },
            { label: "Professional Courses", value: "professional" },
            { label: "Short Courses", value: "short" },
          ]}
        />

        <CustomField.SelectField
          form={form}
          name="courseSelection"
          labelName="Course Selection"
          optional={false}
          viewOnly={isEditMode}
          placeholder="Select Course"
          options={[
            { label: "Diploma Courses 01", value: "diploma_01" },
            { label: "Diploma Courses 02", value: "diploma_02" },
            { label: "Advanced Diploma", value: "advanced_diploma" },
            { label: "Foundation Diploma", value: "foundation_diploma" },
          ]}
        />
      </div>

      {/* Basic Course Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomField.Text
          form={form}
          name="courseFee"
          labelName="Course Fee"
          optional={false}
          viewOnly={isEditMode}
          placeholder="$ 30.00"
        />

        <CustomField.SelectField
          form={form}
          name="tieredPricing"
          labelName="Tiered Pricing"
          optional={false}
          viewOnly={isEditMode}
          placeholder="Earlybird Discount"
          options={[
            { label: "Earlybird Discount", value: "earlybird" },
            { label: "Standard Pricing", value: "standard" },
            { label: "Premium Pricing", value: "premium" },
          ]}
        />
      </div>

      {/* Tiered Pricing Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Pricing Tiers</h3>
        
        {tiers.map((tier) => (
          <div key={tier.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
            <CustomField.Text
              form={form}
              name={`tier_${tier.id}_name`}
              labelName="Tier Name"
              optional={false}
              viewOnly={isEditMode}
              placeholder="Early Bird"
              defaultValue={tier.name}
            />

            <CustomField.SelectField
              form={form}
              name={`tier_${tier.id}_discountType`}
              labelName="Discount Type"
              optional={false}
              viewOnly={isEditMode}
              placeholder="Percentage"
              options={[
                { label: "Percentage", value: "percentage" },
                { label: "Fixed Amount", value: "fixed" },
              ]}
            />

            <CustomField.Text
              form={form}
              name={`tier_${tier.id}_discountValue`}
              labelName="Discount Value"
              optional={false}
              viewOnly={isEditMode}
              placeholder="15%"
              defaultValue={tier.discountValue}
            />

            {!isEditMode && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeTier(tier.id)}
                  className="px-3 py-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
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
      </div>

      {/* Fee Validity & Scheduled Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Fee Validity & Scheduled</h3>
        
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
          <CustomField.Text
            form={form}
            name="newFee"
            labelName="New Fee"
            optional={false}
            viewOnly={isEditMode}
            placeholder="$ 560.00"
          />

          <CustomField.DatePickerAnd
            form={form}
            name="effectiveDate"
            labelName="Effective Date"
            optional={false}
            isEditMode={isEditMode}
            placeholder="Select Date"
          />
        </div>

        {/* Schedule Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomField.SelectField
            form={form}
            name="scheduleType"
            labelName="Schedule Type"
            optional={false}
            viewOnly={isEditMode}
            placeholder="Select Schedule Type"
            options={[
              { label: "Weekly", value: "weekly" },
              { label: "Bi-weekly", value: "biweekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Custom", value: "custom" },
            ]}
          />

          <CustomField.SelectField
            form={form}
            name="scheduleFrequency"
            labelName="Schedule Frequency"
            optional={false}
            viewOnly={isEditMode}
            placeholder="Select Frequency"
            options={[
              { label: "Once", value: "once" },
              { label: "Recurring", value: "recurring" },
              { label: "On Demand", value: "ondemand" },
            ]}
          />
        </div>
      </div>

      {/* Default Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomField.SelectField
          form={form}
          name="defaultCurrency"
          labelName="Default Currency"
          optional={false}
          viewOnly={isEditMode}
          placeholder="USA Dollar ($)"
          options={[
            { label: "USA Dollar ($)", value: "usd" },
            { label: "Euro (€)", value: "eur" },
            { label: "British Pound (£)", value: "gbp" },
            { label: "Bangladeshi Taka (৳)", value: "bdt" },
          ]}
        />
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
          placeholder="Select promotional codes"
          options={availablePromoCodes.map(code => ({
            label: `${code.name} (${code.discount})`,
            value: code.name
          }))}
          onValueChange={(selectedValues: string[]) => {
            setSelectedPromoCodes(selectedValues);
          }}
        />

        <p className="text-sm text-gray-600">
          Code must be unique and contain only letters and numbers
        </p>

        {/* Selected Promotional Codes Display */}
        {selectedPromoCodes.length > 0 && (
          <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center mt-5">
            {selectedPromoCodes.map((selectedCodeName) => {
              const codeData = availablePromoCodes.find(code => code.name === selectedCodeName);
              if (!codeData) return null;
              
              return (
                 <div key={codeData.id} className="p-4 rounded-lg border border-gray-200 !m-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-[#013E5B]">{codeData.name}</span>
                      {!isEditMode && (
                        <X
                          className="text-black hover:text-red-800 text-lg font-bold"
                          onClick={() => {
                            setSelectedPromoCodes(selectedPromoCodes.filter(name => name !== selectedCodeName));
                          }}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm py-2">
                      <span className="text-[#013E5B] font-medium text-xs">{codeData.discount}</span>
                      <span className="text-[#013E5B] text-xs">Valid Date {codeData.validFrom} To {codeData.validTo}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Form_field;