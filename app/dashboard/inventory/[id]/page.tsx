'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function ManageBike() {
  const { id } = useParams()
  const router = useRouter()
  const [bike, setBike] = useState<any>(null)
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Get bike details
      const { data: bikeData } = await supabase.from('motorbikes').select('*').eq('id', id).single()
      // Get all claims for this bike
      const { data: claimData } = await supabase.from('claims').select('*').eq('motorbike_id', id)
      
      setBike(bikeData)
      setClaims(claimData || [])
      setLoading(false)
    }
    fetchData()
  }, [id])

  const updateStatus = async (newStatus: string) => {
    const { error } = await supabase
      .from('motorbikes')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      alert(`Status updated to ${newStatus}`)
      router.refresh()
      window.location.reload()
    }
  }

  if (loading) return <p className="p-10 text-center">Loading records...</p>

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage {bike?.number_plate}</h1>

        {/* Status Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <h2 className="font-bold text-gray-700 mb-4">Update Status</h2>
          <div className="flex gap-2">
            <button onClick={() => updateStatus('recovered')} className="flex-1 py-2 rounded bg-blue-100 text-blue-800 text-sm font-bold">RECOVERED</button>
            <button onClick={() => updateStatus('verified')} className="flex-1 py-2 rounded bg-orange-100 text-orange-800 text-sm font-bold">VERIFIED</button>
            <button onClick={() => updateStatus('claimed')} className="flex-1 py-2 rounded bg-green-100 text-green-800 text-sm font-bold">SET AS CLAIMED</button>
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-700">Ownership Claims ({claims.length})</h2>
          {claims.length === 0 ? (
            <p className="text-gray-400 italic">No claims submitted for this bike yet.</p>
          ) : (
            claims.map((claim) => (
              <div key={claim.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-600">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-bold">{claim.owner_name}</p>
                    <p className="text-sm text-gray-600">ID Number: {claim.national_id}</p>
                    <p className="text-sm text-gray-600">Phone: {claim.owner_phone}</p>
                  </div>
                  <a href={`tel:${claim.owner_phone}`} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                    CALL OWNER
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}