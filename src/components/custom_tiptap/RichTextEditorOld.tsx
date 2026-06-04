/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/custom_ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TextCaseFormat } from "@/utils/textFormate"
import { useEffect, useRef, useState, useMemo } from "react"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import { Color, FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import { TiptapKit } from "./TiptapKit"
import type { FieldPropsInterface } from "../common/fields/assets/interface/inputPropsType"
import { X } from "lucide-react"
import { BiMenu, BiMenuAltLeft, BiMenuAltRight } from "react-icons/bi"
import { MdFormatListBulleted, MdFormatListNumbered } from "react-icons/md"
import 'tippy.js/dist/tippy.css'
import { Button } from "../ui/button"

const COLOR_PALETTE = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
  "#FFFFFF",
]

const FONT_SIZES = ["8px", "10px", "12px", "14px", "16px", "18px", "20px", "22px", "24px", "26px", "28px", "30px", "32px", "34px"]

const FONT_FAMILIES = ["Arial", "Times New Roman", "Courier New", "Georgia", "Verdana", "Helvetica"]

const HEADINGS = [
  { label: "Normal", value: "normal" },
  { label: "H1", value: "1" },
  { label: "H2", value: "2" },
  { label: "H3", value: "3" },
  { label: "H4", value: "4" },
  { label: "H5", value: "5" },
  { label: "H6", value: "6" },
]

