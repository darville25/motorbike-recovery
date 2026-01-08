'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [officer, setOfficer] = useState<any>(null)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*, police_stations(name)')
          .eq('id', user.id)
          .single()
        setOfficer(data)
      }
    }
    getProfile()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Officer Info Card */}
        <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {officer?.full_name || 'Officer'}</h1>
            <p className="opacity-80">{officer?.police_stations?.name} Station</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
            className="bg-blue-800 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/register" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-all group">
            <div className="text-3xl mb-4 text-blue-600 group-hover:scale-110 transition-transform">🏍️</div>
            <h2 className="text-xl font-bold text-gray-800">Register Recovered Bike</h2>
            <p className="text-gray-500 mt-2">Add a newly recovered motorbike to the national system.</p>
          </Link>

          <Link href="/dashboard/inventory" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-all group">
            <div className="text-3xl mb-4 text-blue-600 group-hover:scale-110 transition-transform">📋</div>
            <h2 className="text-xl font-bold text-gray-800">Station Inventory</h2>
            <p className="text-gray-500 mt-2">View and manage all bikes currently held at this station.</p>
          </Link>
        </div>
      </div>
    </main>
  )
}