import { ShieldCheck, SearchCheck, Handshake } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Tamper-Proof Records",
    description:
      "Every land record is hashed and stored on the Ethereum blockchain, making unauthorized modifications impossible.",
  },
  {
    icon: SearchCheck,
    title: "Instant Verification",
    description:
      "Verify any land ownership record in seconds by querying the blockchain directly — no middlemen required.",
  },
  {
    icon: Handshake,
    title: "Smart Contract Transfers",
    description:
      "Transfer land ownership through secure smart contracts with built-in government approval workflows.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold text-[#111827] sm:text-4xl"
              style={{ textWrap: "balance" }}>
            Why Blockchain for Land Registry?
          </h2>
          <p className="mt-4 text-lg text-[#6B7280]">
            Traditional land records are vulnerable to fraud, forgery, and disputes.
            BhuChain eliminates these issues at the protocol level.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[#E5E7EB] bg-white p-8 transition-all hover:border-[#1E3A8A]/20 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A] transition-colors group-hover:bg-[#1E3A8A] group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}