// Custom Select Component wrapper
const CustomSelect = ({ value, onValueChange, items, placeholder, className = "" }: any) => (
  <Select value={value || "normal"} onValueChange={onValueChange}>
    <SelectTrigger className={`toolbar-select ${className}`} aria-label="Select option">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="radix-select-content" position="popper" sideOffset={4}>
      {items?.map((item: any, index: number) => (
        <SelectItem key={index} value={item?.value} className="radix-select-item text-xs">
          {item?.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

// Component for the toolbar
const TiptapToolbar = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null
  }

  const getCurrentHeading = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive("heading", { level: i })) {
        return String(i)
      }
    }
    return "normal"
  }

  const getCurrentFontSize = () => {
    for (const size of FONT_SIZES) {
      if (editor.isActive("textStyle", { fontSize: size })) {
        return size
      }
    }
    return "default"
  }

  const getCurrentFontFamily = () => {
    for (const family of FONT_FAMILIES) {
      if (editor.isActive("textStyle", { fontFamily: family })) {
        return family
      }
    }
    return "default"
  }

  return (
    <div className="tiptap-toolbar">
      <div className="toolbar-group">
        <CustomSelect
          value={getCurrentHeading()}
          onValueChange={(value: any) => {
            const level = value !== "normal" ? Number.parseInt(value) : undefined
            if (level) {
              editor.chain().focus().toggleHeading({ level: level as any }).run()
            } else {
              editor.chain().focus().setParagraph().run()
            }
          }}
          items={HEADINGS}
          placeholder="Heading"
        />

        <CustomSelect
          value={getCurrentFontSize()}
          onValueChange={(value: any) => {
            if (value !== "default") {
              editor.chain().focus().setFontSize(value as any).run()
            } else {
              editor.chain().focus().unsetFontSize().run()
            }
          }}
          items={[{ label: "Default Size", value: "default" }, ...FONT_SIZES.map(size => ({ label: size, value: size }))]}
          placeholder="Size"
          className="font-size-select"
        />

        <CustomSelect
          value={getCurrentFontFamily()}
          onValueChange={(value: any) => {
            if (value !== "default") {
              editor.chain().focus().setFontFamily(value).run()
            } else {
              editor.chain().focus().unsetFontFamily().run()
            }
          }}
          items={[{ label: "Default Font", value: "default" }, ...FONT_FAMILIES.map(family => ({ label: family, value: family }))]}
          placeholder="Font"
        />

        <Button
          className={`toolbar-Button ${editor.isActive("bold") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          aria-label="Bold"
          title="Bold"
        >
          <strong>B</strong>
        </Button>
        <Button
          className={`toolbar-Button ${editor.isActive("italic") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          aria-label="Italic"
          title="Italic"
        >
          <em>I</em>
        </Button>
        <Button
          className={`toolbar-Button ${editor.isActive("underline") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
          title="Underline"
        >
          <u>U</u>
        </Button>
        <Button
          className={`toolbar-Button ${editor.isActive("strike") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          aria-label="Strike"
          title="Strikethrough"
        >
          <s>S</s>
        </Button>
        <Button
          className={`toolbar-Button ${editor.isActive("highlight") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          aria-label="Highlight"
          title="Highlight"
        >
          <strong className="bg-yellow-300 p-1">H</strong>
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="toolbar-Button"
              aria-label="Text Color"
              title="Text Color"
              style={{
                color: editor.getAttributes("textStyle").color || "#000000",
              }}
            >
              <span className="font-bold">A</span>
              <span className="text-xs">▼</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Text Color</p>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_PALETTE.map((color) => (
                  <Button
                    key={color}
                    className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor: editor.getAttributes("textStyle").color === color ? "#3B82F6" : "#E5E7EB",
                    }}
                    onClick={() => {
                      if (color === "#FFFFFF") {
                        editor.chain().focus().unsetColor().run()
                      } else {
                        editor.chain().focus().setColor(color).run()
                      }
                    }}
                    title={color}
                  />
                ))}
              </div>
              <Button
                className="w-full mt-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                <span className="text-black">Reset Color</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          className={`toolbar-Button ${editor.isActive({ textAlign: "left" }) ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          aria-label="Align left"
          title="Align Left"
        >
          <BiMenuAltLeft style={{ width: "1.5em", height: "1.5em" }} name="align-left" />
        </Button>
        <Button
          className={`toolbar-Button ${editor.isActive({ textAlign: "center" }) ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          aria-label="Align center"
          title="Align Center"
        >
          <BiMenu name="align-center" style={{ width: "1.5em", height: "1.5em" }}/>
        </Button>
        <Button
          className={`toolbar-Button ${editor.isActive({ textAlign: "right" }) ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          aria-label="Align right"
          title="Align Right"
        >
          <BiMenuAltRight name="align-right" style={{ width: "1.5em", height: "1.5em" }}/>
        </Button>
        <Button
          className={`toolbar-Button ${editor.isActive({ textAlign: "justify" }) ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          aria-label="Justify"
          title="Justify"
        >
          <BiMenu name="align-justify" style={{ width: "1.5em", height: "1.5em" }}/>
        </Button>
         <Button
          className={`toolbar-Button ${editor.isActive("orderedList") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered list"
          title="Numbered List"
        >
          <MdFormatListNumbered name="Number-list" style={{ width: "1.5em", height: "1.5em" }}/>
        </Button>
        <Button
          className={`toolbar-Button ${editor.isActive("bulletList") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bulleted list"
          title="Bullet List"
        >
          <MdFormatListBulleted name="Bullet-list" style={{ width: "1.5em", height: "1.5em" }}/>
        </Button>
        <Button
          className={`toolbar-Button ${editor.isActive("blockquote") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().setBlockquote().run()}
          aria-label="Blockquote"
          title="Quote"
        >
          ❝
        </Button>
        <Button
          className="toolbar-Button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          aria-label="Clear formatting"
          title="Clear Formatting"
        >
          <X className="text-red-500 w-4 h-4" name="Reset" />
        </Button>
      </div>
    </div>
  )
}

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
}

interface ExtendedFieldPropsInterface extends FieldPropsInterface {
  customVariables?: {
    "@"?: Array<{ label: string; value: string }>
    "#"?: Array<{ label: string; value: string }>
  }
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
  const [isEditorLoaded, setIsEditorLoaded] = useState(false)
  const editorRef = useRef<Editor | null>(null)

  // Merge default variables with custom variables
  const allVariables = useMemo(
    () => ({
      "@": [...(VARIABLE_OPTIONS["@"] || []), ...(customVariables["@"] || [])],
      "#": [...(VARIABLE_OPTIONS["#"] || []), ...(customVariables["#"] || [])],
    }),
    [customVariables],
  )
  // Create extensions array based on viewOnly prop
  const extensions = useMemo(() => {
    const baseExtensions: any[] = [
        StarterKit,
        Placeholder.configure({ placeholder }),
        Link.configure({ openOnClick: false }),
        TextStyle,
        Color,
        Underline,
        TaskList,
        FontSize,
        TaskItem.configure({
          nested: true,
        }),
        FontSize.configure({
          types: ["textStyle"],
        }),
        FontFamily.configure({
          types: ["textStyle"],
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Highlight,
      ]

    // Only add TiptapKit (variable suggestions) when NOT in viewOnly or disabled mode
    if (!viewOnly || !disabled) {
      baseExtensions.push(TiptapKit.configure({ allVariables }))
    }

    return baseExtensions
  }, [viewOnly, disabled, allVariables, placeholder])

  const editor = useEditor({
    extensions,
    content: form.getValues(name) || "<p></p>",
    editable: !disabled || !viewOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      form.setValue(name, html, { shouldValidate: true })
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor
      setIsEditorLoaded(true)
    },
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy()
      }
    }
  }, [editor])

  const error = form.formState.errors?.[name]
  const isError = !!error

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
                style={{
                  maxHeight: "350px",
                  minHeight: "150px",
                  overflow: "auto",
                }}
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
                    {!isEditorLoaded && (
                      <div className="h-32 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Loading editor...</span>
                      </div>
                    )}
                    {editor && !disabled && !viewOnly && <TiptapToolbar editor={editor} />}
                    <EditorContent
                      editor={editor}
                      style={{
                        maxHeight: "350px",
                        minHeight: "150px",
                        overflow: "auto",
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
                {!disabled && (
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                    <span>
                      Type <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">@</kbd> for agent variables or{" "}
                      <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">#</kbd> for student/system variables
                    </span>
                  </div>
                )}
              </>
            )}
          </FormItem>
        )}
      />
      <style jsx global>{`
        /* Basic editor styles */
        .ProseMirror {
          min-height: 120px !important;
          font-size: 14px;
          line-height: 1.5;
          padding: 12px;
          outline: none;
        }

        .ProseMirror:first-child {
          margin-top: 0;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        /* List styles */
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror ul li,
        .ProseMirror ol li {
          margin: 0.25rem 0;
        }

        .ProseMirror ul li p,
        .ProseMirror ol li p {
          margin: 0;
        }

        .ProseMirror li > p {
          display: inline;
        }

        /* Task list styles */
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }

        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
        }

        .ProseMirror ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.5rem;
          user-select: none;
        }

        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }

        /* Heading styles */
        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3,
        .ProseMirror h4,
        .ProseMirror h5,
        .ProseMirror h6 {
          line-height: 1.1;
          margin-top: 2.5rem;
          text-wrap: pretty;
        }

        .ProseMirror h1,
        .ProseMirror h2 {
          margin-top: 3.5rem;
          margin-bottom: 1.5rem;
        }

        .ProseMirror h1 {
          font-size: 1.4rem;
          font-weight: 700;
        }

        .ProseMirror h2 {
          font-size: 1.2rem;
          font-weight: 600;
        }

        .ProseMirror h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .ProseMirror h4,
        .ProseMirror h5,
        .ProseMirror h6 {
          font-size: 1rem;
          font-weight: 600;
        }

        /* Code and preformatted text styles */
        .ProseMirror code {
          background-color: #f3f4f6;
          border-radius: 0.4rem;
          color: #1f2937;
          font-size: 0.85rem;
          padding: 0.25em 0.3em;
          font-family: "Courier New", monospace;
        }

        .ProseMirror pre {
          background: #1f2937;
          border-radius: 0.5rem;
          color: #f9fafb;
          font-family: "Courier New", monospace;
          margin: 1.5rem 0;
          padding: 0.75rem 1rem;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: none;
          color: inherit;
          font-size: 0.8rem;
          padding: 0;
        }

        /* Highlight/mark styles */
        .ProseMirror mark {
          background-color: #fef08a;
          border-radius: 0.4rem;
          box-decoration-break: clone;
          padding: 0.1rem 0.3rem;
        }

        /* Blockquote styles */
        .ProseMirror blockquote {
          border-left: 3px solid #d1d5db;
          margin: 1.5rem 0;
          padding-left: 1rem;
          color: #6b7280;
        }

        /* Horizontal rule styles */
        .ProseMirror hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 2rem 0;
        }

        /* Link styles */
        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
          cursor: pointer;
        }

        .ProseMirror a:hover {
          color: #2563eb;
        }

        /* Toolbar styles */
        .tiptap-toolbar {
          border-bottom: 1px solid #e5e7eb;
          padding: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          background-color: #f9fafb;
        }

        .toolbar-group {
          width: 100%;
          display: flex;
          gap: 4px;
          align-items: center;
          flex-wrap: wrap;
        }

        .toolbar-Button {
          color: #374151;
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid transparent;
          cursor: pointer;
          background: white;
          font-size: 14px;
          line-height: 1;
          transition: all 0.2s;
          min-width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .toolbar-Button:hover:not(:disabled) {
          background-color: #e5e7eb;
        }

        .toolbar-Button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toolbar-Button.is-active {
          background-color: #dbeafe;
          border-color: #93c5fd;
          color: #1e40af;
        }

        .toolbar-select {
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          cursor: pointer;
          background: white;
          font-size: 14px;
          max-width: 118px;
          height: 32px;
          display: flex;
          align-items: center;
        }

        .toolbar-select:hover {
          border-color: #9ca3af;
        }

        .toolbar-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        /* Radix UI Select Styles */
        .radix-select-content {
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 100;
          min-height: 40px;
          max-height: 200px;
          overflow-y: auto;
          width: 100%;
        }

        .radix-select-item {
          padding: 8px 12px;
          font-size: 12px;
          cursor: pointer;
          outline: none;
          display: flex;
          align-items: center;
        }

        .radix-select-item[data-highlighted] {
          background-color: #f1f5f9;
        }

        .radix-select-item[data-state="checked"] {
          background-color: #e0f2fe;
          color: #0369a1;
        }

        /* Responsive font size select */
        @media (max-width: 768px) {
          .font-size-select {
            min-width: 80px;
          }

          .toolbar-group {
            gap: 2px;
          }

          .toolbar-select {
            min-width: 80px;
            padding: 4px 6px;
            font-size: 12px;
          }

          .toolbar-Button {
            padding: 4px 8px;
            font-size: 12px;
          }
        }

        /* Variable suggestion dropdown - FIXED Z-INDEX FOR MODALS */
        .variable-suggestion-dropdown {
          position: fixed;
          z-index: 999998 !important; /* Higher than most modal z-indexes */
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          max-height: 240px;
          overflow-y: auto;
          width: 280px;
        }

        .variable-suggestion-dropdown .item {
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .variable-suggestion-dropdown .item:hover,
        .variable-suggestion-dropdown .item.is-selected {
          background-color: #f1f5f9;
        }

        /* Variable Node Styling */
        .variable-node {
          background-color: #e0f2fe;
          color: #0369a1;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          user-select: all;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor