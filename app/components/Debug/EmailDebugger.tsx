import React, { useState } from 'react';

interface DebugLog {
  timestamp: string;
  logs: string[];
  success: boolean;
  error?: string;
}

const EmailDebugger: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const addLog = (logData: DebugLog) => {
    setLogs(prev => [logData, ...prev]);
  };

  const testEmailConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/email-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'config' }),
      });

      const result = await response.json();
      addLog({
        timestamp: new Date().toISOString(),
        logs: result.logs || [],
        success: result.success,
        error: result.error,
      });
    } catch (error) {
      addLog({
        timestamp: new Date().toISOString(),
        logs: [
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      alert('Lūdzu ievadiet e-pasta adresi');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/email-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', testEmail }),
      });

      const result = await response.json();
      addLog({
        timestamp: new Date().toISOString(),
        logs: result.logs || [],
        success: result.success,
        error: result.error,
      });

      if (result.success) {
        alert('Testa e-pasts nosūtīts! Pārbaudiet savu pasta kasti.');
      } else {
        alert(`E-pasta nosūtīšana neizdevās: ${result.error}`);
      }
    } catch (error) {
      addLog({
        timestamp: new Date().toISOString(),
        logs: [
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        📧 E-pasta sistēmas diagnostika
      </h2>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-4">
          <button
            onClick={testEmailConfig}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Pārbauda...' : 'Pārbaudīt e-pasta konfigurāciju'}
          </button>

          <div className="flex space-x-2">
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="jūsu.epasts@gmail.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendTestEmail}
              disabled={isLoading || !testEmail}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              Nosūtīt testu
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Notīrīt logus
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Problēmu diagnostika:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Pārbaudiet Gmail app password</li>
              <li>Pārbaudiet hostera SMTP ierobežojumus</li>
              <li>Pārbaudiet spam mapi</li>
              <li>Pārbaudiet firewall iestatījumus</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Diagnostikas logi ({logs.length})
        </h3>

        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Nav diagnostikas datu. Noklikšķiniet uz pogas, lai sāktu testēšanu.
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                log.success
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    log.success
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}
                >
                  {log.success ? '✅ Veiksmīgi' : '❌ Kļūda'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              {log.error && (
                <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-800 dark:text-red-200 text-sm">
                  <strong>Kļūda:</strong> {log.error}
                </div>
              )}

              <div className="space-y-1">
                {log.logs.map((logLine, logIndex) => (
                  <div
                    key={logIndex}
                    className="text-sm font-mono text-gray-700 dark:text-gray-300"
                  >
                    {logLine}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Troubleshooting Tips */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          🔧 Problēmu risinājumi
        </h4>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
          <p>
            <strong>Ja e-pasti netiek nosūtīti:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Pārbaudiet Gmail "App Password" - iespējams ir beidzies termiņš
            </li>
            <li>Pārbaudiet .env failu - SMTP_PASS ir pareizi iestatīts</li>
            <li>Pārbaudiet hostera iestatījumus - daži bloķē SMTP</li>
            <li>Mēģiniet alternatīvu SMTP serveri (SendGrid, Mailgun)</li>
          </ul>

          <p>
            <strong>Ja e-pasti nonāk spam mapē:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Pievienojiet SPF ierakstu DNS</li>
            <li>Pievienojiet DKIM parakstu</li>
            <li>Izmantojiet verificētu domēnu</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailDebugger;
