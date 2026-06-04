import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { type Editor } from "@tiptap/core";
import { SuggestionKeyDownProps } from "@tiptap/suggestion";

interface Variable {
  label: string;
  value: string;
}

interface VariableDropdownProps {
  items: Variable[];
  command: (props: { id: string }) => void;
  editor: Editor;
}

export const VariableDropdown = forwardRef<
  { onKeyDown: (props: SuggestionKeyDownProps) => boolean },
  VariableDropdownProps
>(({ items, command, editor }: VariableDropdownProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        command({ id: item.value });
      }
    },
    [items, command]
  );

  useImperativeHandle(
    ref,
    () => ({
      onKeyDown: ({ event }: SuggestionKeyDownProps) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }),
    [selectedIndex, items.length, selectItem]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (containerRef.current) {
      const selectedElement = containerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <div
      ref={containerRef}
      className="variable-suggestion-dropdown"
      role="listbox"
    >
      {items.length ? (
        items.map((item, index) => (
          <div
            key={item.value}
            className={`item ${index === selectedIndex ? "is-selected" : ""}`}
            onClick={() => selectItem(index)}
            role="option"
            aria-selected={index === selectedIndex}
          >
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {item.value}
            </div>
          </div>
        ))
      ) : (
        <div className="item">No results</div>
      )}
    </div>
  );
});

VariableDropdown.displayName = "VariableDropdown";