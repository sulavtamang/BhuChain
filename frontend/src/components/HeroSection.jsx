import { useState } from "react";
import { Search, MapPin, ChevronRight } from "lucide-react";

export default function HeroSection() {
  const [parcelId, setParcelId] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Django API here
    alert(`Searching for parcel: ${parcelId}`);
  };

  return (
    <section className="relative overflow-hidden bg-[#F3F4F6] py-20 sm:py-28 lg:py-36">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#1E3A8A]/5" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#1E3A8A]/5" />

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 px-4 py-1.5 text-sm font-medium text-[#1E3A8A]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#DC2626]" />
          Live on Ethereum Blockchain
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl font-bold text-[#111827] sm:text-5xl lg:text-6xl"
            style={{ textWrap: "balance" }}>
          Secure. Transparent.{" "}
          <span className="text-[#1E3A8A]">Immutable.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#6B7280]">
          {"Nepal's first blockchain-based land registry system. Verify ownership, transfer property, and access tamper-proof records — all on-chain."}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-xl">
          <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-[#D1D5DB] bg-white shadow-lg focus-within:ring-2 focus-within:ring-[#1E3A8A]/30">
            <div className="pl-4 text-[#9CA3AF]">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Enter Parcel ID or Owner Address"
              value={parcelId}
              onChange={(e) => setParcelId(e.target.value)}
              className="flex-1 border-none bg-transparent px-3 py-4 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none"
            />
            <button
              type="submit"
              className="m-1.5 flex items-center gap-2 rounded-lg bg-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C]"
            >
              <MapPin className="h-4 w-4" />
              Search
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
          {[
            { label: "Parcels Registered", value: "1.2M+" },
            { label: "Verified Transactions", value: "50K+" },
            { label: "Districts Covered", value: "77" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-[#1E3A8A]">{stat.value}</div>
              <div className="text-sm text-[#6B7280]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}