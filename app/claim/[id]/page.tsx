'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function ClaimBike() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bike, setBike] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    owner_name: '',
    owner_phone: '',
    national_id: ''
  })

  useEffect(() => {
    const getBike = async () => {
      const { data } = await supabase.from('motorbikes').select('*').eq('id', id).single()
      setBike(data)
    }
    getBike()
  }, [id])

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('claims').insert([{
      motorbike_id: id,
      ...formData,
      claim_status: 'pending'
    }])

    if (error) {
        alert(error.message)
    } else {
        alert("Claim submitted! The police at the station will contact you after verifying your documents.")
        router.push('/')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Claim Ownership</h1>
        <p className="text-gray-600 mb-6 border-b pb-4">Bike: <span className="font-bold text-blue-800">{bike?.number_plate}</span></p>

        <form onSubmit={handleClaim} className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium">Your Full Name (As per ID)</label>
            <input type="text" className="w-full p-3 border rounded-xl bg-gray-50" required
              onChange={e => setFormData({...formData, owner_name: e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-medium">National ID Number</label>
            <input type="text" className="w-full p-3 border rounded-xl bg-gray-50" required
              onChange={e => setFormData({...formData, national_id: e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input type="tel" className="w-full p-3 border rounded-xl bg-gray-50" placeholder="07XXXXXXXX" required
              onChange={e => setFormData({...formData, owner_phone: e.target.value})} />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800">
            Note: You will be required to present the original Logbook and National ID at the police station for verification.
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl">
            {loading ? 'Submitting...' : 'SUBMIT CLAIM'}
          </button>
        </form>
      </div>
    </main>
  )
}