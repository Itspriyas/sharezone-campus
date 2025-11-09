import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import Navigation from '@/components/Navigation';
import { ChatMessage } from '@/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageCircle, Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Chat page - messaging between buyers and sellers
const Chat = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    getUserConversations,
    getConversation,
    getConversationMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    setTyping,
  } = useChat();
  
  const conversationIdFromUrl = searchParams.get('conversation');
  const userConversations = user ? getUserConversations(user.id) : [];
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversationIdFromUrl || (userConversations[0]?.id || null)
  );

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<{ id: string; conversationId: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current conversation
  const currentConversation = selectedConversationId ? getConversation(selectedConversationId) : null;

  // Fetch messages and set up realtime
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    getConversationMessages(selectedConversationId).then(msgs => {
      setMessages(msgs);
      
      // Mark unread messages as read
      msgs.forEach(msg => {
        if (!msg.readAt && msg.senderId !== user?.id) {
          markAsRead(msg.id);
        }
      });
    });

    // Realtime subscription for messages
    const channel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        () => {
          getConversationMessages(selectedConversationId).then(setMessages);
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state)
          .flat()
          .filter((presence: any) => presence.user_id !== user?.id)
          .map((presence: any) => presence.user_name);
        setTypingUsers(users);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, user?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `chat-images/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('chat-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!messageText.trim() && !selectedImage) || !user || !selectedConversationId) {
      return;
    }

    try {
      setUploading(true);
      let imageUrl: string | undefined;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      await sendMessage(
        selectedConversationId,
        user.id,
        user.name,
        messageText.trim() || '📷 Image',
        imageUrl
      );
      
      setMessageText('');
      setSelectedImage(null);
      setImagePreview(null);
      setTyping(selectedConversationId, false);
      
      const msgs = await getConversationMessages(selectedConversationId);
      setMessages(msgs);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setUploading(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);
    
    if (!selectedConversationId) return;

    setTyping(selectedConversationId, text.length > 0);

    if (typingTimeout) clearTimeout(typingTimeout);
    
    const timeout = setTimeout(() => {
      setTyping(selectedConversationId, false);
    }, 3000);
    
    setTypingTimeout(timeout);
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    try {
      await editMessage(messageId, newText);
      const msgs = await getConversationMessages(selectedConversationId!);
      setMessages(msgs);
      toast.success('Message updated');
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  // Get the other person's name in the conversation
  const getOtherPersonName = (conversation: any) => {
    const otherUserId = conversation.participants[0];
    return conversation.participantNames[otherUserId] || 'Unknown User';
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedConversationId) return;
    setMessageToDelete({ id: messageId, conversationId: selectedConversationId });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      await deleteMessage(messageToDelete.id, messageToDelete.conversationId);
      const msgs = await getConversationMessages(messageToDelete.conversationId);
      setMessages(msgs);
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-5rem)]">
        <div className="grid lg:grid-cols-4 gap-6 h-full">
          {/* Conversations list */}
          <Card className="lg:col-span-1 p-4 animate-fade-in">
            <h2 className="font-display font-semibold text-lg mb-4">Messages</h2>
            
            <ScrollArea className="h-[calc(100%-3rem)]">
              {userConversations.length > 0 ? (
                <div className="space-y-2">
                  {userConversations.map(conversation => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedConversationId === conversation.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium truncate">
                        {getOtherPersonName(conversation)}
                      </div>
                      {conversation.productTitle && (
                        <div className="text-xs opacity-75 truncate">
                          {conversation.productTitle}
                        </div>
                      )}
                      {conversation.lastMessage && (
                        <div className="text-xs opacity-75 truncate mt-1">
                          {conversation.lastMessage}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat window */}
          <Card className="lg:col-span-3 flex flex-col animate-fade-in">
            {currentConversation ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b">
                  <h2 className="font-display font-semibold text-lg">
                    {getOtherPersonName(currentConversation)}
                  </h2>
                  {currentConversation.productTitle && (
                    <p className="text-sm text-muted-foreground">
                      About: {currentConversation.productTitle}
                    </p>
                  )}
                </div>

                {/* Messages area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(message => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isOwnMessage={message.senderId === user?.id}
                        onDelete={handleDeleteMessage}
                        onEdit={handleEditMessage}
                      />
                    ))}
                    {typingUsers.length > 0 && (
                      <div className="text-sm text-muted-foreground italic">
                        {typingUsers[0]} is typing...
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message input */}
                <div className="p-4 border-t space-y-2">
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Image className="h-5 w-5" />
                    </Button>
                    <Input
                      value={messageText}
                      onChange={(e) => handleTyping(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={uploading}
                    />
                    <Button type="submit" size="icon" disabled={uploading}>
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMessage}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chat;
