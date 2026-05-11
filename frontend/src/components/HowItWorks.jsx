import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    number: '01',
    title: 'Register Property',
    description: 'Submit your land details and documentation through our secure online portal.',
  },
  {
    number: '02',
    title: 'Verification',
    description: 'Our verification team validates your documents and property information.',
  },
  {
    number: '03',
    title: 'Blockchain Recording',
    description: 'Your property is recorded on the blockchain with an immutable digital certificate.',
  },
  {
    number: '04',
    title: 'Get Certificate',
    description: 'Receive your digital land title certificate valid for all legal purposes.',
  },
]

function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState({})
  const stepsRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepsRef.current.indexOf(entry.target)
            setVisibleSteps((prev) => ({ ...prev, [index]: true }))
          }
        })
      },
      { threshold: 0.2 }
    )

    stepsRef.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-linear-to-br from-[#f9fafb] to-[#f3f4f6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 md:mb-24">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl text-balance">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600">
            A simple four-step process to register your land property on the Nepal Land
            Registry blockchain.
          </p>
        </div>

        {/* Desktop Layout (with vertical connecting line) */}
        <div className="hidden md:flex flex-col gap-12 relative mx-auto max-w-4xl">
          {/* Vertical Line Connector behind the circles */}
          <div className="absolute left-[39px] lg:left-[49px] top-4 bottom-4 w-1 bg-linear-to-b from-[#1e40ef] to-[#0ea5e9]/10 rounded-full z-0"></div>
          
          {steps.map((step, index) => (
            <div
              key={index}
              ref={(el) => (stepsRef.current[index] = el)}
              className={`relative z-10 flex items-center gap-8 lg:gap-12 transition-all duration-700 ease-out ${
                visibleSteps[index] ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="shrink-0 w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-full bg-linear-to-br from-[#1e40ef] to-[#0ea5e9] flex items-center justify-center text-3xl font-bold text-white shadow-[0_10px_30px_rgba(30,64,175,0.2)]">
                {step.number}
              </div>
              <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-[#1e40ef] mb-3">{step.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Layout (simplified stacked list) */}
        <div className="flex md:hidden flex-col gap-10">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-5 items-start">
              <div className="shrink-0 w-14 h-14 rounded-full bg-linear-to-br from-[#1e40ef] to-[#0ea5e9] flex items-center justify-center text-xl font-bold text-white shadow-md mt-1">
                {step.number}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1e40ef] mb-2">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default HowItWorks
