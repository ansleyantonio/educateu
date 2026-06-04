/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { TextCaseFormat } from "@/utils/textFormate";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { FieldPropsInterface } from "../interface/inputPropsType";

// Variable options configuration
const VARIABLE_OPTIONS = {
  "@": [
    { label: "Agent Name", value: "{{agent_name}}" },
    { label: "Agent Email", value: "{{agent_email}}" },
    { label: "Agent Phone", value: "{{agent_phone}}" },
    { label: "Agent Department", value: "{{agent_department}}" },
  ],
  "#": [
    { label: "Student Name", value: "{{student_name}}" },
    { label: "Student ID", value: "{{student_id}}" },
    { label: "Student Email", value: "{{student_email}}" },
    { label: "Student Grade", value: "{{student_grade}}" },
    { label: "Student Course", value: "{{student_course}}" },
    { label: "Current Date", value: "{{current_date}}" },
    { label: "Current Time", value: "{{current_time}}" },
  ],
};

interface VariableDropdownProps {
  variables: Array<{ label: string; value: string }>;
  position: { top: number; left: number; showAbove: boolean };
  onSelect: (variable: string) => void;
  onClose: () => void;
  selectedIndex: number;
  searchText: string;
}

const VariableDropdown = ({
  variables,
  position,
  onSelect,
  onClose,
  selectedIndex,
  searchText,
}: VariableDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const dropdown = e.target as HTMLElement;
      if (!dropdown.closest(".variable-dropdown")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="variable-dropdown absolute bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto min-w-[280px] z-[9999]"
      style={{
        top: position.showAbove ? "auto" : position.top,
        bottom: position.showAbove
          ? `calc(100% - ${position.top}px + 8px)`
          : "auto",
        left: position.left,
        transform: position.showAbove ? "translateY(-100%)" : "none",
      }}
    >
      {/* Search indicator */}
      {searchText && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-600">
          Searching for:{" "}
          <span className="font-medium text-gray-900">{searchText}</span>
        </div>
      )}

      {variables.length === 0 ? (
        <div className="px-3 py-3 text-sm text-gray-500 text-center">
          {searchText
            ? `No variables found for "${searchText}"`
            : "No variables available"}
        </div>
      ) : (
        <div className="py-1">
          {variables.map((variable, index) => {
            // Highlight matching text
            const highlightText = (text: string, search: string) => {
              if (!search) return text;
              const regex = new RegExp(`(${search})`, "gi");
              const parts = text.split(regex);
              return parts.map((part, i) =>
                regex.test(part) ? (
                  <mark
                    key={i}
                    className="bg-yellow-200 text-yellow-900 px-0.5 rounded"
                  >
                    {part}
                  </mark>
                ) : (
                  part
                )
              );
            };

            return (
              <div
                key={variable.value}
                className={`px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                  index === selectedIndex
                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(variable.value);
                }}
                onMouseEnter={() => {
                  // Optional: Update selected index on hover for better UX
                }}
              >
                <div className="font-medium">
                  {highlightText(variable.label, searchText)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {highlightText(variable.value, searchText)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ExtendedFieldPropsInterface extends FieldPropsInterface {
  customVariables?: {
    "@"?: Array<{ label: string; value: string }>;
    "#"?: Array<{ label: string; value: string }>;
  };
}

const RichTextEditor = ({
  form,
  name,
  placeholder,
  labelName,
  optional = true,
  disabled = false,
  viewOnly = false,
  customVariables = {},
}: ExtendedFieldPropsInterface) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [isQuillLoaded, setIsQuillLoaded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    showAbove: false,
  });
  const [currentTrigger, setCurrentTrigger] = useState<"@" | "#" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [triggerIndex, setTriggerIndex] = useState(-1);
  const initializingRef = useRef(false);

  const error = form.formState.errors?.[name];
  const isError = !!error;

  // Merge default variables with custom variables
  const allVariables = useMemo(
    () => ({
      "@": [...(VARIABLE_OPTIONS["@"] || []), ...(customVariables["@"] || [])],
      "#": [...(VARIABLE_OPTIONS["#"] || []), ...(customVariables["#"] || [])],
    }),
    [customVariables]
  );

  // Filter variables based on search text
  const filteredVariables = useMemo(() => {
    if (!currentTrigger) return [];
    const variables = allVariables[currentTrigger] || [];
    if (!searchText) return variables;

    return variables.filter(
      (variable) =>
        variable.label.toLowerCase().includes(searchText.toLowerCase()) ||
        variable.value.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [currentTrigger, searchText, allVariables]);

  function isQuillContentEmpty(html: string): boolean {
    if (!html || typeof html !== "string") return true;

    try {
      const div = document.createElement("div");
      div.innerHTML = html;
      const text = div.textContent?.replace(/\u200B/g, "").trim();
      const hasImages = div.getElementsByTagName("img").length > 0;
      const hasVideos = div.getElementsByTagName("video").length > 0;
      const hasIframes = div.getElementsByTagName("iframe").length > 0;
      const hasMediaContent = hasImages || hasVideos || hasIframes;

      return !text && !hasMediaContent;
    } catch (error) {
      console.error("Error checking if Quill content is empty:", error);
      return false;
    }
  }

  const updateDropdownPosition = useCallback(() => {
    if (!quillRef.current || !editorRef.current) return;

    const selection = quillRef.current.getSelection();
    if (!selection) return;

    try {
      const bounds = quillRef.current.getBounds(selection.index);
      const editorContainer = editorRef.current.querySelector(".ql-editor");
      const editorRect = editorContainer?.getBoundingClientRect();

      if (editorContainer && editorRect) {
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 240; // Approximate dropdown height
        const spaceBelow =
          viewportHeight - (editorRect.top + bounds.top + bounds.height);
        const spaceAbove = editorRect.top + bounds.top;

        // Determine if dropdown should show above or below
        const showAbove =
          spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

        setDropdownPosition({
          top: bounds.top + bounds.height + 4, // Small offset from cursor
          left: Math.max(0, Math.min(bounds.left, editorRect.width - 280)), // Keep within editor bounds
          showAbove,
        });
      }
    } catch (error) {
      console.error("Error updating dropdown position:", error);
    }
  }, []);

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
    setCurrentTrigger(null);
    setSearchText("");
    setSelectedIndex(0);
    setTriggerIndex(-1);
  }, []);

  const insertVariable = useCallback(
    (variable: string) => {
      if (!quillRef.current || triggerIndex < 0) return;

      const selection = quillRef.current.getSelection();
      if (!selection) return;

      // Calculate the length to delete (trigger + search text)
      const deleteLength = selection.index - triggerIndex;

      // Delete the trigger character and search text
      quillRef.current.deleteText(triggerIndex, deleteLength);

      // Insert the variable with special formatting
      quillRef.current.insertText(triggerIndex, variable, {
        background: "#e0f2fe",
        color: "#0369a1",
        bold: true,
      });

      // Move cursor after the inserted variable
      quillRef.current.setSelection(triggerIndex + variable.length);

      closeDropdown();
    },
    [triggerIndex, closeDropdown]
  );

  // Initialize Quill
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !editorRef.current ||
      initializingRef.current
    )
      return;

    initializingRef.current = true;

    const initializeQuill = async () => {
      try {
        // Load Quill CSS first
        if (!document.querySelector('link[href*="quill.snow.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href =
            "https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css";
          document.head.appendChild(link);

          // Wait for CSS to load
          await new Promise((resolve) => {
            link.onload = resolve;
            setTimeout(resolve, 1000); // Fallback timeout
          });
        }

        // Dynamic import of Quill
        const Quill = (await import("quill")).default;

        // Clear any existing content and ensure editorRef.current exists
        if (!editorRef.current) return;
        editorRef.current.innerHTML = "";

        // Initialize Quill
        const quill = new Quill(editorRef.current, {
          theme: "snow",
          placeholder: placeholder ? TextCaseFormat(placeholder) : undefined,
          readOnly: disabled || viewOnly,
          modules: {
            toolbar:
              disabled || viewOnly
                ? false
                : [
                    [{ size: ["small", false, "large", "huge"] }],
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    [{ color: [] }, { background: [] }],
                    [{ font: [] }],
                    [{ align: [] }],
                    ["bold", "italic", "underline", "strike"],
                    ["link"],
                    [
                      { list: "ordered" },
                      { list: "bullet" },
                      { list: "check" },
                    ],
                    [{ script: "sub" }, { script: "super" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    [{ direction: "rtl" }],
                    ["clean"],
                  ],
          },
        });

        quillRef.current = quill;

        // Set initial value
        const currentValue = form.getValues(name);
        if (currentValue) {
          quill.root.innerHTML = currentValue;
        }

        // Handle text changes with proper trigger detection
        quill.on("text-change", (delta: any, oldDelta: any, source: string) => {
          if (source !== "user") return;

          const html = quill.root.innerHTML;
          const selection = quill.getSelection();

          if (selection) {
            const text = quill.getText();
            const currentIndex = selection.index;

            // Check for trigger characters
            if (currentIndex > 0) {
              const char = text[currentIndex - 1];

              if (char === "@" || char === "#") {
                setCurrentTrigger(char);
                setTriggerIndex(currentIndex - 1);
                setSearchText("");
                setSelectedIndex(0);
                setShowDropdown(true);

                // Update dropdown position after a short delay to ensure bounds are calculated
                setTimeout(() => {
                  updateDropdownPosition();
                }, 10);

                return;
              }

              // Handle search text updates
              if (showDropdown && currentTrigger && triggerIndex >= 0) {
                if (
                  currentIndex > triggerIndex &&
                  text[triggerIndex] === currentTrigger
                ) {
                  const searchQuery = text.substring(
                    triggerIndex + 1,
                    currentIndex
                  );
                  setSearchText(searchQuery);
                  setSelectedIndex(0);
                } else {
                  closeDropdown();
                }
              }
            }
          }

          // Update form value
          const cleaned = isQuillContentEmpty(html) ? "" : html;
          form.setValue(name, cleaned, { shouldValidate: true });
        });

        // Handle selection changes for dropdown positioning
        quill.on("selection-change", (range: any) => {
          if (range && showDropdown) {
            setTimeout(updateDropdownPosition, 10);
          }
        });

        setIsQuillLoaded(true);
      } catch (error) {
        console.error("Failed to initialize Quill:", error);
      } finally {
        initializingRef.current = false;
      }
    };

    initializeQuill();

    // Cleanup function
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [disabled, viewOnly, placeholder]); // Only re-initialize if these props change

  // Handle keyboard events for dropdown navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown || filteredVariables.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredVariables.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredVariables.length - 1
          );
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          if (filteredVariables[selectedIndex]) {
            insertVariable(filteredVariables[selectedIndex].value);
          }
          break;
        case "Escape":
          e.preventDefault();
          closeDropdown();
          break;
        case "Backspace":
          // Close dropdown if we delete the trigger character
          if (showDropdown && triggerIndex >= 0 && quillRef.current) {
            const selection = quillRef.current.getSelection();
            if (selection && selection.index <= triggerIndex) {
              closeDropdown();
            }
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    showDropdown,
    filteredVariables,
    selectedIndex,
    insertVariable,
    closeDropdown,
    triggerIndex,
  ]);

  return (
    <div className="relative">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            {labelName && (
              <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
                {TextCaseFormat(labelName)}
                {!optional && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            {viewOnly ? (
              <div
                className="min-h-[40px] px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md prose prose-sm max-w-none"
                style={{ maxHeight: "350px", minHeight: "150px" , overflow: "scroll" }}
                dangerouslySetInnerHTML={{ __html: field.value || "" }}
              />
            ) : (
              <>
                <FormControl>
                  <div
                    className={`border rounded-md overflow-visible relative ${
                      isError
                        ? "border-red-500 focus-within:border-red-500"
                        : "border-gray-300 focus-within:border-blue-500"
                    } bg-white transition-colors duration-200`}
                    style={{
                      backgroundColor: disabled ? "#f9fafb" : "white",
                    }}
                  >
                    {/* Loading state */}
                    {!isQuillLoaded && (
                      <div className="h-32 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          Loading editor...
                        </span>
                      </div>
                    )}

                    {/* Quill Editor Container */}
                    <div
                      ref={editorRef}
                      className={`${!isQuillLoaded ? "hidden" : ""}`}
                      style={{ maxHeight: "350px", minHeight: "150px" , overflow: "scroll" }}
                    />

                    {showDropdown && currentTrigger && isQuillLoaded && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="relative h-full pointer-events-auto">
                          <VariableDropdown
                            variables={filteredVariables}
                            position={dropdownPosition}
                            onSelect={insertVariable}
                            onClose={closeDropdown}
                            selectedIndex={selectedIndex}
                            searchText={searchText}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />

                {/* Help text */}
                {!disabled && (
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                    <span>
                      Type{" "}
                      <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                        @
                      </kbd>{" "}
                      for agent variables or{" "}
                      <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                        #
                      </kbd>{" "}
                      for student/system variables
                    </span>
                    {/* Navigation hint */}
                    <div className="py-2 text-xs text-gray-500 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">
                          ↑↓
                        </kbd>
                        <span>Navigate</span>
                      </div>
                      <div className="flex items-center gap-2 mx-2">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">
                          Enter
                        </kbd>
                        <span>Select</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </FormItem>
        )}
      />

      {/* Quill Styles - Only load once */}
      {isQuillLoaded && (
        <style jsx global>{`
          .ql-editor {
            min-height: 120px !important;
            font-size: 14px;
            line-height: 1.5;
            padding: 12px;
          }

          .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }

          .ql-toolbar {
            border-bottom: 1px solid #e5e7eb;
            border-top: none;
            border-left: none;
            border-right: none;
          }

          .ql-container {
            border: none !important;
          }

          .ql-editor p {
            margin: 0;
            padding: 2px 0;
          }

          /* Variable styling */
          .ql-editor span[style*="background: rgb(224, 242, 254)"],
          .ql-editor span[style*="background:#e0f2fe"] {
            padding: 2px 4px !important;
            border-radius: 4px !important;
            font-weight: bold !important;
            color: #0369a1 !important;
          }

          /* Focus states */
          .ql-editor:focus {
            outline: none;
          }

          /* Disabled state */
          .ql-toolbar.ql-disabled {
            display: none;
          }

          .ql-editor.ql-disabled {
            background-color: #f9fafb;
            color: #6b7280;
          }

          /* Fix for duplicate toolbar */
          .ql-toolbar + .ql-toolbar {
            display: none !important;
          }

          /* Enhanced dropdown styling */
          .variable-dropdown {
            backdrop-filter: blur(8px);
            border: 1px solid rgba(0, 0, 0, 0.1);
          }

          .variable-dropdown mark {
            background-color: #fef3c7 !important;
            color: #92400e !important;
          }
        `}</style>
      )}
    </div>
  );
};

export default RichTextEditor;