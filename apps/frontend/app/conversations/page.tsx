'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Search,
  Filter,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
} from 'lucide-react';

const conversations = [
  {
    id: 1,
    customer: 'John Doe',
    status: 'active',
    lastMessage: 'Hello, I need help with my order',
    time: '2 minutes ago',
    unread: true,
  },
  {
    id: 2,
    customer: 'Jane Smith',
    status: 'pending',
    lastMessage: 'When will my package arrive?',
    time: '15 minutes ago',
    unread: false,
  },
  {
    id: 3,
    customer: 'Mike Johnson',
    status: 'closed',
    lastMessage: 'Thank you for your help!',
    time: '1 hour ago',
    unread: false,
  },
];

const messages = [
  {
    id: 1,
    sender: 'John Doe',
    content: 'Hello, I need help with my order',
    time: '2:30 PM',
    isCustomer: true,
  },
  {
    id: 2,
    sender: 'You',
    content: 'Hi John! How can I help you today?',
    time: '2:31 PM',
    isCustomer: false,
  },
  {
    id: 3,
    sender: 'John Doe',
    content: 'I placed an order yesterday but haven\'t received a confirmation email',
    time: '2:32 PM',
    isCustomer: true,
  },
];

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // TODO: Implement message sending
      setMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <button className="mt-2 flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                selectedConversation === conversation.id
                  ? 'bg-gray-50 dark:bg-gray-800'
                  : ''
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {conversation.customer}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {conversation.time}
                  </span>
                  {conversation.unread && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                John Doe
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active now
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isCustomer ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.isCustomer
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'bg-blue-500 text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isCustomer
                      ? 'text-gray-500 dark:text-gray-400'
                      : 'text-blue-100'
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Smile className="h-5 w-5" />
            </button>
            <button
              type="submit"
              className="p-2 text-blue-500 hover:text-blue-600"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 