'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('number_plate') // Default search type
  const [result, setResult] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const { data, error } = await supabase
      .from('motorbikes')
      .select('*, police_stations(name, county)')
      .eq(searchType, searchQuery.toUpperCase().trim())

    if (error) {
      alert("Search failed. Please try again.")
    } else {
      setResult(data)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Motorbike Recovery</h1>
          <p className="text-gray-600">Search for your recovered motorbike in Kenya</p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search By:</label>
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="number_plate">Number Plate (KXXX 000X)</option>
                <option value="chassis_number">Chassis Number</option>
                <option value="engine_number">Engine Number</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder={`Enter ${searchType.replace('_', ' ')}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold uppercase"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'SEARCH SYSTEM'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="mt-8 space-y-4">
          {result && result.length === 0 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
              <p className="text-orange-800 font-medium">No bike found with that record.</p>
              <p className="text-sm text-orange-600">Try searching with the Chassis number if the plate was changed.</p>
            </div>
          )}

          {result && result.map((bike) => (
            <div key={bike.id} className="bg-green-50 border border-green-200 p-6 rounded-2xl">
              <h2 className="text-green-900 font-bold text-xl mb-2">BIKE RECOVERED! 🎉</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Brand/Model:</strong> {bike.brand} {bike.model}</p>
                <p><strong>Color:</strong> {bike.color}</p>
                <p><strong>Status:</strong> <span className="capitalize px-2 py-1 bg-green-200 rounded text-green-900 text-xs font-bold">{bike.status}</span></p>
                <hr className="border-green-200 my-2"/>
                <p className="text-sm">Located at:</p>
                <p className="text-lg font-bold text-green-900 uppercase">
                  {bike.police_stations?.name}
                </p>
                <p className="text-sm uppercase">{bike.police_stations?.county} County</p>
              </div>
              <Link href={`/claim/${bike.id}`} className="block w-full text-center mt-4 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">
               PROCEED TO CLAIM</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}