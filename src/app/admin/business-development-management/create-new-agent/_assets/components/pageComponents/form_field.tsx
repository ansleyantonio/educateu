/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useAuths } from "@/hooks/userContext";
import { type UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, X, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormMessage } from "@/components/ui/custom_ui/form";

interface CommissionGroup {
  commissionGroupId: string;
  commissionGroupName: string;
  awardingBodyId: string;
  awardingBodyName: string;
  type: string;
  commissions: any[];
}

interface AwardingBodyTemplate {
  awardingBodyId: string;
  commissionTemplateId: string;
  isExisting?: boolean;
}

const Form_field = ({
  form,
  usernameQuery,
  emailQuery,
  mobileQuery,
}: {
  usernameQuery: UseQueryResult<boolean, Error>;
  emailQuery: UseQueryResult<boolean, Error>;
  mobileQuery?: UseQueryResult<boolean, Error>;
  form: any;
}) => {
  const [agentType, setAgentType] = useState<string>(() => 
    form?.getValues("agentType") || ""
  );
  const [awardingBodyTemplates, setAwardingBodyTemplates] = useState<
    AwardingBodyTemplate[]
  >(() => {
    const formValue = form?.getValues("awardingBodyTemplates") || [];
    return formValue.map((template: AwardingBodyTemplate) => ({
      ...template,
      isExisting: !!template.commissionTemplateId,
    }));
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  const queryClient = useQueryClient();
  const user = useAuths();
  const token = user?.user?.token;

  // Get form errors for awarding body templates
  const awardingBodyTemplatesError = form.formState.errors?.awardingBodyTemplates;
  const hasAwardingBodyError = !!awardingBodyTemplatesError;

  // Fetch awarding bodies based on agentType
 const { data: awardingBodies, isLoading: isLoadingAwardingBodies } = useFetchData({
  path: `business-development-management/agent/awarding-bodies-templates?type=${agentType}`,
  method: "GET",
  queryKey: ["fetch-awarding-bodies", agentType],
  enabled: !!agentType,
});

  // Filter awarding bodies based on search query
  const filteredAwardingBodies = useMemo(() => {
    if (!awardingBodies?.data) return [];
    const bodies = awardingBodies.data;
    if (!searchQuery.trim()) return bodies;
    return bodies.filter((body: any) =>
      body.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [awardingBodies?.data, searchQuery]);

  // Separate selected/unselected bodies
  const { selectedBodies, unselectedBodies } = useMemo(() => {
    const selected: any[] = [];
    const unselected: any[] = [];
    filteredAwardingBodies.forEach((body: any) => {
      const isSelected = awardingBodyTemplates.some(
        (t) => t.awardingBodyId === body.id
      );
      if (isSelected) selected.push(body);
      else unselected.push(body);
    });
    return { selectedBodies: selected, unselectedBodies: unselected };
  }, [filteredAwardingBodies, awardingBodyTemplates]);

  // Fetch commission templates for selected awarding bodies
  const fetchCommissionTemplates = useCallback(async (awardingBodyIds: string[]) => {
    if (!awardingBodyIds.length || !token) return {};
    const results = await Promise.all(
      awardingBodyIds.map(async (bodyId) => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/awarding-bodies-templates/${bodyId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { [bodyId]: response.data.data };
        } catch {
          return { [bodyId]: [] };
        }
      })
    );
    return results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }, [token]);

  const { data: commissionTemplatesMap, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["commission-templates", awardingBodyTemplates.map((t) => t.awardingBodyId).sort()],
    queryFn: () => fetchCommissionTemplates(awardingBodyTemplates.map((t) => t.awardingBodyId)),
    enabled: awardingBodyTemplates.length > 0 && !!token,
  });

  // Initialize component with form values once
  useEffect(() => {
    if (!isInitialized && form) {
      const formAgentType = form.getValues("agentType");
      const formTemplates = form.getValues("awardingBodyTemplates") || [];
      
      if (formAgentType && formAgentType !== agentType) {
        setAgentType(formAgentType);
      }
      
      if (formTemplates.length > 0) {
        const templatesWithFlags = formTemplates.map((template: AwardingBodyTemplate) => ({
          ...template,
          isExisting: !!template.commissionTemplateId,
        }));
        setAwardingBodyTemplates(templatesWithFlags);
      }
      
      setIsInitialized(true);
    }
  }, [form, isInitialized, agentType]);

  // Auto-select template when only one is available (only for new templates)
  useEffect(() => {
    if (!commissionTemplatesMap || !isInitialized) return;

    const updatedTemplates = awardingBodyTemplates.map((t) => {
      const templates = commissionTemplatesMap[t.awardingBodyId] || [];
      if (templates.length === 1 && !t.commissionTemplateId && !t.isExisting) {
        return { ...t, commissionTemplateId: templates[0].id };
      }
      return t;
    });

    const hasChanges = updatedTemplates.some((updated, index) => 
      updated.commissionTemplateId !== awardingBodyTemplates[index]?.commissionTemplateId
    );

    if (hasChanges) {
      setAwardingBodyTemplates(updatedTemplates);
      form.setValue("awardingBodyTemplates", updatedTemplates);
      // Clear any validation errors when templates are updated
      form.clearErrors("awardingBodyTemplates");
    }
  }, [commissionTemplatesMap, awardingBodyTemplates, form, isInitialized]);

  // Handle agent type change
  const handleAgentTypeChange = useCallback((value: string) => {
    if (value !== agentType) {
      setAgentType(value);
      // Clear existing templates when agent type changes
      setAwardingBodyTemplates([]);
      form.setValue("awardingBodyTemplates", []);
      form.setValue("agentType", value);
      // Clear validation errors
      form.clearErrors("awardingBodyTemplates");
    }
  }, [agentType, form]);

  const clearSearch = () => setSearchQuery("");

  // Handle awarding body selection
  const handleAwardingBodyChange = useCallback((selectedBodies: string[]) => {
    const updatedTemplates = awardingBodyTemplates.filter((t) =>
      selectedBodies.includes(t.awardingBodyId)
    );

    const newTemplates = selectedBodies
      .filter((id) => !updatedTemplates.some((t) => t.awardingBodyId === id))
      .map((id) => ({
        awardingBodyId: id,
        commissionTemplateId: "",
        isExisting: false,
      }));

    const finalTemplates = [...updatedTemplates, ...newTemplates];
    setAwardingBodyTemplates(finalTemplates);
    form.setValue("awardingBodyTemplates", finalTemplates);
    // Trigger validation
    form.trigger("awardingBodyTemplates");
  }, [awardingBodyTemplates, form]);

  // Handle template change
  const handleTemplateChange = useCallback((awardingBodyId: string, templateId: string) => {
    const updatedTemplates = awardingBodyTemplates.map((t) =>
      t.awardingBodyId === awardingBodyId
        ? { ...t, commissionTemplateId: templateId }
        : t
    );
    setAwardingBodyTemplates(updatedTemplates);
    form.setValue("awardingBodyTemplates", updatedTemplates);
    // Trigger validation
    form.trigger("awardingBodyTemplates");
  }, [awardingBodyTemplates, form]);

  // Remove selected body (only for non-existing templates)
  const handleRemoveSelectedBody = useCallback((bodyId: string) => {
    const templateToRemove = awardingBodyTemplates.find(
      (t) => t.awardingBodyId === bodyId
    );
    
    if (templateToRemove?.isExisting) return;

    const currentSelected = awardingBodyTemplates.map((t) => t.awardingBodyId);
    handleAwardingBodyChange(currentSelected.filter((id) => id !== bodyId));
  }, [awardingBodyTemplates, handleAwardingBodyChange]);

  // Function to get individual template error
  const getTemplateError = (awardingBodyId: string) => {
    if (!awardingBodyTemplatesError?.message && !Array.isArray(awardingBodyTemplatesError)) return null;
    
    if (Array.isArray(awardingBodyTemplatesError)) {
      const templateIndex = awardingBodyTemplates.findIndex(t => t.awardingBodyId === awardingBodyId);
      return awardingBodyTemplatesError[templateIndex]?.commissionTemplateId?.message;
    }
    return null;
  };

  interface AwardingBodyNodeProps {
    body: any;
    isSelected: boolean;
    awardingBodyTemplates: any[];
    commissionTemplatesMap: Record<string, any[]>;
    isLoadingTemplates: boolean;
    handleAwardingBodyChange: (ids: string[]) => void;
    handleTemplateChange: (bodyId: string, templateId: string) => void;
    handleRemoveSelectedBody: (bodyId: string) => void;
  }

  const AwardingBodyNode = ({
    body,
    isSelected,
    awardingBodyTemplates,
    commissionTemplatesMap,
    isLoadingTemplates,
    handleAwardingBodyChange,
    handleTemplateChange,
    handleRemoveSelectedBody,
  }: AwardingBodyNodeProps) => {
    const templates = commissionTemplatesMap?.[body.id] || [];
    const selectedTemplate = awardingBodyTemplates.find(
      (t) => t.awardingBodyId === body.id
    );
    const currentSelected = awardingBodyTemplates.map((t) => t.awardingBodyId);
    const isExistingTemplate = selectedTemplate?.isExisting || false;
    const templateError = getTemplateError(body.id);

    return (
      <div
        className={`
        flex items-start space-x-4 p-4 border rounded-lg transition-all duration-300 ease-in-out
        transform hover:shadow-md
        ${
          isSelected
            ? isExistingTemplate
              ? "border-green-200 bg-green-50 shadow-sm"
              : templateError
              ? "border-red-200 bg-red-50 shadow-sm"
              : "border-blue-200 bg-blue-50 shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300"
        }
      `}
      >
        {/* Checkbox and Label */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <input
            type="checkbox"
            id={`awarding-body-${body.id}`}
            checked={isSelected}
            disabled={isExistingTemplate}
            onChange={(e) => {
              if (e.target.checked) {
                handleAwardingBodyChange([...currentSelected, body.id]);
              } else {
                handleAwardingBodyChange(
                  currentSelected.filter((id) => id !== body.id)
                );
              }
            }}
            className={`w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200 ${
              isExistingTemplate ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <div className="flex flex-col">
            <label
              htmlFor={`awarding-body-${body.id}`}
              className={`text-sm font-medium text-gray-800 cursor-pointer truncate hover:text-blue-600 transition-colors duration-200 ${
                isExistingTemplate ? 'cursor-not-allowed' : ''
              }`}
              title={body.name}
            >
              {body.name}
            </label>
            {isSelected && (
              <span className={`text-xs ${
                isExistingTemplate 
                  ? 'text-green-600' 
                  : templateError 
                  ? 'text-red-600' 
                  : 'text-blue-600'
              }`}>
                {isExistingTemplate ? 'Existing Template' : templateError ? 'Template Required' : 'Selected'}
              </span>
            )}
          </div>
        </div>

        {/* Template Select */}
        {isSelected && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-4">
              <div className="min-w-0 flex-1 max-w-xs w-[250px]">
                {templates.length > 0 ? (
                  <div>
                    <Select
                      value={selectedTemplate?.commissionTemplateId || ""}
                      onValueChange={(value) => handleTemplateChange(body.id, value)}
                      disabled={isExistingTemplate}
                    >
                      <FormControl>
                        <SelectTrigger className={`${
                          isExistingTemplate ? 'opacity-50 cursor-not-allowed' : ''
                        } ${templateError ? 'border-red-300 focus:ring-red-500 focus:border-red-300' : ''}`}>
                          <SelectValue placeholder="Select Template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template: any) => (
                          <SelectItem key={template.commissionTemplateId} value={template.commissionTemplateId}>
                            {template.templateName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {templateError && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {templateError}
                      </div>
                    )}
                  </div>
                ) : isLoadingTemplates ? (
                  <div className="px-3 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
                    Loading templates...
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                    No templates available
                  </div>
                )}
              </div>

              {/* Remove Button - Hidden for existing templates */}
              {!isExistingTemplate && (
                <button
                  onClick={() => handleRemoveSelectedBody(body.id)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                  title="Remove selection"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full">
      {/* Basic Information */}
      <div className="shadow-md rounded-md border border-[#EAEDF0] transition-all duration-300 hover:shadow-lg">
        <h1 className="bg-[#F5F7F9] rounded-t-md font-bold py-2 px-4 text-[#272E35]">
          Basic Information
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 py-6 px-3 bg-white">
          <CustomField.Text
            form={form}
            name="firstName"
            labelName="First Name *"
            placeholder="First Name"
          />
          <CustomField.Text
            form={form}
            name="lastName"
            labelName="Last Name *"
            placeholder="Last Name"
          />
          <CustomField.PhoneNumber
            form={form}
            name="mobile"
            labelName="Mobile *"
            placeholder="Mobile"
          />
          <CustomField.Text
            form={form}
            name="email"
            labelName="Email *"
            placeholder="Email"
          />
          <CustomField.Text
            form={form}
            name="username"
            labelName="Username *"
            placeholder="Username"
          />
          <CustomField.Password
            form={form}
            name="password"
            labelName="Password *"
            placeholder="Password"
            mode="validate"
          />
        </div>
      </div>

      {/* Agent Details */}
      <div className="shadow-md rounded-md my-4 border border-[#EAEDF0] transition-all duration-300 hover:shadow-lg">
        <h1 className="bg-[#F5F7F9] rounded-t-md font-bold py-2 px-4 text-[#272E35]">
          Agent Details
        </h1>
        <div className="grid grid-cols-2 gap-4 py-6 px-3 bg-white">
          <div className="col-span-2">
          <CustomField.SingleSelectField
            form={form}
            name="agentType"
            labelName="Agent Type *"
            placeholder="Select Agent Type"
            options={["internal", "external"]}
            onValueChange={handleAgentTypeChange}
          />
          </div>

          {/* Enhanced Awarding Bodies Multi-Select with Error Handling */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[#272E35]">
                Awarding Bodies & Templates *
                {selectedBodies.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full animate-fade-in">
                    {selectedBodies.length} selected
                  </span>
                )}
              </label>
            </div>

            <div className={`border rounded-lg bg-white shadow-sm ${
              hasAwardingBodyError ? 'border-red-300' : 'border-gray-200'
            }`}>
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search awarding bodies..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Selected Bodies Section */}
              {selectedBodies.length > 0 && (
                <div className="p-4 bg-blue-25 border-b border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-blue-800">
                      Selected Bodies
                    </h3>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {selectedBodies.length} items
                    </span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedBodies.map((body: any) => (
                      <AwardingBodyNode
                        key={`selected-${body.id}`}
                        body={body}
                        isSelected={true}
                        awardingBodyTemplates={awardingBodyTemplates}
                        commissionTemplatesMap={commissionTemplatesMap || {}}
                        isLoadingTemplates={isLoadingTemplates}
                        handleAwardingBodyChange={handleAwardingBodyChange}
                        handleTemplateChange={handleTemplateChange}
                        handleRemoveSelectedBody={handleRemoveSelectedBody}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Available Bodies Section */}
              <div className="p-4">
                <div
                  className={`
                    space-y-3 transition-all duration-500 ease-in-out overflow-hidden
                    ${
                      filteredAwardingBodies.length <= 3
                        ? "max-h-none"
                        : "max-h-96"
                    }
                  `}
                >
                  {unselectedBodies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Available Awarding Bodies
                      </h3>
                      <div className="space-y-3 overflow-y-scroll overflow-x-hidden max-h-60">
                        {unselectedBodies.map((body: any) => (
                          <AwardingBodyNode
                            key={`unselected-${body.id}`}
                            body={body}
                            isSelected={false}
                            awardingBodyTemplates={awardingBodyTemplates}
                            commissionTemplatesMap={commissionTemplatesMap || {}}
                            isLoadingTemplates={isLoadingTemplates}
                            handleAwardingBodyChange={handleAwardingBodyChange}
                            handleTemplateChange={handleTemplateChange}
                            handleRemoveSelectedBody={handleRemoveSelectedBody}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Loading State for Awarding Bodies */}
                {isLoadingAwardingBodies && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading awarding bodies...</span>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoadingAwardingBodies &&
                  filteredAwardingBodies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Search className="text-gray-300 mb-2" size={48} />
                      <div className="text-sm text-gray-500 text-center">
                        {searchQuery ? (
                          <>
                            No awarding bodies found for `${searchQuery}`
                            <br />
                            <button
                              onClick={clearSearch}
                              className="text-blue-600 hover:text-blue-800 mt-1 transition-colors duration-200"
                            >
                              Clear search
                            </button>
                          </>
                        ) : agentType ? (
                          "No awarding bodies available for this agent type"
                        ) : (
                          "Please select an agent type first"
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Global Error Message for Awarding Body Templates */}
            {hasAwardingBodyError && (
              <FormMessage className="mt-2 flex items-center text-red-600">
                {typeof awardingBodyTemplatesError?.message === 'string' 
                  ? awardingBodyTemplatesError.message 
                  : "Please select at least one awarding body and template"
                }
              </FormMessage>
            )}
          </div>

          <CustomField.Text
            form={form}
            name="address"
            labelName="Address *"
            placeholder="Enter Address"
          />
          <CustomField.Text
            form={form}
            name="companyName"
            labelName="Company Name *"
            placeholder="Enter Company Name"
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="mb-6 shadow-md rounded-md border border-[#EAEDF0]">
        <h1 className="bg-[#F5F7F9] rounded-t-md font-bold py-2 px-4 text-[#272E35]">
          Additional Information
        </h1>
        <div className="grid gird-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-6 px-3 bg-white">
          <CustomField.DatePickerAnd
            form={form}
            name="startDate"
            labelName="Start Date *"
            placeholder="Enter Start Date"
          />
          <CustomField.DatePickerAnd
            form={form}
            name="endDate"
            labelName="End Date *"
            placeholder="Enter End Date"
          />
          <CustomField.Text
            form={form}
            name="note"
            labelName="Note *"
            placeholder="Enter Note"
          />
        </div>
      </div>

      <CustomField.CheckField
        form={form}
        name="agreementStatus"
        labelName="I have read and agree to the terms and conditions outlined in the Agent Agreement. By checking this box, I confirm my acceptance and compliance with the agreement."
        placeholder="is Active"
      />
    </div>
  );
};

export default Form_field;