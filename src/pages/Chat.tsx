import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

// Chat page - messaging between buyers and sellers
const Chat = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { getUserConversations, getConversation, getConversationMessages, sendMessage } = useChat();
  
  // Get conversation ID from URL or select first conversation
  const conversationIdFromUrl = searchParams.get('conversation');
  const userConversations = user ? getUserConversations(user.id) : [];
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversationIdFromUrl || (userConversations[0]?.id || null)
  );

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current conversation
  const currentConversation = selectedConversationId ? getConversation(selectedConversationId) : null;

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      getConversationMessages(selectedConversationId).then(msgs => {
        setMessages(msgs);
      });
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !user || !selectedConversationId) {
      return;
    }

    try {
      await sendMessage(selectedConversationId, user.id, user.name, messageText.trim());
      setMessageText('');
      // Refresh messages
      const msgs = await getConversationMessages(selectedConversationId);
      setMessages(msgs);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  // Get the other person's name in the conversation
  const getOtherPersonName = (conversation: any) => {
    const otherUserId = conversation.participants[0];
    return conversation.participantNames[otherUserId] || 'Unknown User';
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
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderId === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm break-words">{message.text}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-5 w-5" />
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
    </div>
  );
};

export default Chat;
