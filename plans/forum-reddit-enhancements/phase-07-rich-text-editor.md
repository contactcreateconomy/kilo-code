# Phase 07 — Rich Text Editor Upgrade

> **Priority:** 🟡 Medium  
> **Depends on:** Phase 03 (Post Types for image upload integration)  
> **Enables:** Better content quality, easier formatting, @mention support

## Problem

The current editor at `apps/forum/src/components/discussion/discussion-form.tsx` uses a plain `<textarea>` with a markdown toolbar. Users must:
- Write raw markdown syntax
- No live preview
- No drag-and-drop images
- No @mention autocomplete
- No code syntax highlighting in preview

## Goal

Replace the plain textarea with a TipTap-based WYSIWYG editor that supports rich formatting, live preview, drag-drop images, and @mentions.

---

## Technology Choice: TipTap

**Why TipTap:**
- Built on ProseMirror (battle-tested)
- Headless (full styling control)
- Extension system for @mentions, images, code blocks
- React integration
- Markdown import/export
- MIT licensed

**Alternatives considered:**
- **Milkdown** — Good but less mature
- **Slate** — Lower level, more custom work
- **Lexical (Meta)** — Still evolving, more complex

---

## Package Installation

```bash
cd apps/forum
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-mention @tiptap/extension-image @tiptap/extension-link @tiptap/extension-code-block-lowlight lowlight @tiptap/pm
```

---

## Component Architecture

```
apps/forum/src/components/editor/
├── index.ts                    # Exports
├── rich-text-editor.tsx        # Main editor component
├── editor-toolbar.tsx          # Updated toolbar (migrated from discussion/)
├── extensions/
│   ├── mention-extension.ts    # @mention autocomplete
│   └── image-extension.ts      # Drag-drop image handling
├── menus/
│   ├── bubble-menu.tsx         # Selection-based formatting
│   ├── floating-menu.tsx       # New line commands
│   └── mention-list.tsx        # User suggestion dropdown
└── preview-pane.tsx            # Optional split preview
```

---

## Main Editor Component

### `apps/forum/src/components/editor/rich-text-editor.tsx`

```typescript
'use client';

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import { MentionExtension } from './extensions/mention-extension';
import { EditorToolbar } from './editor-toolbar';
import { MentionList } from './menus/mention-list';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content?: string;
  onChange: (html: string, markdown: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>; // Returns URL
  disabled?: boolean;
}

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Write something...',
  className,
  onImageUpload,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Use CodeBlockLowlight instead
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: 'rounded-lg max-w-full' },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: { class: 'bg-muted rounded-lg p-4' },
      }),
      MentionExtension.configure({
        suggestion: {
          items: ({ query }) => searchUsers(query),
          render: () => createMentionRenderer(),
        },
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html); // Convert for storage
      onChange(html, markdown);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none',
          'focus:outline-none min-h-[200px] p-4'
        ),
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && onImageUpload && event.dataTransfer?.files.length) {
          const images = Array.from(event.dataTransfer.files).filter(f => 
            f.type.startsWith('image/')
          );
          if (images.length) {
            event.preventDefault();
            handleImageDrop(images, onImageUpload, editor);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (onImageUpload && event.clipboardData?.files.length) {
          const images = Array.from(event.clipboardData.files).filter(f =>
            f.type.startsWith('image/')
          );
          if (images.length) {
            event.preventDefault();
            handleImageDrop(images, onImageUpload, editor);
            return true;
          }
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  return (
    <div className={cn('rounded-lg border border-border', className)}>
      {/* Toolbar */}
      <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
      
      {/* Bubble Menu for selection */}
      <BubbleMenu editor={editor} className="flex gap-1 p-1 bg-card border rounded-lg shadow-lg">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon={<Bold className="h-4 w-4" />}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon={<Italic className="h-4 w-4" />}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleLink({ href: '' }).run()}
          active={editor.isActive('link')}
          icon={<Link2 className="h-4 w-4" />}
        />
      </BubbleMenu>
      
      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}

async function handleImageDrop(
  files: File[],
  onUpload: (file: File) => Promise<string>,
  editor: Editor
) {
  for (const file of files) {
    const url = await onUpload(file);
    editor.chain().focus().setImage({ src: url }).run();
  }
}
```

---

## @Mention Extension

### `apps/forum/src/components/editor/extensions/mention-extension.ts`

```typescript
import { Mention } from '@tiptap/extension-mention';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { MentionList } from '../menus/mention-list';

export const MentionExtension = Mention.extend({
  name: 'mention',
}).configure({
  HTMLAttributes: {
    class: 'mention text-primary font-medium',
  },
  renderLabel({ node }) {
    return `@${node.attrs.label}`;
  },
});

export function createMentionRenderer() {
  let component: ReactRenderer | null = null;
  let popup: any = null;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(MentionList, {
        props,
        editor: props.editor,
      });

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },

    onUpdate(props: any) {
      component?.updateProps(props);
      popup[0].setProps({ getReferenceClientRect: props.clientRect });
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup[0].hide();
        return true;
      }
      return component?.ref?.onKeyDown(props);
    },

    onExit() {
      popup[0].destroy();
      component?.destroy();
    },
  };
}
```

