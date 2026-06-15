import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import PublicLayout from '../../components/layout/PublicLayout'

const ROOMS = [
  {
    type: 'Single Room',
    price: 8000,
    capacity: 1,
    tag: 'Most Private',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    highlight: true,
    amenities: ['Private room', 'Attached bathroom', 'Individual AC', 'Study desk', 'Wardrobe', 'High-speed WiFi'],
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1000'
  },
  {
    type: 'Double Sharing',
    price: 5500,
    capacity: 2,
    tag: 'Most Popular',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    highlight: false,
    amenities: ['Shared with 1 student', 'Shared bathroom', 'Individual AC', 'Two study desks', 'Personal wardrobe', 'High-speed WiFi'],
    image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1000'
  },
  {
    type: 'Triple Sharing',
    price: 4000,
    capacity: 3,
    tag: 'Best Value',
    tagColor: 'bg-green-500/20 text-green-300 border-green-500/30',
    highlight: false,
    amenities: ['Shared with 2 students', 'Shared bathroom', 'Ceiling fans', 'Study table', 'Shared storage', 'High-speed WiFi'],
    image_url: 'https://804.alhuda.com.pk/wp-content/uploads/2025/01/Hostel-Near-Model-Town.jpg'
  },
]

export default function RoomsPage() {
  const navigate = useNavigate()

  return (
    <PublicLayout>
      <section className="pt-28 pb-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Accommodation Options</p>
            <h2 className="section-title">Choose Your Room</h2>
            <p className="section-subtitle">Flexible accommodation options to suit every budget and lifestyle preference.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROOMS.map((room) => (
              <div
                key={room.type}
                className={`card card-hover p-7 relative ${room.highlight ? 'border-blue-500/50 glow-blue' : ''}`}
              >
                {room.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-blue-600/40">
                      PREMIUM CHOICE
                    </span>
                  </div>
                )}

                {room.image_url && (
                  <div className="w-full h-48 mb-5 rounded-lg overflow-hidden relative group">
                    <div className="absolute inset-0 bg-navy-900/20 group-hover:bg-transparent transition-colors duration-300 z-10"/>
                    <img src={room.image_url} alt={room.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  </div>
                )}

                <div className="mb-5">
                  <span className={`text-xs font-semibold border px-3 py-1 rounded-full ${room.tagColor}`}>
                    {room.tag}
                  </span>
                </div>

                <h3 className="font-heading text-2xl font-bold text-white mb-1">{room.type}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-blue-400 font-heading">
                    Rs. {room.price.toLocaleString()}
                  </span>
                  <span className="text-navy-400 text-sm">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {room.amenities.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-navy-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/contact')}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 ${
                    room.highlight
                      ? 'btn-primary'
                      : 'bg-navy-700 hover:bg-navy-600 text-white border border-navy-600 hover:border-navy-500'
                  }`}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
