'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Bell,
  Lock,
  Globe,
  Palette,
  Save,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const settings = [
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Configure how you receive notifications',
    icon: Bell,
    fields: [
      {
        id: 'email_notifications',
        name: 'Email Notifications',
        description: 'Receive notifications via email',
        type: 'toggle',
      },
      {
        id: 'push_notifications',
        name: 'Push Notifications',
        description: 'Receive push notifications',
        type: 'toggle',
      },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Manage your security settings',
    icon: Lock,
    fields: [
      {
        id: 'two_factor',
        name: 'Two-Factor Authentication',
        description: 'Add an extra layer of security to your account',
        type: 'toggle',
      },
      {
        id: 'password',
        name: 'Change Password',
        description: 'Update your password',
        type: 'button',
      },
    ],
  },
  {
    id: 'appearance',
    name: 'Appearance',
    description: 'Customize the look and feel',
    icon: Palette,
    fields: [
      {
        id: 'theme',
        name: 'Theme',
        description: 'Choose between light and dark mode',
        type: 'select',
        options: ['Light', 'Dark', 'System'],
      },
      {
        id: 'language',
        name: 'Language',
        description: 'Select your preferred language',
        type: 'select',
        options: ['English', 'Spanish', 'Portuguese'],
      },
    ],
  },
];

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    email_notifications: true,
    push_notifications: false,
    two_factor: false,
    theme: 'System',
    language: 'English',
  });

  const handleToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  const handleSelect = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Implement settings save
    console.log('Saving settings:', formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {settings.map((section) => (
          <Card key={section.id} className="p-6">
            <div className="flex items-center space-x-3">
              <section.icon className="h-6 w-6 text-gray-400" />
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {section.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {section.description}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <label
                      htmlFor={field.id}
                      className="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {field.name}
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {field.description}
                    </p>
                  </div>
                  <div>
                    {field.type === 'toggle' && (
                      <button
                        type="button"
                        onClick={() => handleToggle(field.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          formData[field.id as keyof typeof formData]
                            ? 'bg-blue-600'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formData[field.id as keyof typeof formData]
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          }`}
                        />
                      </button>
                    )}
                    {field.type === 'select' && (
                      <select
                        id={field.id}
                        value={formData[field.id as keyof typeof formData] as string}
                        onChange={(e) => handleSelect(field.id, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === 'button' && (
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Change
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Reset to Default
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
} 