### `apps/forum/src/components/editor/menus/mention-list.tsx`

```typescript
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@createconomy/ui';

interface MentionListProps {
  items: Array<{ id: string; name: string; username: string; avatarUrl?: string }>;
  command: (item: any) => void;
}

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.username });
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (!props.items.length) {
    return <div className="p-2 text-sm text-muted-foreground">No users found</div>;
  }

  return (
    <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
      {props.items.map((item, index) => (
        <button
          key={item.id}
          onClick={() => selectItem(index)}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 text-left',
            index === selectedIndex && 'bg-accent'
          )}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={item.avatarUrl} />
            <AvatarFallback>{item.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">@{item.username}</p>
          </div>
        </button>
      ))}
    </div>
  );
});

MentionList.displayName = 'MentionList';
```

---

## Updated Toolbar

### `apps/forum/src/components/editor/editor-toolbar.tsx`

```typescript
interface EditorToolbarProps {
  editor: Editor;
  onImageUpload?: (file: File) => Promise<string>;
}

export function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        icon={<Bold className="h-4 w-4" />}
        tooltip="Bold (Ctrl+B)"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        icon={<Italic className="h-4 w-4" />}
        tooltip="Italic (Ctrl+I)"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        icon={<Strikethrough className="h-4 w-4" />}
        tooltip="Strikethrough"
      />
      
      <Divider />
      
      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        icon={<Heading2 className="h-4 w-4" />}
        tooltip="Heading"
      />
      
      <Divider />
      
      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        icon={<List className="h-4 w-4" />}
        tooltip="Bullet list"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        icon={<ListOrdered className="h-4 w-4" />}
        tooltip="Numbered list"
      />
      
      <Divider />
      
      {/* Code */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        icon={<Code className="h-4 w-4" />}
        tooltip="Inline code"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        icon={<Code2 className="h-4 w-4" />}
        tooltip="Code block"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        icon={<Quote className="h-4 w-4" />}
        tooltip="Quote"
      />
      
      <Divider />
      
      {/* Media */}
      <ToolbarButton
        onClick={() => setShowLinkDialog(true)}
        icon={<Link2 className="h-4 w-4" />}
        tooltip="Insert link"
      />
      {onImageUpload && (
        <>
          <ToolbarButton
            onClick={() => imageInputRef.current?.click()}
            icon={<Image className="h-4 w-4" />}
            tooltip="Upload image"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </>
      )}
      
      {/* Link dialog */}
      <LinkDialog 
        open={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onSubmit={(url) => {
          editor.chain().focus().setLink({ href: url }).run();
          setShowLinkDialog(false);
        }}
      />
    </div>
  );
}
```

---

## Backend Support

### User search for @mentions

```typescript
// packages/convex/convex/functions/users.ts
export const searchUsers = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    
    const profiles = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("isBanned"), false))
      .take(100);
    
    // Simple text matching (could use full-text search)
    const matches = profiles.filter(p => 
      p.username?.toLowerCase().includes(args.query.toLowerCase()) ||
      p.displayName?.toLowerCase().includes(args.query.toLowerCase())
    ).slice(0, limit);
    
    return matches.map(p => ({
      id: p.userId,
      name: p.displayName ?? 'Anonymous',
      username: p.username ?? p.userId,
      avatarUrl: p.avatarUrl ?? null,
    }));
  },
});
```

---

## Integration

### Update `discussion-form.tsx`

```typescript
import { RichTextEditor } from '@/components/editor';
import { useImageUpload } from '@/hooks/use-image-upload';

export function DiscussionForm() {
  const [body, setBody] = useState('');
  const [bodyMarkdown, setBodyMarkdown] = useState('');
  const { uploadImage } = useImageUpload();

  const handleEditorChange = (html: string, markdown: string) => {
    setBody(html);
    setBodyMarkdown(markdown);
  };

  const handleSubmit = async () => {
    await createThread({
      title,
      content: bodyMarkdown, // Store markdown in DB
      categoryId,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title, community selector, etc. */}
      
      <RichTextEditor
        content={body}
        onChange={handleEditorChange}
        placeholder="What's on your mind?"
        onImageUpload={uploadImage}
      />
      
      <Button type="submit">Post</Button>
    </form>
  );
}
```

---

## Implementation Checklist

- [ ] Install TipTap packages
- [ ] Create `RichTextEditor` component
- [ ] Create updated `EditorToolbar` component
- [ ] Implement `MentionExtension` for @mentions
- [ ] Create `MentionList` suggestion component
- [ ] Add drag-and-drop image handling
- [ ] Add paste image handling
- [ ] Create `LinkDialog` component
- [ ] Add code block syntax highlighting with lowlight
- [ ] Create `BubbleMenu` for selection formatting
- [ ] Implement `htmlToMarkdown` conversion utility
- [ ] Create `searchUsers` query for mentions
- [ ] Create `useImageUpload` hook (from Phase 03)
- [ ] Update `DiscussionForm` to use new editor
- [ ] Update comment reply forms to use new editor
- [ ] Style editor content with Tailwind typography
- [ ] Test keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
- [ ] Test @mention autocomplete
- [ ] Test drag-and-drop image upload
- [ ] Test paste image upload
- [ ] Ensure accessibility (keyboard navigation)
