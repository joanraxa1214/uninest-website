import { Building2, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  const scrollTo = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-navy-950 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-white">
                Uni<span className="text-blue-400">Nest</span>
              </span>
            </div>
            <p className="text-navy-400 text-sm leading-relaxed mb-5">
              Premium hostel accommodation for university students. Safe, comfortable, and affordable living designed for academic success.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-navy-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4 text-navy-300 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', href: '#home' },
                { label: 'Our Rooms', href: '#rooms' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Facilities', href: '#features' },
                { label: 'Contact Us', href: '#contact' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-navy-400 hover:text-blue-400 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Room Types */}
          <div>
            <h4 className="font-heading text-white font-semibold mb-4">Room Types</h4>
            <ul className="space-y-2">
              {[
                'Single Room — Rs. 8,000/mo',
                'Double Sharing — Rs. 5,500/mo',
                'Triple Sharing — Rs. 4,000/mo',
              ].map((item) => (
                <li key={item} className="text-navy-400 text-sm">{item}</li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-navy-400 text-sm">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span>UniNest Hostel, University Road, Multan, Punjab, Pakistan</span>
              </li>
              <li className="flex items-center gap-3 text-navy-400 text-sm">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+923001234567" className="hover:text-blue-400 transition-colors">+92 300 123 4567</a>
              </li>
              <li className="flex items-center gap-3 text-navy-400 text-sm">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:info@uninest.pk" className="hover:text-blue-400 transition-colors">info@uninest.pk</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-navy-500 text-sm">© 2024 UniNest. All rights reserved.</p>
          <p className="text-navy-500 text-sm">Built for Pakistani University Students</p>
        </div>
      </div>
    </footer>
  )
}
