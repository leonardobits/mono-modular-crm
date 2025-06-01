'use client';

import { Card } from '@/components/ui/card';
import {
  Users,
  MessageSquare,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

const stats = [
  {
    name: 'Total Users',
    value: '12',
    icon: Users,
    change: '+2',
    changeType: 'positive',
  },
  {
    name: 'Active Conversations',
    value: '8',
    icon: MessageSquare,
    change: '+3',
    changeType: 'positive',
  },
  {
    name: 'Total Calls',
    value: '24',
    icon: Phone,
    change: '+5',
    changeType: 'positive',
  },
  {
    name: 'Success Rate',
    value: '85%',
    icon: CheckCircle,
    change: '+2%',
    changeType: 'positive',
  },
];

const recentConversations = [
  {
    id: 1,
    customer: 'John Doe',
    status: 'active',
    lastMessage: 'Hello, I need help with my order',
    time: '2 minutes ago',
  },
  {
    id: 2,
    customer: 'Jane Smith',
    status: 'pending',
    lastMessage: 'When will my package arrive?',
    time: '15 minutes ago',
  },
  {
    id: 3,
    customer: 'Mike Johnson',
    status: 'closed',
    lastMessage: 'Thank you for your help!',
    time: '1 hour ago',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here's what's happening with your CRM.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                <stat.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p
                  className={`text-sm ${
                    stat.changeType === 'positive'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {stat.change}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Conversations */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Conversations
        </h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {conversation.status === 'active' && (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    {conversation.status === 'pending' && (
                      <Clock className="h-5 w-5 text-blue-500" />
                    )}
                    {conversation.status === 'closed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {conversation.customer}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {conversation.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 