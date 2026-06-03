import {
  Wifi, UtensilsCrossed, ShieldCheck, BookOpen,
  WashingMachine, Wind, Bath, Bus
} from 'lucide-react'
import PublicLayout from '../../components/layout/PublicLayout'

const FEATURES = [
  { icon: Wifi,            title: 'High-Speed WiFi',   desc: 'Fiber-optic internet in every room and common area, perfect for online studying.' },
  { icon: UtensilsCrossed, title: 'Meals Included',    desc: 'Fresh, home-cooked Pakistani meals served thrice daily in the dining hall.' },
  { icon: ShieldCheck,     title: '24/7 Security',     desc: 'CCTV surveillance, security guards, and biometric entry for complete safety.' },
  { icon: BookOpen,        title: 'Study Rooms',       desc: 'Dedicated silent study halls with whiteboards, available around the clock.' },
  { icon: WashingMachine,  title: 'Laundry Service',   desc: 'Coin-operated washing machines and dryers available in every building.' },
  { icon: Wind,            title: 'Air Conditioning',  desc: 'Individual AC units in every room for year-round comfort.' },
  { icon: Bath,            title: 'Clean Bathrooms',   desc: 'Attached and shared bathrooms cleaned and sanitized twice daily.' },
  { icon: Bus,             title: 'Transport',         desc: 'Free shuttle service to and from the university campus daily.' },
]

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <section className="pt-28 pb-24 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">World-Class Facilities</p>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">Modern amenities to make your hostel stay comfortable, productive, and enjoyable.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card card-hover p-6 group">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-navy-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
