import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      {/* Hero */}
      <div className="mb-20">
        <div className="mono text-accent text-sm mb-4 tracking-widest uppercase">
          Compensation Intelligence · India → Global
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6 max-w-3xl">
          Levels, not titles.
          <br />
          <span className="text-accent2">Real comp</span>, not guesses.
        </h1>
        <p className="text-muted text-lg max-w-xl mb-10">
          LevelComp standardizes compensation data by engineering levels — not job titles. 
          L4 at Google ≠ Senior at Infosys. Know the difference.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link href="/salaries" className="bg-accent text-ink font-semibold px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors">
            Browse Salaries
          </Link>
          <Link href="/compare" className="border border-border px-6 py-3 rounded-lg hover:border-accent2 transition-colors">
            Compare Offers
          </Link>
          <Link href="/submit" className="border border-border px-6 py-3 rounded-lg hover:border-accent transition-colors">
            Submit Your Comp
          </Link>
        </div>
      </div>

      {/* Why levels matter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          {
            title: "Levels > Titles",
            icon: "⚡",
            desc: "SDE2 at Amazon, L4 at Google, and Senior at Flipkart — all mean very different things in comp. We standardize this.",
          },
          {
            title: "Structured Data",
            icon: "🧱",
            desc: "Base + Bonus + Stock broken down clearly. Total compensation, not just base salary — because base alone is misleading.",
          },
          {
            title: "Decision-Ready",
            icon: "🎯",
            desc: "Compare two offers side-by-side. Filter by company, role, level, and location. Make the call with confidence.",
          },
        ].map((card) => (
          <div key={card.title} className="bg-card border border-border rounded-xl p-6">
            <div className="text-3xl mb-3">{card.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
            <p className="text-muted text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Why AmbitionBox / Glassdoor fail */}
      <div className="bg-card border border-border rounded-xl p-8 mb-20">
        <h2 className="text-2xl font-bold mb-6">Why existing platforms fail</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { platform: "AmbitionBox", issue: "Mixes levels. A 'Senior' at a 10-person startup vs a FAANG shows same-sounding data. No level standardization." },
            { platform: "Glassdoor", issue: "Self-reported, unvalidated. No breakdown of base/bonus/stock. Impossible to compare across companies." },
            { platform: "Levels.fyi", issue: "Excellent for US — poor India coverage. This fills that gap with level-standardized India → global data." },
          ].map((item) => (
            <div key={item.platform} className="border-l-2 border-accent2 pl-4">
              <div className="mono text-accent2 text-sm mb-1">{item.platform}</div>
              <p className="text-muted text-sm">{item.issue}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["google", "microsoft", "amazon", "flipkart"].map((co) => (
          <Link
            key={co}
            href={`/company/${co}`}
            className="bg-card border border-border rounded-lg p-4 text-center hover:border-accent transition-colors"
          >
            <div className="mono text-accent text-xs mb-1">company</div>
            <div className="font-semibold capitalize">{co}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
