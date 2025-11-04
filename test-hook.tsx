/**
 * Test component for usePubData hook
 */

'use client';

import { usePubData } from './app/hooks/usePubData';
import QueryProvider from './app/providers/QueryProvider';

function PubDataTest() {
  const {
    pubs,
    filteredCount,
    totalCount,
    isLoading,
    isError,
    error,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    clearFilters,
  } = usePubData();

  if (isLoading) {
    return <div>Loading pubs...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Pub Data Hook Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
        <p><strong>Total Pubs:</strong> {totalCount}</p>
        <p><strong>Filtered Pubs:</strong> {filteredCount}</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          <strong>Search: </strong>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, address, postcode..."
            style={{ padding: '8px', width: '300px' }}
          />
        </label>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '20px' }}>
          <strong>Borough: </strong>
          <select
            value={filters.borough || ''}
            onChange={(e) => setFilters({ ...filters, borough: e.target.value || undefined })}
            style={{ padding: '8px' }}
          >
            <option value="">All Boroughs</option>
            <option value="Westminster">Westminster</option>
            <option value="Camden">Camden</option>
            <option value="Islington">Islington</option>
            <option value="Hackney">Hackney</option>
          </select>
        </label>

        <label style={{ marginRight: '20px' }}>
          <strong>Open Status: </strong>
          <select
            value={filters.openStatus ?? ''}
            onChange={(e) => setFilters({ ...filters, openStatus: e.target.value ? Number(e.target.value) : undefined })}
            style={{ padding: '8px' }}
          >
            <option value="">All</option>
            <option value="1">Open</option>
            <option value="0">Closed</option>
          </select>
        </label>

        <button onClick={clearFilters} style={{ padding: '8px 16px' }}>
          Clear Filters
        </button>
      </div>

      {/* Results */}
      <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #ccc' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#fff' }}>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ccc' }}>Name</th>
              <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ccc' }}>Address</th>
              <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ccc' }}>Borough</th>
              <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ccc' }}>Postcode</th>
              <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ccc' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pubs.slice(0, 50).map((pub) => (
              <tr key={pub.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{pub.properties.name}</td>
                <td style={{ padding: '8px' }}>{pub.properties.address1}</td>
                <td style={{ padding: '8px' }}>{pub.properties.borough_name}</td>
                <td style={{ padding: '8px' }}>{pub.properties.postcode}</td>
                <td style={{ padding: '8px' }}>{pub.properties.open_status === 1 ? '✅ Open' : '❌ Closed'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pubs.length > 50 && (
          <p style={{ padding: '10px', textAlign: 'center', background: '#f9f9f9' }}>
            Showing first 50 of {pubs.length} pubs
          </p>
        )}
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <QueryProvider>
      <PubDataTest />
    </QueryProvider>
  );
}
