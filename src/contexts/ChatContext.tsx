import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  productId?: string;
  productTitle?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  createConversation: (otherUserId: string, otherUserName: string, productId?: string, productTitle?: string) => Promise<string>;
  sendMessage: (conversationId: string, senderId: string, senderName: string, text: string) => Promise<void>;
  getConversation: (conversationId: string) => Conversation | undefined;
  getConversationMessages: (conversationId: string) => Promise<Message[]>;
  getUserConversations: (userId: string) => Conversation[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        buyer:profiles!conversations_buyer_id_fkey(id, full_name),
        seller:profiles!conversations_seller_id_fkey(id, full_name),
        product:products(id, title)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_time', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    const formatted: Conversation[] = data.map((c: any) => {
      const otherUserId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
      const otherUserName = c.buyer_id === user.id ? c.seller?.full_name : c.buyer?.full_name;
      
      return {
        id: c.id,
        participants: [otherUserId],
        participantNames: { [otherUserId]: otherUserName || 'Unknown' },
        productId: c.product_id,
        productTitle: c.product?.title || 'Unknown Product',
        lastMessage: c.last_message,
        lastMessageTime: c.last_message_time,
      };
    });

    setConversations(formatted);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey(full_name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data.map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: m.profiles?.full_name || 'Unknown',
      text: m.text,
      timestamp: m.created_at,
    }));
  };

  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Set up realtime subscription
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createConversation = async (
    otherUserId: string,
    otherUserName: string,
    productId?: string,
    productTitle?: string
  ): Promise<string> => {
    if (!user) throw new Error('Must be logged in');

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', otherUserId)
      .eq('product_id', productId || '')
      .maybeSingle();

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        buyer_id: user.id,
        seller_id: otherUserId,
        product_id: productId,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchConversations();
    return data.id;
  };

  const sendMessage = async (
    conversationId: string,
    senderId: string,
    senderName: string,
    text: string
  ) => {
    if (!user) throw new Error('Must be logged in');

    const { error: messageError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text,
    });

    if (messageError) throw messageError;

    // Update conversation's last message
    const { error: convError } = await supabase
      .from('conversations')
      .update({
        last_message: text,
        last_message_time: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (convError) throw convError;
    await fetchConversations();
  };

  const getConversation = (conversationId: string) => {
    return conversations.find(conv => conv.id === conversationId);
  };

  const getConversationMessages = async (conversationId: string) => {
    const msgs = await fetchMessages(conversationId);
    setMessages(prev => {
      const filtered = prev.filter(m => m.conversationId !== conversationId);
      return [...filtered, ...msgs];
    });
    return msgs;
  };

  const getUserConversations = (userId: string) => {
    return conversations;
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        createConversation,
        sendMessage,
        getConversation,
        getConversationMessages,
        getUserConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
