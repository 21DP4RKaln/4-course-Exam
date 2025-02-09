'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function Profile() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('info');

  // Pagaidām izmantojam dummy datus
  const userInfo = {
    name: "John Doe",
    email: "john@example.com",
    joinedDate: "2024-02-08"
  };

  const configurations = [
    { id: 1, name: "Gaming PC", date: "2024-02-01", status: "saved" },
    { id: 2, name: "Work Station", date: "2024-02-05", status: "ordered" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profila augšdaļa */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold">{userInfo.name}</h1>
            <p className="text-gray-600">{userInfo.email}</p>
          </div>
        </div>
      </div>

      {/* Tabi */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('profile.personal_info')}
            </button>
            <button
              onClick={() => setActiveTab('configurations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configurations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('profile.my_configurations')}
            </button>
          </nav>
        </div>
      </div>

      {/* Taba saturs */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'info' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.name')}
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={userInfo.name}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.email')}
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={userInfo.email}
                readOnly
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {configurations.map((config) => (
              <div
                key={config.id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{config.name}</h3>
                    <p className="text-sm text-gray-500">{config.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    config.status === 'ordered' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t(`profile.status.${config.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}