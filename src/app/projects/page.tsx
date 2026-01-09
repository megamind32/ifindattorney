export default function Projects() {
  return (
    <main className="min-h-screen bg-white page-transition-enter">
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold font-[family-name:var(--font-khand)] mb-8 content-transition">
            Projects & Roadmap
          </h1>

          <div className="space-y-12 font-[family-name:var(--font-inter)] stagger-container">
            {/* Current MVP */}
            <div className="border-l-4 border-red-600 pl-6 content-transition">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] mb-2">
                MVP: Lawyer Discovery (Current)
              </h2>
              <p className="text-black/70 mb-4">
                <strong>Status:</strong> Active
              </p>
              <p className="text-lg leading-relaxed mb-4">
                A minimal viable product to help people in Lagos find lawyers. Features include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-black/70">
                <li>AI-powered intake chat</li>
                <li>Practice area classification</li>
                <li>Location-aware recommendations</li>
                <li>Consultation cost estimates</li>
                <li>Newsletter signup (placeholder)</li>
              </ul>
              <p className="text-sm text-black/50 mt-4">
                Launched January 2024. Lagos State only.
              </p>
            </div>

            {/* Planned Expansions */}
            <div className="border-l-4 border-black/20 pl-6 content-transition">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] mb-2">
                Planned Expansions (Future)
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Q2 2024: Self-Registration Portal</h3>
                  <p className="text-black/70">
                    Allow lawyers to register themselves, verify credentials, and manage their profiles.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Q3 2024: Geographic Expansion</h3>
                  <p className="text-black/70">
                    Expand to other states in Nigeria (starting with Abuja, Rivers, Kaduna).
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Q4 2024: Verified Reviews (Optional)</h3>
                  <p className="text-black/70">
                    Allow clients to leave verified reviews (on opt-in basis). No ratings—just text feedback.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">2025: Booking & Escrow</h3>
                  <p className="text-black/70">
                    Simple consultation booking and escrow-protected payments (if needed).
                  </p>
                </div>
              </div>
            </div>

            {/* What We Won't Do */}
            <div className="border-l-4 border-gray-300 pl-6">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] mb-4">
                What We Won't Do
              </h2>
              <ul className="space-y-2 text-black/70">
                <li>
                  <strong>Provide legal advice:</strong> That's a lawyer's job.
                </li>
                <li>
                  <strong>Rate or rank lawyers:</strong> We avoid subjective quality judgments.
                </li>
                <li>
                  <strong>Guarantee outcomes:</strong> No platform can promise legal results.
                </li>
                <li>
                  <strong>Scrape or violate Google ToS:</strong> All data is manually curated or lawyer-provided.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
