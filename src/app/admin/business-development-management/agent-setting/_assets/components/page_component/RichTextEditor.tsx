'use client';

import { useEffect } from "react";
import {
  $getRoot,
  EditorState,
  $insertNodes,
} from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { Toolbar } from "./Toolbar";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import {
  HeadingNode,
  QuoteNode
} from "@lexical/rich-text";
import {
  ListNode,
  ListItemNode
} from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";

interface RichTextEditorProps {
  onSave?: (html: string) => void;
  agreementType: 'INTERNAL' | 'EXTERNAL';
  initialHtml?: string;
  templateType: 'INTERNAL' | 'EXTERNAL';
}

const theme = {
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
  },
  paragraph: "mb-2",
};

function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.focus();
  }, [editor]);

  return null;
}

function InitialContentPlugin({ initialHtml }: { initialHtml?: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialHtml) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialHtml, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().clear();
        $insertNodes(nodes);
      });
    }
  }, [editor, initialHtml]);

  return null;
}

function MyOnChangePlugin({ onSave }: { onSave?: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();

  function handleChange(editorState: EditorState) {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor);
      if (onSave) {
        onSave(html);
      }
    });
  }

  return <OnChangePlugin onChange={handleChange} />;
}

function onError(error: Error) {
  console.error("Lexical Error:", error);
}

export function RichTextEditor({
  onSave,
  agreementType,
  initialHtml,
  templateType,
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border rounded-md p-4 space-y-2 relative">
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[120px] max-h-[300px] overflow-y-auto outline-none" />
          }
          // placeholder={
          //   <div className="text-gray-400 absolute pointer-events-none">
          //     Enter your {templateType.toLowerCase()} agreement content...
          //   </div>
          // }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {initialHtml && <InitialContentPlugin initialHtml={initialHtml} />}
        <MyOnChangePlugin onSave={onSave} />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        {/* <MyCustomAutoFocusPlugin /> */}
      </div>
    </LexicalComposer>
  );
}
