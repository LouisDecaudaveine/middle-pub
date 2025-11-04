'use client';

import Link from 'next/link';
import { usePubData } from './hooks/usePubData';

export default function Home() {
  const {
    pubs,
    filteredCount,
    totalCount,
    isLoading,
    isError,
    error,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    clearFilters,
  } = usePubData();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Loading pubs data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-red-600">Error: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">London Pubs - usePubData Hook Test</h1>
        <div className="flex gap-3">
          <Link
            href="/map-test"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
          >
            🗺️ Basic Map
          </Link>
          <Link
            href="/pub-map"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            🍺 Pub Map (4.2)
          </Link>
        </div>
      </div>
      
      {/* Stats */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <p className="text-lg"><strong>Total Pubs:</strong> {totalCount}</p>
        <p className="text-lg"><strong>Filtered Pubs:</strong> {filteredCount}</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Search</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, address, postcode..."
          className="w-full max-w-md px-4 py-2 border rounded"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block mb-2 font-medium">Borough</label>
          <select
            value={filters.borough || ''}
            onChange={(e) => setFilters({ ...filters, borough: e.target.value || undefined })}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Boroughs</option>
            <option value="Westminster">Westminster</option>
            <option value="Camden">Camden</option>
            <option value="Islington">Islington</option>
            <option value="Hackney">Hackney</option>
            <option value="Tower Hamlets">Tower Hamlets</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Open Status</label>
          <select
            value={filters.openStatus ?? ''}
            onChange={(e) => setFilters({ ...filters, openStatus: e.target.value ? Number(e.target.value) : undefined })}
            className="px-4 py-2 border rounded"
          >
            <option value="">All</option>
            <option value="1">Open</option>
            <option value="0">Closed</option>
          </select>
        </div>

        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Clear Filters
        </button>
      </div>

      {/* Results Table */}
      <div className="border rounded overflow-auto" style={{ maxHeight: '500px' }}>
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Borough</th>
              <th className="px-4 py-2 text-left">Postcode</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {pubs.slice(0, 100).map((pub) => (
              <tr key={pub.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{pub.properties.name}</td>
                <td className="px-4 py-2">{pub.properties.address1}</td>
                <td className="px-4 py-2">{pub.properties.borough_name}</td>
                <td className="px-4 py-2">{pub.properties.postcode}</td>
                <td className="px-4 py-2">
                  {pub.properties.open_status === 1 ? '✅ Open' : '❌ Closed'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pubs.length > 100 && (
          <div className="p-4 text-center bg-gray-50 border-t">
            Showing first 100 of {pubs.length} pubs
          </div>
        )}
      </div>
    </div>
  );
}
