'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import type { Editor } from '@tiptap/react';
import { RichEditorToolbar } from './rich-editor-toolbar';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Link2,
  Strikethrough,
  Code,
} from 'lucide-react';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content?: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
}

/**
 * RichTextEditor — TipTap-based WYSIWYG editor with formatting toolbar,
 * bubble menu, code block highlighting, and keyboard shortcuts.
 *
 * Outputs both HTML and plain text (for backward-compatible storage).
 */
export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Write something...',
  className,
  disabled = false,
  minHeight = '200px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Replaced by CodeBlockLowlight
      }),
      Placeholder.configure({ placeholder }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      ImageExtension.configure({
        allowBase64: false,
        HTMLAttributes: { class: 'rounded-lg max-w-full my-2' },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-muted rounded-lg p-4 text-sm font-mono my-2',
        },
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const text = ed.getText();
      onChange(html, text);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none',
          'focus:outline-none p-4',
          'prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2',
          'prose-p:my-1 prose-ul:my-1 prose-ol:my-1',
          'prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm'
        ),
        style: `min-height: ${minHeight}`,
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div
      className={cn(
        'rounded-lg border border-border overflow-hidden',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {/* Toolbar */}
      <RichEditorToolbar editor={editor} />

      {/* Bubble Menu — appears on text selection */}
      <BubbleMenu
        editor={editor}
        className="flex gap-0.5 p-1 bg-card border border-border rounded-lg shadow-lg"
      >
        <BubbleButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon={<Bold className="h-3.5 w-3.5" />}
          title="Bold"
        />
        <BubbleButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon={<Italic className="h-3.5 w-3.5" />}
          title="Italic"
        />
        <BubbleButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          icon={<Strikethrough className="h-3.5 w-3.5" />}
          title="Strikethrough"
        />
        <BubbleButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          icon={<Code className="h-3.5 w-3.5" />}
          title="Code"
        />
        <BubbleButton
          onClick={() => {
            const url = window.prompt('Enter URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          active={editor.isActive('link')}
          icon={<Link2 className="h-3.5 w-3.5" />}
          title="Link"
        />
      </BubbleMenu>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}

/**
 * Small button used in the BubbleMenu.
 */
function BubbleButton({
  onClick,
  active,
  icon,
  title,
}: {
  onClick: () => void;
  active: boolean;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-1.5 rounded transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
      )}
      title={title}
    >
      {icon}
    </button>
  );
}

export default RichTextEditor;
