'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterBike() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    number_plate: '',
    chassis_number: '',
    engine_number: '',
    brand: '',
    model: '',
    color: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('station_id').eq('id', user?.id).single()

    let imageUrl = null

    // 1. Upload Image to Storage
    if (imageFile) {
      const fileName = `${Date.now()}_bike.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bike-images')
        .upload(fileName, imageFile)
      
      if (uploadData) imageUrl = fileName
    }

    // 2. Save Data to Motorbikes Table
    const { error } = await supabase.from('motorbikes').insert([{
      ...formData,
      number_plate: formData.number_plate.toUpperCase(),
      station_id: profile?.station_id,
      status: 'recovered',
      created_by: user?.id,
      // image_url: imageUrl // Ensure you added this column to your table earlier!
    }])

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("Motorbike registered successfully!")
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Register Recovered Motorbike</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Number Plate</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="KXXX 000X" required
                onChange={e => setFormData({...formData, number_plate: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="e.g. Red/Black" required
                onChange={e => setFormData({...formData, color: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Chassis Number</label>
            <input type="text" className="w-full p-2 border rounded" required
              onChange={e => setFormData({...formData, chassis_number: e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-medium">Engine Number</label>
            <input type="text" className="w-full p-2 border rounded" required
              onChange={e => setFormData({...formData, engine_number: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Brand</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="e.g. Bajaj, Boxer" required
                onChange={e => setFormData({...formData, brand: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium">Model</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="e.g. BM 150" required
                onChange={e => setFormData({...formData, model: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Bike Photo</label>
            <input type="file" accept="image/*" className="w-full p-2" 
              onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">
            {loading ? 'Saving to National Database...' : 'REGISTER BIKE'}
          </button>
        </form>
      </div>
    </main>
  )
}