'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, claimed: 0, pending: 0 })
  const [logs, setLogs] = useState<any[]>([])
  const [recentBikes, setRecentBikes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    // 1. Fetch Stats (Only counting non-deleted bikes)
    const { count: total } = await supabase.from('motorbikes').select('*', { count: 'exact', head: true }).eq('is_deleted', false)
    const { count: claimed } = await supabase.from('motorbikes').select('*', { count: 'exact', head: true }).eq('status', 'claimed').eq('is_deleted', false)
    const { count: pending } = await supabase.from('claims').select('*', { count: 'exact', head: true }).eq('claim_status', 'pending')
    
    setStats({ total: total || 0, claimed: claimed || 0, pending: pending || 0 })

    // 2. Fetch Recent Active Bikes for Management
    const { data: bikeData } = await supabase
      .from('motorbikes')
      .select('*, police_stations(name)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(5)
    setRecentBikes(bikeData || [])

    // 3. Fetch Audit Logs
    const { data: logsData } = await supabase
      .from('audit_logs')
      .select('*, profiles(full_name)')
      .order('timestamp', { ascending: false })
      .limit(10)

    setLogs(logsData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleArchive = async (id: string, plate: string) => {
    const confirmDelete = confirm(`Are you sure you want to ARCHIVE bike ${plate}? It will be hidden from public search and police inventory.`)
    
    if (confirmDelete) {
      const { error } = await supabase
        .from('motorbikes')
        .update({ is_deleted: true })
        .eq('id', id)

      if (error) {
        alert("Error: " + error.message)
      } else {
        alert("Record archived successfully.")
        fetchData() // Refresh data
      }
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading National Registry...</div>

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">National Admin Panel</h1>
            <p className="text-gray-500 text-sm">Official oversight of recovered motorbikes in Kenya</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="bg-white px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50">Officer View</Link>
            <button onClick={fetchData} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Refresh Data</button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-600">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active in Registry</p>
            <p className="text-4xl font-black text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-green-600">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Handed Over</p>
            <p className="text-4xl font-black text-gray-800">{stats.claimed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-orange-600">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unprocessed Claims</p>
            <p className="text-4xl font-black text-gray-800">{stats.pending}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Registrations & Management */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Recent Registrations</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {recentBikes.map((bike) => (
                  <div key={bike.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-lg font-bold text-blue-900">{bike.number_plate}</p>
                      <p className="text-xs text-gray-500">{bike.police_stations?.name} Station</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">ID: {bike.id}</p>
                    </div>
                    <button 
                      onClick={() => handleArchive(bike.id, bike.number_plate)}
                      className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-bold border border-transparent hover:border-red-100 transition-all"
                    >
                      ARCHIVE RECORD
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Audit Logs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <div className="p-6 border-b border-gray-50 bg-gray-900 text-white">
              <h2 className="text-lg font-bold">System Activity</h2>
              <p className="text-xs opacity-60">Real-time audit trail</p>
            </div>
            <div className="divide-y divide-gray-50">
              {logs.map((log) => (
                <div key={log.id} className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{log.profiles?.full_name || 'System'}</p>
                  <p className="text-[10px] text-gray-400 truncate">Target: {log.entity_id}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 text-center">
                <button className="text-[11px] font-bold text-gray-500 uppercase hover:text-blue-600">View Full Logs</button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}