import PublicLayout from '../../components/layout/PublicLayout'

const PRICING_FEATURES = [
  'Monthly Rent',
  'Security Deposit',
  'Meals (3x daily)',
  'WiFi',
  'AC',
  'Attached Bathroom',
  'Laundry Access',
  'Study Room Access',
  'Transport',
  'Security Guard',
]

const PRICING_DATA = {
  'Single Room':    ['Rs. 8,000', 'Rs. 10,000', '✓', '✓', '✓', '✓', '✓', '✓', '✓', '✓'],
  'Double Sharing': ['Rs. 5,500', 'Rs. 8,000',  '✓', '✓', '✓', '✗', '✓', '✓', '✓', '✓'],
  'Triple Sharing': ['Rs. 4,000', 'Rs. 6,000',  '✓', '✓', '✗', '✗', '✓', '✓', '✓', '✓'],
}

export default function PricingPage() {
  const roomTypes = Object.keys(PRICING_DATA)

  return (
    <PublicLayout>
      <section className="pt-28 pb-24 bg-navy-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Transparent Pricing</p>
            <h2 className="section-title">Compare Room Plans</h2>
            <p className="section-subtitle">See exactly what's included in each accommodation option.</p>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy-800">
                    <th className="table-header text-left rounded-tl-2xl w-44">Features</th>
                    {roomTypes.map((type, i) => (
                      <th key={type} className={`table-header text-center ${i === roomTypes.length - 1 ? 'rounded-tr-2xl' : ''}`}>
                        {type}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRICING_FEATURES.map((feature, rowIdx) => (
                    <tr
                      key={feature}
                      className={rowIdx % 2 === 0 ? 'bg-navy-900/50' : 'bg-navy-900/20'}
                    >
                      <td className="table-cell font-medium text-navy-200">{feature}</td>
                      {roomTypes.map((type) => {
                        const val = PRICING_DATA[type][rowIdx]
                        const isCheck = val === '✓'
                        const isCross = val === '✗'
                        return (
                          <td key={type} className="table-cell text-center">
                            {isCheck ? (
                              <span className="text-green-400 font-bold text-lg">✓</span>
                            ) : isCross ? (
                              <span className="text-navy-600 font-bold text-lg">✗</span>
                            ) : (
                              <span className="text-blue-300 font-semibold">{val}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
