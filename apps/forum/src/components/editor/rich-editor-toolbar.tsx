'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  List,
  ListOrdered,
  Code,
  Code2,
  Quote,
  Link2,
  ImageIcon,
  Undo,
  Redo,
  Minus,
  X,
} from 'lucide-react';
import { cn, Button, Input, Label } from '@createconomy/ui';

interface RichEditorToolbarProps {
  editor: Editor;
  className?: string;
}

/**
 * RichEditorToolbar — Formatting toolbar for the TipTap-based rich text editor.
 * Provides buttons for text formatting, headings, lists, code, links, and images.
 */
export function RichEditorToolbar({ editor, className }: RichEditorToolbarProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const handleInsertLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
      setImageUrl('');
      setImageAlt('');
      setShowImageDialog(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30">
        {/* Undo/Redo */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo className="h-4 w-4" />}
          title="Undo (Ctrl+Z)"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo className="h-4 w-4" />}
          title="Redo (Ctrl+Y)"
        />

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon={<Bold className="h-4 w-4" />}
          title="Bold (Ctrl+B)"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon={<Italic className="h-4 w-4" />}
          title="Italic (Ctrl+I)"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          icon={<Strikethrough className="h-4 w-4" />}
          title="Strikethrough"
        />

        <ToolbarDivider />

        {/* Heading */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 className="h-4 w-4" />}
          title="Heading"
        />

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          icon={<List className="h-4 w-4" />}
          title="Bullet list"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          icon={<ListOrdered className="h-4 w-4" />}
          title="Numbered list"
        />

        <ToolbarDivider />

        {/* Code and quotes */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          icon={<Code className="h-4 w-4" />}
          title="Inline code"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          icon={<Code2 className="h-4 w-4" />}
          title="Code block"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          icon={<Quote className="h-4 w-4" />}
          title="Quote"
        />

        <ToolbarDivider />

        {/* Horizontal rule */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={<Minus className="h-4 w-4" />}
          title="Horizontal rule"
        />

        {/* Links & Images */}
        <ToolbarBtn
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkDialog(true);
            }
          }}
          active={editor.isActive('link')}
          icon={<Link2 className="h-4 w-4" />}
          title="Insert link"
        />
        <ToolbarBtn
          onClick={() => setShowImageDialog(true)}
          icon={<ImageIcon className="h-4 w-4" />}
          title="Insert image"
        />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute left-0 top-full z-20 mt-1 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Insert Link</h4>
            <button
              type="button"
              onClick={() => setShowLinkDialog(false)}
              className="rounded-md p-1 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="rte-link-url" className="text-xs">
                URL
              </Label>
              <Input
                id="rte-link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertLink();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleInsertLink}
                disabled={!linkUrl}
              >
                Insert
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="absolute left-0 top-full z-20 mt-1 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Insert Image</h4>
            <button
              type="button"
              onClick={() => setShowImageDialog(false)}
              className="rounded-md p-1 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="rte-image-url" className="text-xs">
                Image URL
              </Label>
              <Input
                id="rte-image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="rte-image-alt" className="text-xs">
                Alt Text (optional)
              </Label>
              <Input
                id="rte-image-alt"
                type="text"
                placeholder="Image description"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertImage();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowImageDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleInsertImage}
                disabled={!imageUrl}
              >
                Insert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Toolbar button component.
 */
function ToolbarBtn({
  onClick,
  active,
  disabled,
  icon,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        active && 'bg-accent text-accent-foreground',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}

export default RichEditorToolbar;
