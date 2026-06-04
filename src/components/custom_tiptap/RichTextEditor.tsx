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
import type { FieldPropsInterface } from "../common/fields/assets/interface/inputPropsType"
import { X, AtSign, Hash, Search, Quote, Smile, Code } from "lucide-react"
import { BiMenu, BiMenuAltLeft, BiMenuAltRight } from "react-icons/bi"
import { MdFormatListBulleted, MdFormatListNumbered } from "react-icons/md"
import 'tippy.js/dist/tippy.css'
import { Button } from "../ui/button"
import { Input } from "../ui/input"

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

const EMOJI_SETS = [
  { label: "Smileys", icon: "😀", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😌"] },
  { label: "Hand Gestures", icon: "👋", emojis: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👍", "👎", "👊", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "💅", "🤳"] },
  { label: "Symbols", icon: "❤️", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "👑", "⭐", "✨", "⚡", "🔥", "💫", "💥"] },
  { label: "Nature", icon: "🌈", emojis: ["🌈", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄", "🌬️", "💨", "💧", "💦", "☔", "🍀", "🌲", "🌳", "🌴", "🌵"] },
  { label: "Objects", icon: "🎁", emojis: ["🎁", "🎀", "🎈", "🎉", "🎊", "🎂", "🍰", "🧁", "🍪", "🍩", "🍫", "🍬", "🍭", "🍮", "🍯", "🍼", "☕", "🍵", "🍶", "🍾", "🍷", "🥂", "🍻", "🥃"] },
]

// Flatten all emojis for search with their labels
const ALL_EMOJIS = EMOJI_SETS.flatMap(set => 
  set.emojis.map(emoji => ({ emoji, category: set.label }))
)

// Emoji search keywords mapping for better search
const EMOJI_KEYWORDS: Record<string, string[]> = {
  "😀": ["smile", "happy", "grin", "face"],
  "😃": ["smile", "happy", "joy", "face"],
  "😄": ["smile", "happy", "laugh", "face"],
  "😁": ["grin", "smile", "happy", "face"],
  "😆": ["laugh", "smile", "happy", "face"],
  "😅": ["sweat", "smile", "laugh", "nervous"],
  "😂": ["laugh", "tears", "joy", "cry"],
  "🤣": ["laugh", "rolling", "floor", "lol"],
  "😊": ["blush", "smile", "happy", "face"],
  "😇": ["angel", "halo", "innocent", "smile"],
  "🙂": ["smile", "slight", "happy", "face"],
  "🙃": ["upside", "down", "silly", "smile"],
  "😉": ["wink", "flirt", "face"],
  "😌": ["relieved", "peaceful", "calm", "face"],
  "😍": ["love", "heart", "eyes", "adore"],
  "🥰": ["love", "hearts", "smile", "affection"],
  "😘": ["kiss", "love", "blow", "face"],
  "😗": ["kiss", "whistle", "face"],
  "😚": ["kiss", "closed", "eyes", "face"],
  "😙": ["kiss", "smile", "face"],
  "🥲": ["tear", "smile", "bittersweet", "face"],
  "😋": ["yum", "delicious", "tasty", "tongue"],
  "😛": ["tongue", "playful", "face"],
  "😜": ["wink", "tongue", "crazy", "playful"],
  "🤪": ["crazy", "zany", "wild", "face"],
  "👋": ["wave", "hello", "hi", "bye"],
  "🤚": ["hand", "raised", "stop", "palm"],
  "🖐️": ["hand", "five", "fingers", "palm"],
  "✋": ["hand", "stop", "raised", "palm"],
  "🖖": ["vulcan", "spock", "star trek", "hand"],
  "👌": ["ok", "okay", "perfect", "hand"],
  "🤌": ["pinch", "italian", "fingers", "hand"],
  "🤏": ["pinch", "small", "tiny", "fingers"],
  "✌️": ["peace", "victory", "two", "fingers"],
  "🤞": ["fingers", "crossed", "luck", "hope"],
  "🫰": ["heart", "fingers", "love", "hand"],
  "🤟": ["love", "you", "hand", "sign"],
  "🤘": ["rock", "metal", "horns", "hand"],
  "🤙": ["call", "me", "shaka", "hang loose"],
  "👍": ["thumbs", "up", "good", "like"],
  "👎": ["thumbs", "down", "bad", "dislike"],
  "👊": ["fist", "bump", "punch", "hand"],
  "👏": ["clap", "applause", "hands", "praise"],
  "🙌": ["raise", "celebrate", "hands", "hooray"],
  "👐": ["open", "hands", "hug", "embrace"],
  "🤲": ["palms", "together", "prayer", "hands"],
  "🤝": ["handshake", "deal", "agreement", "hands"],
  "🙏": ["pray", "thanks", "namaste", "hands"],
  "💅": ["nail", "polish", "manicure", "care"],
  "🤳": ["selfie", "phone", "camera", "photo"],
  "❤️": ["red", "heart", "love", "romance"],
  "🧡": ["orange", "heart", "love"],
  "💛": ["yellow", "heart", "love", "gold"],
  "💚": ["green", "heart", "love", "nature"],
  "💙": ["blue", "heart", "love"],
  "💜": ["purple", "heart", "love"],
  "🖤": ["black", "heart", "dark", "love"],
  "🤍": ["white", "heart", "pure", "love"],
  "🤎": ["brown", "heart", "love"],
  "💔": ["broken", "heart", "sad", "heartbreak"],
  "💕": ["two", "hearts", "love", "pink"],
  "💞": ["revolving", "hearts", "love"],
  "💓": ["beating", "heart", "love", "pulse"],
  "💗": ["growing", "heart", "love", "expanding"],
  "💖": ["sparkling", "heart", "love", "shine"],
  "💘": ["arrow", "heart", "cupid", "love"],
  "💝": ["heart", "ribbon", "gift", "love"],
  "💟": ["heart", "decoration", "love"],
  "👑": ["crown", "king", "queen", "royal"],
  "⭐": ["star", "favorite", "sparkle"],
  "✨": ["sparkles", "shine", "magic", "glitter"],
  "⚡": ["lightning", "bolt", "electric", "power"],
  "🔥": ["fire", "flame", "hot", "lit"],
  "💫": ["dizzy", "star", "sparkle"],
  "💥": ["boom", "explosion", "bang", "collision"],
  "🌈": ["rainbow", "colors", "pride", "gay"],
  "☀️": ["sun", "sunny", "bright", "day"],
  "🌤️": ["partly", "cloudy", "sun", "cloud"],
  "⛅": ["cloud", "sun", "weather"],
  "🌥️": ["cloudy", "sun", "behind", "weather"],
  "☁️": ["cloud", "weather", "sky"],
  "🌦️": ["rain", "sun", "weather"],
  "🌧️": ["rain", "cloud", "weather"],
  "⛈️": ["storm", "thunder", "lightning", "cloud"],
  "🌩️": ["lightning", "cloud", "weather"],
  "🌨️": ["snow", "cloud", "weather", "cold"],
  "❄️": ["snowflake", "cold", "ice", "winter"],
  "☃️": ["snowman", "winter", "cold", "snow"],
  "⛄": ["snowman", "without", "snow", "winter"],
  "🌬️": ["wind", "face", "blow", "breeze"],
  "💨": ["dash", "wind", "fast", "speed"],
  "💧": ["droplet", "water", "tear", "sweat"],
  "💦": ["sweat", "droplets", "water", "splash"],
  "☔": ["umbrella", "rain", "weather"],
  "🍀": ["clover", "four", "leaf", "luck"],
  "🌲": ["tree", "evergreen", "pine", "forest"],
  "🌳": ["tree", "deciduous", "nature"],
  "🌴": ["palm", "tree", "tropical", "beach"],
  "🌵": ["cactus", "desert", "plant"],
  "🎁": ["gift", "present", "box", "wrapped"],
  "🎀": ["ribbon", "bow", "decoration"],
  "🎈": ["balloon", "party", "celebration"],
  "🎉": ["party", "popper", "celebration", "confetti"],
  "🎊": ["confetti", "ball", "party", "celebration"],
  "🎂": ["cake", "birthday", "celebration"],
  "🍰": ["cake", "shortcake", "dessert", "sweet"],
  "🧁": ["cupcake", "muffin", "dessert", "sweet"],
  "🍪": ["cookie", "dessert", "sweet", "snack"],
  "🍩": ["donut", "doughnut", "dessert", "sweet"],
  "🍫": ["chocolate", "bar", "sweet", "candy"],
  "🍬": ["candy", "sweet", "lolly"],
  "🍭": ["lollipop", "candy", "sweet"],
  "🍮": ["custard", "pudding", "dessert", "sweet"],
  "🍯": ["honey", "pot", "sweet", "bear"],
  "🍼": ["baby", "bottle", "milk", "infant"],
  "☕": ["coffee", "hot", "drink", "beverage"],
  "🍵": ["tea", "cup", "drink", "beverage"],
  "🍶": ["sake", "bottle", "drink", "japanese"],
  "🍾": ["champagne", "bottle", "celebration", "drink"],
  "🍷": ["wine", "glass", "drink", "red"],
  "🥂": ["champagne", "glasses", "toast", "celebration"],
  "🍻": ["beer", "mugs", "cheers", "drink"],
  "🥃": ["whiskey", "glass", "drink", "tumbler"],
}

// Default variable options
const DEFAULT_VARIABLE_OPTIONS = {
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

// Variable Picker Component
const VariablePicker = ({ 
  variables, 
  onSelect, 
  icon: Icon, 
  label, 
  searchPlaceholder 
}: { 
  variables: Array<{ label: string; value: string }>
  onSelect: (value: string) => void
  icon: any
  label: string
  searchPlaceholder: string
}) => {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredVariables = useMemo(() => {
    if (!search.trim()) return variables
    return variables.filter(v => 
      v.label.toLowerCase().includes(search.toLowerCase()) ||
      v.value.toLowerCase().includes(search.toLowerCase())
    )
  }, [variables, search])

  const handleSelect = (value: string) => {
    onSelect(value)
    setIsOpen(false)
    setSearch("")
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="toolbar-Button"
          aria-label={label}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col max-h-96">
          <div className="p-3 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-sm">{label}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-72">
            {filteredVariables.length > 0 ? (
              filteredVariables.map((variable, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors border-b last:border-b-0"
                  onClick={() => handleSelect(variable.value)}
                >
                  <div className="font-medium text-sm text-gray-900">{variable.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-mono">{variable.value}</div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No variables found
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Emoji Picker Component with enhanced search
const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  const getFilteredEmojis = () => {
    if (!searchQuery.trim()) {
      return EMOJI_SETS[activeTab].emojis
    }
    
    // Search across all emojis with keyword matching
    const query = searchQuery.toLowerCase().trim()
    return ALL_EMOJIS
      .filter(({ emoji }) => {
        const keywords = EMOJI_KEYWORDS[emoji] || []
        return keywords.some(keyword => keyword.includes(query))
      })
      .map(({ emoji }) => emoji)
  }

  const handleSelect = (emoji: string) => {
    onSelect(emoji)
    setSearchQuery("")
    if (!searchQuery.trim()) {
      setIsOpen(false)
    }
  }

  const filteredEmojis = getFilteredEmojis()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="toolbar-Button"
          aria-label="Emoji"
          title="Insert Emoji"
        >
          <Smile className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-md p-0" align="start">
        <div className="flex flex-col">
          {/* Search Bar */}
          <div className="p-3 border-b bg-white sticky top-0 z-10">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search emojis (e.g., happy, love, fire)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            {searchQuery.trim() && (
              <div className="mt-2 text-xs text-gray-500">
                Found {filteredEmojis.length} emoji{filteredEmojis.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Category Tabs */}
          {!searchQuery.trim() && (
            <div className="flex gap-1 p-2 border-b overflow-x-auto bg-gray-50">
              {EMOJI_SETS.map((set, idx) => (
                <button
                  key={idx}
                  className={`px-2 py-1 text-lg whitespace-nowrap rounded transition-colors ${
                    activeTab === idx 
                      ? 'bg-blue-500 text-white scale-110' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                  onClick={() => setActiveTab(idx)}
                  title={set.label}
                >
                  {set.icon}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Grid */}
          <div className="grid grid-cols-7 gap-1 p-3 max-h-72 overflow-y-auto">
            {filteredEmojis.length > 0 ? (
              filteredEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  className="text-2xl hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer hover:scale-125"
                  onClick={() => handleSelect(emoji)}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))
            ) : (
              <div className="col-span-7 p-4 text-center text-sm text-gray-500">
                No emojis found for {searchQuery}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Component for the toolbar
const TiptapToolbar = ({ 
  editor, 
  atVariables, 
  hashVariables,
  hasAtVariables,
  hasHashVariables,
  onToggleHtmlEditor
}: { 
  editor: Editor
  atVariables: Array<{ label: string; value: string }>
  hashVariables: Array<{ label: string; value: string }>
  hasAtVariables: boolean
  hasHashVariables: boolean
  onToggleHtmlEditor?: () => void
}) => {
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

  const insertVariable = (value: string) => {
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'text',
          marks: [
            {
              type: 'textStyle',
              attrs: {
                class: 'variable-node',
              },
            },
          ],
          text: value,
        },
        {
          type: 'text',
          text: ' ',
        },
      ])
      .run()
  }

  const insertEmoji = (emoji: string) => {
    editor
      .chain()
      .focus()
      .insertContent(emoji)
      .run()
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
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Blockquote"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>
        
        {/* HTML Editor Toggle Button */}
        {onToggleHtmlEditor && (
          <Button
            className="toolbar-Button"
            onClick={onToggleHtmlEditor}
            aria-label="HTML Editor"
            title="Toggle HTML Editor"
          >
            <Code className="w-4 h-4" />
          </Button>
        )}
        
        {/* Variable Pickers */}
        {hasAtVariables && (
          <VariablePicker
            variables={atVariables}
            onSelect={insertVariable}
            icon={AtSign}
            label="Agent Variables"
            searchPlaceholder="Search agent variables..."
          />
        )}
        
        {hasHashVariables && (
          <VariablePicker
            variables={hashVariables}
            onSelect={insertVariable}
            icon={Hash}
            label="System Variables"
            searchPlaceholder="Search system variables..."
          />
        )}

        {/* Emoji Picker with search */}
        <EmojiPicker onSelect={insertEmoji} />
        
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

interface ExtendedFieldPropsInterface extends FieldPropsInterface {
  customVariables?: {
    "@"?: Array<{ label: string; value: string }>
    "#"?: Array<{ label: string; value: string }>
  }
  // New props for variable configuration
  atVariables?: Array<{ label: string; value: string }>
  hashVariables?: Array<{ label: string; value: string }>
  enableAtVariables?: boolean
  enableHashVariables?: boolean
  // HTML content input
  htmlContent?: string
  // Email template specific
  showHtmlInput?: boolean
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
  atVariables,
  hashVariables,
  enableAtVariables = true,
  enableHashVariables = true,
  htmlContent,
  showHtmlInput = false,
}: ExtendedFieldPropsInterface) => {
  const [isEditorLoaded, setIsEditorLoaded] = useState(false)
  const [htmlInputVisible, setHtmlInputVisible] = useState(showHtmlInput)
  const [localHtmlInput, setLocalHtmlInput] = useState(htmlContent || "")
  const editorRef = useRef<Editor | null>(null)

  // Determine final variables based on props priority
  const allVariables = useMemo(() => {
    const finalAtVars = atVariables || customVariables["@"] || DEFAULT_VARIABLE_OPTIONS["@"]
    const finalHashVars = hashVariables || customVariables["#"] || DEFAULT_VARIABLE_OPTIONS["#"]

    return {
      "@": enableAtVariables ? finalAtVars : [],
      "#": enableHashVariables ? finalHashVars : [],
    }
  }, [customVariables, atVariables, hashVariables, enableAtVariables, enableHashVariables])

  // Create extensions array
  const extensions = useMemo(() => {
    return [
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
  }, [placeholder])

  // Determine initial content: use htmlContent prop if provided, otherwise use form value
  const initialContent = useMemo(() => {
    if (htmlContent) {
      return htmlContent
    }
    return form.getValues(name) || "<p></p>"
  }, [htmlContent, form, name])

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: !disabled && !viewOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      form.setValue(name, html, { shouldValidate: true })
      // Sync with HTML input if visible
      if (htmlInputVisible) {
        setLocalHtmlInput(html)
      }
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor
      setIsEditorLoaded(true)
    },
  })

  // Update local HTML input when htmlContent prop changes
  useEffect(() => {
    setLocalHtmlInput(htmlContent || "")
  }, [htmlContent])

  // Update editor content when htmlContent prop changes
  useEffect(() => {
    if (editor && htmlContent && !editor.isDestroyed) {
      editor.chain().setContent(htmlContent).run()
    }
  }, [htmlContent, editor])

  // Update editor editable state when viewOnly or disabled changes
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!disabled && !viewOnly)
    }
  }, [editor, disabled, viewOnly])

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

  // Determine which variable types are active
  const hasAtVariables = enableAtVariables && allVariables["@"].length > 0
  const hasHashVariables = enableHashVariables && allVariables["#"].length > 0

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
                {/* HTML Input Section */}
                {showHtmlInput && htmlInputVisible && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-600" />
                        <label className="font-semibold text-sm text-gray-800">
                          HTML Source Code
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHtmlInputVisible(false)}
                        className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
                      >
                        Hide Code
                      </button>
                    </div>
                    <textarea
                      value={localHtmlInput}
                      onChange={(e) => {
                        const html = e.target.value
                        setLocalHtmlInput(html)
                      }}
                      placeholder="Paste or write your HTML code here..."
                      className="w-full h-40 p-3 text-xs font-mono border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-inner"
                      spellCheck={false}
                    />
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (editor && !editor.isDestroyed) {
                            const html = editor.getHTML()
                            setLocalHtmlInput(html)
                          }
                        }}
                        className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm font-medium flex items-center gap-1"
                      >
                        ↓ Sync from Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (localHtmlInput.trim()) {
                            if (editor && !editor.isDestroyed) {
                              editor.chain().setContent(localHtmlInput).run()
                              form.setValue(name, localHtmlInput, { shouldValidate: true })
                            }
                          }
                        }}
                        className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm font-medium flex items-center gap-1"
                      >
                        ↑ Load to Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLocalHtmlInput("")
                          if (editor && !editor.isDestroyed) {
                            editor.chain().setContent("<p></p>").run()
                            form.setValue(name, "<p></p>", { shouldValidate: true })
                          }
                        }}
                        className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm font-medium flex items-center gap-1"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                      <strong>Tip:</strong> Edit HTML directly or use the visual editor below. Changes sync automatically.
                    </div>
                  </div>
                )}
                <FormControl>
                  <div
                    className={`border rounded-md overflow-hidden relative ${
                      isError
                        ? "border-red-500 focus-within:border-red-500"
                        : "border-gray-300 focus-within:border-blue-500"
                    } bg-white transition-colors duration-200`}
                    style={{
                      backgroundColor: disabled ? "#f9fafb" : "white",
                      height: "350px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {!isEditorLoaded && (
                      <div className="h-32 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Loading editor...</span>
                      </div>
                    )}
                    {editor && !disabled && !viewOnly && (
                      <TiptapToolbar 
                        editor={editor} 
                        atVariables={allVariables["@"]}
                        hashVariables={allVariables["#"]}
                        hasAtVariables={hasAtVariables}
                        hasHashVariables={hasHashVariables}
                        onToggleHtmlEditor={showHtmlInput ? () => setHtmlInputVisible(!htmlInputVisible) : undefined}
                      />
                    )}
                    <div 
                      className="flex-1 overflow-auto"
                      style={{
                        maxHeight: "calc(350px - 60px)",
                      }}
                    >
                      <EditorContent
                        editor={editor}
                        style={{
                          height: "100%",
                          minHeight: "120px",
                        }}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
                {!disabled && (hasAtVariables || hasHashVariables) && (
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                    <span>
                      {hasAtVariables && hasHashVariables && (
                        <>
                          Click <AtSign className="inline w-3 h-3 mx-0.5" /> for agent variables or{" "}
                          <Hash className="inline w-3 h-3 mx-0.5" /> for system variables in the toolbar
                        </>
                      )}
                      {hasAtVariables && !hasHashVariables && (
                        <>
                          Click <AtSign className="inline w-3 h-3 mx-0.5" /> for agent variables in the toolbar
                        </>
                      )}
                      {!hasAtVariables && hasHashVariables && (
                        <>
                          Click <Hash className="inline w-3 h-3 mx-0.5" /> for system variables in the toolbar
                        </>
                      )}
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
          height: 100% !important;
          font-size: 14px;
          line-height: 1.5;
          padding: 12px;
          outline: none;
          overflow-y: auto;
          max-height: 100%;
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
          min-height: 60px;
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