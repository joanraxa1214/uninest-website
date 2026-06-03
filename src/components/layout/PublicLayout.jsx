import Navbar from './Navbar'
import Footer from './Footer'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-navy-950">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
