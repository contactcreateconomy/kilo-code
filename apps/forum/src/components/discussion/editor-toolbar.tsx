'use client';

import { useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Superscript,
  Heading,
  Link2,
  Image,
  Video,
  List,
  ListOrdered,
  Code,
  Quote,
  Code2,
  Table,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { cn, Button, Input, Label } from '@createconomy/ui';

interface EditorToolbarProps {
  onInsertText: (before: string, after: string) => void;
  onInsertLink: (url: string, text: string) => void;
  onInsertImage: (url: string, alt: string) => void;
  className?: string;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

function ToolbarButton({ icon, label, onClick, active }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        active && 'bg-accent text-accent-foreground'
      )}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}

/**
 * EditorToolbar - Rich text editor toolbar with formatting options
 * Includes image and link insertion functionality
 */
export function EditorToolbar({
  onInsertText,
  onInsertLink,
  onInsertImage,
  className,
}: EditorToolbarProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const handleInsertLink = () => {
    if (linkUrl) {
      onInsertLink(linkUrl, linkText || linkUrl);
      setLinkUrl('');
      setLinkText('');
      setShowLinkModal(false);
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      onInsertImage(imageUrl, imageAlt || 'Image');
      setImageUrl('');
      setImageAlt('');
      setShowImageModal(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-border bg-muted/50 p-2">
        {/* Text Formatting */}
        <ToolbarButton
          icon={<Bold className="h-4 w-4" />}
          label="Bold"
          onClick={() => onInsertText('**', '**')}
        />
        <ToolbarButton
          icon={<Italic className="h-4 w-4" />}
          label="Italic"
          onClick={() => onInsertText('*', '*')}
        />
        <ToolbarButton
          icon={<Strikethrough className="h-4 w-4" />}
          label="Strikethrough"
          onClick={() => onInsertText('~~', '~~')}
        />
        <ToolbarButton
          icon={<Superscript className="h-4 w-4" />}
          label="Superscript"
          onClick={() => onInsertText('<sup>', '</sup>')}
        />
        <ToolbarButton
          icon={<Heading className="h-4 w-4" />}
          label="Heading"
          onClick={() => onInsertText('## ', '')}
        />

        <ToolbarDivider />

        {/* Links and Media */}
        <ToolbarButton
          icon={<Link2 className="h-4 w-4" />}
          label="Insert Link"
          onClick={() => setShowLinkModal(true)}
          active={showLinkModal}
        />
        <ToolbarButton
          icon={<Image className="h-4 w-4" />}
          label="Insert Image"
          onClick={() => setShowImageModal(true)}
          active={showImageModal}
        />
        <ToolbarButton
          icon={<Video className="h-4 w-4" />}
          label="Insert Video"
          onClick={() => onInsertText('![Video](', ')')}
        />

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          icon={<List className="h-4 w-4" />}
          label="Bullet List"
          onClick={() => onInsertText('- ', '')}
        />
        <ToolbarButton
          icon={<ListOrdered className="h-4 w-4" />}
          label="Numbered List"
          onClick={() => onInsertText('1. ', '')}
        />

        <ToolbarDivider />

        {/* Code and Quotes */}
        <ToolbarButton
          icon={<Code className="h-4 w-4" />}
          label="Code Block"
          onClick={() => onInsertText('```\n', '\n```')}
        />
        <ToolbarButton
          icon={<Quote className="h-4 w-4" />}
          label="Quote"
          onClick={() => onInsertText('> ', '')}
        />
        <ToolbarButton
          icon={<Code2 className="h-4 w-4" />}
          label="Inline Code"
          onClick={() => onInsertText('`', '`')}
        />

        <ToolbarDivider />

        {/* Advanced */}
        <ToolbarButton
          icon={<Table className="h-4 w-4" />}
          label="Table"
          onClick={() => onInsertText('| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |', '')}
        />
        <ToolbarButton
          icon={<MoreHorizontal className="h-4 w-4" />}
          label="More Options"
          onClick={() => {}}
        />
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="absolute left-0 top-full z-10 mt-1 w-80 rounded-lg border border-border bg-card p-4 shadow-lg animate-fade-in">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Insert Link</h4>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="rounded-md p-1 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="link-url" className="text-xs">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="link-text" className="text-xs">Text (optional)</Label>
              <Input
                id="link-text"
                type="text"
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkModal(false)}
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

      {/* Image Modal */}
      {showImageModal && (
        <div className="absolute left-0 top-full z-10 mt-1 w-80 rounded-lg border border-border bg-card p-4 shadow-lg animate-fade-in">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Insert Image</h4>
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="rounded-md p-1 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="image-url" className="text-xs">Image URL</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="image-alt" className="text-xs">Alt Text (optional)</Label>
              <Input
                id="image-alt"
                type="text"
                placeholder="Image description"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowImageModal(false)}
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

export default EditorToolbar;
