import React from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';

function Dashboard() {
  return (
    <div className="w-full h-full">
      <h2 className="text-3xl font-bold mb-6">Welcome to South Webportal</h2>
      <p className="text-xl mb-4 flex items-center gap-2 border border-gray-300 p-4">
       
        <a
          href="https://grafana.sdwn.mwi.i2cat.net/d/eba26b3e-66bf-46bb-8b11-49ae6b1694f2/qosium?from=now-5m&to=now&refresh=1s"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-center"
          title="Open real-time Grafana dashboard"
        >  Real-time measurements (Grafana dashboard)
          <LinkIcon className="w-5 h-5" />
        </a>
      </p>

    </div>
  );
}

export default Dashboard;
