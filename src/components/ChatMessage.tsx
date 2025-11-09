import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Check, X } from 'lucide-react';

interface ChatMessageProps {
  message: any;
  isOwnMessage: boolean;
  onDelete: (messageId: string) => void;
  onEdit: (messageId: string, newText: string) => void;
}

export const ChatMessage = ({ message, isOwnMessage, onDelete, onEdit }: ChatMessageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex group ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 relative ${
          isOwnMessage
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Shared"
            className="rounded-lg mb-2 max-w-full h-auto"
          />
        )}
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="h-8"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveEdit}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancelEdit}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <p className="text-sm break-words">{message.text}</p>
        )}

        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-2">
            <p className="text-xs opacity-75">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {message.editedAt && (
              <span className="text-xs opacity-60">(edited)</span>
            )}
            {message.readAt && isOwnMessage && (
              <span className="text-xs opacity-75">✓✓</span>
            )}
          </div>
          
          {isOwnMessage && !isEditing && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={() => onDelete(message.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
