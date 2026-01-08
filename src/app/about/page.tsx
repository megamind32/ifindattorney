export default function About() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold font-[family-name:var(--font-khand)] mb-8">
            About iFind Attorney
          </h1>

          <div className="space-y-8 font-[family-name:var(--font-inter)] text-lg leading-relaxed text-black/80">
            <div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] mb-4">
                Our Mission
              </h2>
              <p>
                We believe finding the right lawyer shouldn't be complicated. iFind Attorney makes it easier for
                people in Lagos to discover attorneys whose expertise matches their legal needs and location.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] mb-4">
                How It Works
              </h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong>Tell us your story:</strong> Describe your legal situation in natural language.
                </li>
                <li>
                  <strong>We classify your needs:</strong> Our AI asks clarifying questions to understand your practice area, urgency, and budget.
                </li>
                <li>
                  <strong>Get recommendations:</strong> We match you with lawyers in Lagos based on expertise and proximity.
                </li>
                <li>
                  <strong>Connect safely:</strong> You reach out directly; we just facilitate the introduction.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] mb-4">
                Key Disclaimers
              </h2>
              <ul className="list-disc list-inside space-y-2 text-black/70">
                <li>
                  <strong>Not legal advice:</strong> iFind Attorney does not provide legal advice. Our AI is for intake and matching only.
                </li>
                <li>
                  <strong>Not a law firm:</strong> We are not a law firm and do not provide legal services.
                </li>
                <li>
                  <strong>Recommendations are suggestions:</strong> Lawyer suggestions are based on your inputs, not endorsements. Do your own due diligence.
                </li>
                <li>
                  <strong>Lagos MVP only:</strong> This platform is currently limited to Lagos State. Expanding soon.
                </li>
                <li>
                  <strong>No guarantees:</strong> We cannot guarantee results or outcomes from any legal representation.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] mb-4">
                Why We Built This
              </h2>
              <p>
                Many people struggle to find a lawyer they can trust. Word-of-mouth is helpful, but it's not scalable or unbiased. We wanted to build a simple, transparent way to match clients with attorneys—no scraping, no BS, just good recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
