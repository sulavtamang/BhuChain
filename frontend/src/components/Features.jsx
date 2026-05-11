import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, SearchCheck, Handshake, GlobeLock, Coins, Smartphone } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Immutable Records',
    description: 'Once registered on the blockchain, land records cannot be altered, providing permanent proof of ownership.',
  },
  {
    icon: <GlobeLock className="h-6 w-6" />,
    title: 'Enhanced Security',
    description: 'Cryptographic security ensures only authorized individuals can access and modify property records.',
  },
  {
    icon: <SearchCheck className="h-6 w-6" />,
    title: 'Instant Verification',
    description: 'Verify land ownership and transaction history instantly without intermediaries or delays.',
  },
  {
    icon: <Handshake className="h-6 w-6" />,
    title: 'Transparent System',
    description: 'All transactions are recorded transparently, reducing fraud and corruption in property dealings.',
  },
  {
    icon: <Coins className="h-6 w-6" />,
    title: 'Reduced Costs',
    description: 'Eliminate intermediaries and reduce registration fees with direct blockchain-based transactions.',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Digital Access',
    description: 'Access property records anytime, anywhere through our secure digital platform.',
  },
]

function Features() {
  const [visibleFeatures, setVisibleFeatures] = useState({})
  const featuresRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = featuresRef.current.indexOf(entry.target)
            setVisibleFeatures((prev) => ({ ...prev, [index]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    featuresRef.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="bg-(--bg-secondary) py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-medium text-(--primary) sm:text-4xl text-balance">Why Choose BhuChain Platform</h2>
          <p className="mt-4 text-lg">
            Blockchain technology offers unprecedented security, transparency, and
            efficiency for land registration in Nepal.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (featuresRef.current[index] = el)}
              className={`group rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-700 ease-out hover:border-[#1e40ef]/30 hover:shadow-lg ${
                visibleFeatures[index] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#1e40ef]/10 text-[#1e40ef] transition-colors group-hover:bg-[#1e40ef] group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
