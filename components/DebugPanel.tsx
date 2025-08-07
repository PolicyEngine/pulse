'use client';

import { useState, useEffect } from 'react';

export default function DebugPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in production
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      setIsVisible(true);
      
      // Override console methods to capture logs
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      const addLog = (type: string, ...args: any[]) => {
        const message = `[${type}] ${args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}`;
        setLogs(prev => [...prev.slice(-19), message]);
        
        // Call original console method
        if (type === 'LOG') originalLog(...args);
        if (type === 'ERROR') originalError(...args);
        if (type === 'WARN') originalWarn(...args);
      };

      console.log = (...args) => addLog('LOG', ...args);
      console.error = (...args) => addLog('ERROR', ...args);
      console.warn = (...args) => addLog('WARN', ...args);

      // Initial debug info
      console.log('Debug panel active');
      console.log('URL:', window.location.href);
      console.log('Supabase loaded:', typeof window !== 'undefined' && 'supabase' in window);
      
      return () => {
        // Restore original console methods
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-64 bg-black text-green-400 p-4 rounded-lg shadow-lg overflow-y-auto font-mono text-xs z-50">
      <div className="mb-2 text-yellow-400">🔍 Debug Console</div>
      {logs.length === 0 ? (
        <div className="text-gray-400">No logs yet...</div>
      ) : (
        logs.map((log, i) => (
          <div key={i} className="mb-1 whitespace-pre-wrap break-all">
            {log}
          </div>
        ))
      )}
    </div>
  );
}