'use client';

import { useState, useEffect } from 'react';

interface EventStats {
  event_type: string;
  count: string;
  unique_sessions: string;
}

interface RecentEvent {
  id: number;
  event_type: string;
  session_id: string;
  mmm_category: string;
  professional_status: string;
  created_at: string;
}

interface AnalyticsData {
  stats: EventStats[];
  recentEvents: RecentEvent[];
}

type FilterPreset = 'all' | 'today' | 'week' | 'month' | 'custom';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getDateRange = (): { startDate: string; endDate: string } | null => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    switch (filterPreset) {
      case 'today':
        return { startDate: formatDate(today), endDate: formatDate(today) };
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { startDate: formatDate(weekAgo), endDate: formatDate(today) };
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { startDate: formatDate(monthAgo), endDate: formatDate(today) };
      }
      case 'custom':
        if (customStartDate && customEndDate) {
          return { startDate: customStartDate, endDate: customEndDate };
        }
        return null;
      default:
        return null;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange();
      let url = '/api/analytics';
      if (dateRange) {
        url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPreset, customStartDate, customEndDate]);

  const getStatValue = (eventType: string, field: 'count' | 'unique_sessions') => {
    const stat = data?.stats.find(s => s.event_type === eventType);
    return stat ? parseInt(stat[field]) : 0;
  };

  const completionRate = () => {
    const started = getStatValue('calculator_started', 'unique_sessions');
    const completed = getStatValue('calculator_completed', 'unique_sessions');
    if (started === 0) return 0;
    return Math.round((completed / started) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilterLabel = () => {
    switch (filterPreset) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 days';
      case 'month': return 'Last 30 days';
      case 'custom': return customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` : 'Custom range';
      default: return 'All time';
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Calculator Analytics</h1>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex flex-wrap gap-2">
              {(['all', 'today', 'week', 'month', 'custom'] as FilterPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setFilterPreset(preset)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    filterPreset === preset
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset === 'all' && 'All time'}
                  {preset === 'today' && 'Today'}
                  {preset === 'week' && 'Last 7 days'}
                  {preset === 'month' && 'Last 30 days'}
                  {preset === 'custom' && 'Custom'}
                </button>
              ))}
            </div>
          </div>

          {filterPreset === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <label htmlFor="startDate" className="text-sm text-gray-600">From:</label>
                <input
                  type="date"
                  id="startDate"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="endDate" className="text-sm text-gray-600">To:</label>
                <input
                  type="date"
                  id="endDate"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Started
            </div>
            <div className="mt-2 text-4xl font-bold text-blue-600">
              {getStatValue('calculator_started', 'unique_sessions')}
            </div>
            <div className="mt-1 text-sm text-gray-400">
              unique sessions
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Completed
            </div>
            <div className="mt-2 text-4xl font-bold text-green-600">
              {getStatValue('calculator_completed', 'unique_sessions')}
            </div>
            <div className="mt-1 text-sm text-gray-400">
              with results shown
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Completion Rate
            </div>
            <div className="mt-2 text-4xl font-bold text-purple-600">
              {completionRate()}%
            </div>
            <div className="mt-1 text-sm text-gray-400">
              started to completed
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Events</h2>
            <span className="text-sm text-gray-500">{getFilterLabel()}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MMM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No events found for this period.
                    </td>
                  </tr>
                ) : (
                  data?.recentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            event.event_type === 'calculator_completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {event.event_type === 'calculator_completed' ? 'Completed' : 'Started'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.mmm_category || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.professional_status || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(event.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <a href="/" className="text-blue-600 hover:underline">
            Back to Calculator
          </a>
        </div>
      </div>
    </div>
  );
}
