'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

async function fetchLists() {
  const res = await fetch('/api/lists');
  if (!res.ok) throw new Error('Failed to fetch lists');
  return res.json();
}

async function addList(data: { name: string; listUrl: string; description?: string }) {
  const res = await fetch('/api/lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to add list');
  }
  return res.json();
}

async function deleteList(id: string) {
  const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete list');
  return res.json();
}

async function toggleListActive(id: string, isActive: boolean) {
  const res = await fetch(`/api/lists/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error('Failed to update list');
  return res.json();
}

async function scrapeList(listId: string) {
  const res = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId }),
  });
  if (!res.ok) throw new Error('Failed to start scraping');
  return res.json();
}

async function scrapeAll() {
  const res = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scrapeAll: true }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to start scraping');
  }
  return res.json();
}

export default function ListsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    listUrl: '',
    description: '',
  });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['twitter-lists'],
    queryFn: fetchLists,
  });

  const addMutation = useMutation({
    mutationFn: addList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-lists'] });
      setShowForm(false);
      setFormData({ name: '', listUrl: '', description: '' });
      setError('');
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-lists'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleListActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-lists'] });
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: scrapeList,
    onSuccess: () => {
      alert('Scraping job queued successfully!');
    },
  });

  const scrapeAllMutation = useMutation({
    mutationFn: scrapeAll,
    onSuccess: (data) => {
      alert(`Scraping queued for ${data.listsCount} list(s)!`);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Twitter Lists</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage the Twitter lists you want to scrape
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrapeAllMutation.mutate()}
                disabled={scrapeAllMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {scrapeAllMutation.isPending ? 'Scraping...' : 'Scrape All'}
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add List Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add Twitter List
          </button>
        )}

        {/* Add List Form */}
        {showForm && (
          <div className="mb-6 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Twitter List
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Crypto Influencers"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List URL
                </label>
                <input
                  type="url"
                  value={formData.listUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, listUrl: e.target.value })
                  }
                  placeholder="https://twitter.com/i/lists/1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Example: https://twitter.com/i/lists/78783491 or https://x.com/i/lists/1657850814910590977
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description of this list..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add List'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', listUrl: '', description: '' });
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lists Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading lists...</p>
          </div>
        ) : data?.lists && data.lists.length > 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    List ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Scraped
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.lists.map((list: any) => (
                  <tr key={list.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{list.name}</div>
                        {list.description && (
                          <div className="text-sm text-gray-500">{list.description}</div>
                        )}
                        <a
                          href={list.listUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View on Twitter →
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {list.listId}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          toggleMutation.mutate({
                            id: list.id,
                            isActive: !list.isActive,
                          })
                        }
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          list.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {list.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {list.lastScraped
                        ? formatDistanceToNow(new Date(list.lastScraped), {
                            addSuffix: true,
                          })
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => scrapeMutation.mutate(list.id)}
                        disabled={scrapeMutation.isPending}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Scrape Now
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(`Delete list "${list.name}"?`)
                          ) {
                            deleteMutation.mutate(list.id);
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">
              No Twitter lists added yet. Add your first list to get started!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Twitter List
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
