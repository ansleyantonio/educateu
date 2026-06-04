"use client";

import { useEffect, useState } from "react";
import { TextNode, LexicalNode } from 'lexical';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $isElementNode,
  $isParagraphNode,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Undo2,
  Redo2,
  Link,
  Code,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;
  
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "A" &&
        target instanceof HTMLAnchorElement &&
        target.href &&
        !event.metaKey && !event.ctrlKey // Allow default behavior when holding Cmd/Ctrl to open in new tab
      ) {
        event.preventDefault();
        window.open(target.href, target.target || "_blank");
      }
    };
  
    rootElement.addEventListener("click", handleClick);
    return () => {
      rootElement.removeEventListener("click", handleClick);
    };
  }, [editor]);

  const format = (type: "bold" | "italic" | "underline" | "strikethrough") => {
    console.log("Formatting:", type);
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (!url) return;
  
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
          url,
          rel: "noreferrer",
          target: "_blank",
        });
      }
    });
  };

  const insertQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.extract();
        const quoteNode = $createQuoteNode();
  
        console.log("Quote ", nodes);
  
        // Loop through the extracted nodes
        nodes.forEach((node) => {
          if (node instanceof TextNode) {
            const textContent = node.getTextContent(); 
            const newNode = new TextNode(textContent); 
            quoteNode.append(newNode); 
          } else {
            quoteNode.append(node);
          }
        });
  
        selection.insertNodes([quoteNode]);
      }
    });
  };
  
  // const insertHeading = (level: 1 | 2 | 3) => {
  //   const tag: HeadingTagType = `h${level}` as HeadingTagType;
  //   editor.update(() => {
  //     const selection = $getSelection();
  //     if ($isRangeSelection(selection)) {
  //       const headingNode = $createHeadingNode(tag);
  //       selection.insertNodes([headingNode]);
  //     }
  //   });
  // };

  // const insertHeading = (level: 1 | 2 | 3) => {
  //   const tag: HeadingTagType = `h${level}` as HeadingTagType;
  
  //   editor.update(() => {
  //     const selection = $getSelection();
  //     if ($isRangeSelection(selection)) {
  //       selection.getNodes().forEach((node) => {
  //         const parent = node.getParent();
  //         if (parent && parent === $getRoot() && $isElementNode(node)) {
  //           const headingNode = $createHeadingNode(tag);
  //           headingNode.append(...node.getChildren());
  //           node.replace(headingNode);
  //         }
  //       });
  //     }
  //   });
  // };

  const insertHeading = (level: 1 | 2 | 3) => {
    const tag: HeadingTagType = `h${level}` as HeadingTagType;
  
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
  
        nodes.forEach((node) => {
          // Make sure it's a top-level paragraph
          if (
            $isElementNode(node) &&
            $isParagraphNode(node) &&
            node.getParent() === $getRoot()
          ) {
            const headingNode = $createHeadingNode(tag);
            node.getChildren().forEach((child) => {
              headingNode.append(child);
            });
            node.replace(headingNode);
          }
        });
      }
    });
  };

  
  const insertUnorderedList = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
  
      // Toggle unordered list
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    });
  };
  
  const insertOrderedList = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
  
      // Toggle ordered list
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    });
  };

  return (
    <div className="flex items-center flex-wrap gap-2 border-b pb-2 mb-2 text-sm text-gray-700">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
      >
        <Undo2 size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
      >
        <Redo2 size={16} />
      </Button>

      <div className="border-l h-4 mx-2" />

      <Button variant="ghost" size="icon" onClick={() => format("bold")}>
        <Bold size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => format("italic")}>
        <Italic size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => format("underline")}>
        <Underline size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => format("strikethrough")}>
        <Strikethrough size={16} />
      </Button>

      <div className="border-l h-4 mx-2" />

      <Button variant="ghost" size="icon" onClick={insertLink}>
        <Link size={16} />
      </Button>
      <Button variant="ghost" size="icon">
        <Image size={16} />
      </Button>
      <Button variant="ghost" size="icon">
        <Code size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={insertQuote}>
        <Quote size={16} />
      </Button>

      <div className="border-l h-4 mx-2" />

      <Button variant="ghost" size="icon" onClick={insertUnorderedList}>
        <List size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={insertOrderedList}>
        <ListOrdered size={16} />
      </Button>

      <Button variant="ghost" size="icon" onClick={() => insertHeading(1)}>
        <Heading1 size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => insertHeading(2)}>
        <Heading2 size={16} />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => insertHeading(3)}>
        <Heading3 size={16} />
      </Button>
    </div>
  );
};