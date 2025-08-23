import React, { useState, useEffect, useRef } from 'react';
import { SparkleIcon, SendIcon, HeartIcon, AlertIcon } from '../components/icons.dynamic';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCrisisDetected, setIsCrisisDetected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        id: '1',
        text: "Hi there! I'm your AI companion. I'm here to listen, provide support, and help you explore your thoughts and feelings. How are you doing today?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simple crisis detection (in real app, this would be more sophisticated)
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'hopeless'];
    const containsCrisisKeywords = crisisKeywords.some(keyword => 
      inputText.toLowerCase().includes(keyword)
    );

    if (containsCrisisKeywords) {
      setIsCrisisDetected(true);
    }

    // Simulate AI response (in real app, this would call an AI service)
    setTimeout(() => {
      let aiResponse = '';
      
      if (containsCrisisKeywords) {
        aiResponse = "I'm really concerned about what you've shared. It sounds like you're going through an incredibly difficult time. Please know that you don't have to face this alone. Would you like me to connect you with a crisis counselor who can provide immediate support? You can also call 988 for the Suicide & Crisis Lifeline.";
      } else if (inputText.toLowerCase().includes('anxious') || inputText.toLowerCase().includes('anxiety')) {
        aiResponse = "I hear that you're feeling anxious. That's a very common experience, and it's brave of you to acknowledge it. Can you tell me more about what's been triggering your anxiety? Sometimes talking through specific situations can help us understand them better.";
      } else if (inputText.toLowerCase().includes('sad') || inputText.toLowerCase().includes('depressed')) {
        aiResponse = "Thank you for sharing that with me. Feeling sad is a natural human emotion, though I know it can be very difficult to experience. What's been on your mind lately? Sometimes it helps to explore what might be contributing to these feelings.";
      } else if (inputText.toLowerCase().includes('stress')) {
        aiResponse = "Stress can be really overwhelming. It sounds like you have a lot on your plate right now. What's been the most challenging part of your day? Let's break it down together and see if we can find some ways to manage it.";
      } else {
        aiResponse = "I appreciate you sharing that with me. It's important to express your thoughts and feelings. Can you tell me more about what's been on your mind? I'm here to listen and support you.";
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="container mx-auto flex items-center space-x-3">
          <SparkleIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              AI Mental Health Companion
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A safe space to explore your thoughts and feelings
            </p>
          </div>
        </div>
      </div>

      {/* Crisis Warning */}
      {isCrisisDetected && (
        <div className="bg-red-100 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-4">
          <div className="container mx-auto flex items-center space-x-3">
            <AlertIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                Crisis Support Available
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm">
                If you're having thoughts of self-harm, please reach out for immediate help: 988 Suicide & Crisis Lifeline
              </p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Get Help Now
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg flex space-x-3 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-purple-600 text-white'
                }`}>
                  {message.sender === 'user' ? (
                    <span className="text-sm font-semibold">You</span>
                  ) : (
                    <SparkleIcon className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' 
                      ? 'text-blue-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md xl:max-w-lg flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                  <SparkleIcon className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
                disabled={isTyping}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="self-end p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            This AI companion is for support only. In crisis situations, please contact emergency services or call 988.
          </p>
        </div>
      </div>

      {/* Supportive Resources */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <button className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <HeartIcon className="w-4 h-4" />
              <span>Breathing Exercise</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <SparkleIcon className="w-4 h-4" />
              <span>Guided Meditation</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <AlertIcon className="w-4 h-4" />
              <span>Crisis Resources</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantView;
