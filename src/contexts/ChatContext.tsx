import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Message interface
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

// Conversation interface
export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  participantNames: { [key: string]: string }; // Map of user ID to name
  productId?: string;
  productTitle?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  createConversation: (otherUserId: string, otherUserName: string, productId?: string, productTitle?: string) => string;
  sendMessage: (conversationId: string, senderId: string, senderName: string, text: string) => void;
  getConversation: (conversationId: string) => Conversation | undefined;
  getConversationMessages: (conversationId: string) => Message[];
  getUserConversations: (userId: string) => Conversation[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Hook to use chat throughout the app
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

// Provider component
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const storedConversations = localStorage.getItem('conversations');
    const storedMessages = localStorage.getItem('messages');
    
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  // Create a new conversation
  const createConversation = (
    otherUserId: string,
    otherUserName: string,
    productId?: string,
    productTitle?: string
  ) => {
    // Check if conversation already exists
    const existing = conversations.find(conv =>
      conv.participants.includes(otherUserId)
    );

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: Date.now().toString(),
      participants: [otherUserId],
      participantNames: { [otherUserId]: otherUserName },
      productId,
      productTitle,
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));

    return newConversation.id;
  };

  // Send a message
  const sendMessage = (
    conversationId: string,
    senderId: string,
    senderName: string,
    text: string
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));

    // Update conversation's last message
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId
        ? {
            ...conv,
            lastMessage: text,
            lastMessageTime: newMessage.timestamp,
          }
        : conv
    );
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  // Get single conversation
  const getConversation = (conversationId: string) => {
    return conversations.find(conv => conv.id === conversationId);
  };

  // Get all messages for a conversation
  const getConversationMessages = (conversationId: string) => {
    return messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // Get all conversations for a user
  const getUserConversations = (userId: string) => {
    return conversations
      .filter(conv => conv.participants.includes(userId))
      .sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });
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
