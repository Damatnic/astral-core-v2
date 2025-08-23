import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRealtimeChannel } from '../services/realtimeService';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import './LiveChat.css';

interface Message {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  type?: 'text' | 'system' | 'emoji';
}

interface LiveChatProps {
  roomId: string;
  username: string;
  userId: string;
  title?: string;
  height?: string;
  enableEmojis?: boolean;
  enableTypingIndicator?: boolean;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  roomId,
  username: propUsername, // Renamed to avoid confusion
  userId,
  title = 'Live Chat',
  height = '500px',
  enableEmojis = true,
  enableTypingIndicator = true
}) => {
  // Use the username from props (for display purposes)
  const currentUsername = propUsername;
  const { messages, typingUsers, sendMessage, sendTyping } = useRealtimeChannel(roomId);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Common emojis for quick access
  const quickEmojis = ['😊', '👍', '❤️', '😂', '🎉', '🤗', '😢', '🙏', '💪', '✨'];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping && enableTypingIndicator) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTyping(false);
      }
    }, 2000);
  }, [isTyping, sendTyping, enableTypingIndicator]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    handleTyping();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      await sendMessage(inputValue);
      setInputValue('');
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        sendTyping(false);
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = async (emoji: string) => {
    try {
      await sendMessage(emoji);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to send emoji:', error);
    }
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.userId === userId;
    const messageClass = `message ${isOwnMessage ? 'own-message' : 'other-message'}`;

    // Check if message is just an emoji
    const isEmojiOnly = message.message.length <= 2 && /^\p{Emoji}+$/u.test(message.message);

    return (
      <div key={message.id} className={messageClass}>
        {!isOwnMessage && (
          <div className="message-header">
            <span className="message-username">{message.username}</span>
          </div>
        )}
        <div className={`message-content ${isEmojiOnly ? 'emoji-only' : ''}`}>
          {message.message}
        </div>
        <div className="message-timestamp">
          {formatTimeAgo(new Date(message.timestamp))}
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => {
    const otherTypingUsers = typingUsers.filter(id => id !== userId);
    
    if (otherTypingUsers.length === 0) return null;

    const typingText = otherTypingUsers.length === 1
      ? `${otherTypingUsers[0]} is typing...`
      : otherTypingUsers.length === 2
      ? `${otherTypingUsers[0]} and ${otherTypingUsers[1]} are typing...`
      : `${otherTypingUsers.length} people are typing...`;

    return (
      <div className="typing-indicator">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="typing-text">{typingText}</span>
      </div>
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        sendTyping(false);
      }
    };
  }, [isTyping, sendTyping]);

  return (
    <div className="live-chat-container" style={{ height }}>
      <div className="live-chat-header">
        <h3>{title}</h3>
        <div className="chat-status">
          <span className="status-indicator online"></span>
          <span>{messages.length} messages • {currentUsername}</span>
        </div>
      </div>

      <div className="live-chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        
        {enableTypingIndicator && renderTypingIndicator()}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="live-chat-input-container">
        {enableEmojis && (
          <div className="emoji-picker-container">
            <button
              className="emoji-picker-toggle"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Toggle emoji picker"
            >
              😊
            </button>
            
            {showEmojiPicker && (
              <div className="emoji-picker-popup">
                {quickEmojis.map(emoji => (
                  <button
                    key={emoji}
                    className="emoji-option"
                    onClick={() => handleEmojiClick(emoji)}
                    aria-label={`Send ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          className="live-chat-input"
          placeholder="Type a message..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          aria-label="Chat message input"
        />

        <button
          className="live-chat-send-button"
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="currentColor"
              d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};