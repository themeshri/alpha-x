'use client';

import { useQuery } from '@tanstack/react-query';

interface JobStatus {
  scrape: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  analyze: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  isProcessing: boolean;
  status: 'processing' | 'idle';
}

async function fetchJobStatus() {
  const res = await fetch('/api/jobs/status');
  if (!res.ok) throw new Error('Failed to fetch job status');
  return res.json();
}

export function JobProgress() {
  const { data } = useQuery<JobStatus>({
    queryKey: ['job-status'],
    queryFn: fetchJobStatus,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  if (!data || !data.isProcessing) {
    return null;
  }

  const totalScraping = data.scrape.waiting + data.scrape.active;
  const totalAnalyzing = data.analyze.waiting + data.analyze.active;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-50">
      <div className="flex items-start gap-3">
        {/* Animated spinner */}
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">Processing Jobs</h3>

          {/* Scraping Progress */}
          {totalScraping > 0 && (
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Scraping</span>
                <span className="text-gray-900 font-medium">
                  {data.scrape.active} active, {data.scrape.waiting} waiting
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          )}

          {/* Analysis Progress */}
          {totalAnalyzing > 0 && (
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Analyzing</span>
                <span className="text-gray-900 font-medium">
                  {data.analyze.active} active, {data.analyze.waiting} waiting
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          )}

          {/* Completed/Failed Summary */}
          <div className="flex gap-4 text-xs text-gray-500 mt-2">
            <span>✓ {data.scrape.completed + data.analyze.completed} completed</span>
            {(data.scrape.failed + data.analyze.failed > 0) && (
              <span className="text-red-600">✗ {data.scrape.failed + data.analyze.failed} failed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
