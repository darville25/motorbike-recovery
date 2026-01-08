'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function StationInventory() {
  const [bikes, setBikes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInventory = async () => {
      // 1. Get logged in user
      const { data: { user } } = await supabase.auth.getUser()
      
      // 2. Get their station_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('station_id')
        .eq('id', user?.id)
        .single()

      // 3. Get all bikes for that station + their claim count
      const { data, error } = await supabase
        .from('motorbikes')
        .select(`
          *,
          claims (id)
        `)
        .eq('station_id', profile?.station_id)
        .order('created_at', { ascending: false })

      if (data) setBikes(data)
      setLoading(false)
    }
    fetchInventory()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Station Inventory</h1>
          <Link href="/dashboard" className="text-blue-600 font-medium">← Back to Dashboard</Link>
        </div>

        {loading ? (
          <p>Loading station records...</p>
        ) : bikes.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center border">
            <p className="text-gray-500 text-lg">No motorbikes registered at this station yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bikes.map((bike) => (
              <div key={bike.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-blue-900">{bike.number_plate}</span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                      bike.status === 'recovered' ? 'bg-blue-100 text-blue-700' : 
                      bike.status === 'verified' ? 'bg-orange-100 text-orange-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {bike.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{bike.brand} {bike.model} • {bike.color}</p>
                  <p className="text-xs text-gray-400 mt-1">Chassis: {bike.chassis_number}</p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-4 w-full md:w-auto">
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-gray-400 uppercase">Active Claims</p>
                        <p className="text-lg font-bold">{bike.claims?.length || 0}</p>
                    </div>
                    <Link 
                      href={`/dashboard/inventory/${bike.id}`}
                      className="flex-1 md:flex-none bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-bold text-center"
                    >
                      MANAGE BIKE
                    </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}