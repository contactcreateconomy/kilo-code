'use client';

import { useState } from 'react';
import { Button, Input } from '@createconomy/ui';
import { Loader2, Trash2, Save } from 'lucide-react';
import { useMyFlair } from '@/hooks/use-flairs';

/**
 * User Flair Customization Page
 *
 * Allows users to set their own display flair (text + optional emoji).
 * Accessible from /account/flair.
 */
export default function UserFlairPage() {
  const { flair: myFlair, setFlair, removeFlair } = useMyFlair();

  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize form from existing flair
  const initialized = myFlair !== undefined;
  if (initialized && text === '' && myFlair) {
    const flairText = (myFlair as Record<string, unknown>)['text'] as string | undefined;
    const flairEmoji = (myFlair as Record<string, unknown>)['emoji'] as string | undefined;
    if (flairText) {
      setText(flairText);
      setEmoji(flairEmoji ?? '');
    }
  }

  const handleSave = async () => {
    if (!text.trim()) {
      setMessage({ type: 'error', text: 'Flair text cannot be empty' });
      return;
    }
    if (text.trim().length > 30) {
      setMessage({ type: 'error', text: 'Flair text must be 30 characters or less' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await setFlair(text.trim(), emoji.trim() || undefined);
      setMessage({ type: 'success', text: 'Flair updated successfully!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save flair',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    setMessage(null);
    try {
      await removeFlair();
      setText('');
      setEmoji('');
      setMessage({ type: 'success', text: 'Flair removed' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to remove flair',
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">User Flair</h1>
      <p className="text-muted-foreground mb-6">
        Customize the flair that appears next to your username in discussions.
      </p>

      {!initialized ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          {(text.trim() || myFlair?.text) && (
            <div className="bg-card rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-2">Preview</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">YourUsername</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {emoji.trim() && <span>{emoji.trim()}</span>}
                  {text.trim() || myFlair?.text}
                </span>
              </div>
            </div>
          )}

          {/* Flair Text */}
          <div>
            <label htmlFor="flair-text" className="block text-sm font-medium mb-1">
              Flair Text
            </label>
            <Input
              id="flair-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Early Adopter, Design Enthusiast"
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {text.length}/30 characters
            </p>
          </div>

          {/* Emoji */}
          <div>
            <label htmlFor="flair-emoji" className="block text-sm font-medium mb-1">
              Emoji (optional)
            </label>
            <Input
              id="flair-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="e.g. 🎨 or 🚀"
              maxLength={4}
              className="w-24"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving || !text.trim()}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Flair
            </Button>
            {myFlair && (
              <Button variant="outline" onClick={handleRemove} disabled={removing}>
                {removing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Remove Flair
              </Button>
            )}
          </div>

          {/* Message */}
          {message && (
            <p
              className={`text-sm ${
                message.type === 'success' ? 'text-green-600' : 'text-destructive'
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
