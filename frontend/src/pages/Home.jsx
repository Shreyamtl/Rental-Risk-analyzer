import { useState , useEffect } from "react";
import { Link ,useNavigate} from "react-router-dom";
import MarkedUpDoc from "../components/MarkedUpDoc";
import { useAuth } from "../context/AuthContext";

const sampleClauses = [
  {
    id: 1,
    label: "Security Deposit",
    text: "\"Tenant shall pay a deposit of 10 months' rent, non refundable under any circumstances.\"",
    risk: "high",
    explanation:
      "Deposits above 2-3 months' rent are unusually high, and a blanket non refundable clause is a major red flag.",
  },
  {
    id: 2,
    label: "Notice Period",
    text: "\"Landlord may terminate with 7 days notice; tenant must give 60 days notice.\"",
    risk: "high",
    explanation: "This is a one sided notice period that heavily favors the landlord over the tenant.",
  },
  {
    id: 3,
    label: "Maintenance",
    text: "\"Landlord is responsible for major repairs; tenant handles minor day-to-day upkeep.\"",
    risk: "low",
    explanation: "This is the standard, fair division of maintenance responsibility.",
  },
];

const riskStyles = {
  high: {
    badge: "bg-redline-tint dark:bg-redline/25 text-redline dark:text-redline-bright",
    border: "border-redline dark:border-redline-bright",
  },
  medium: {
    badge: "bg-highlighter-tint dark:bg-highlighter/25 text-highlighter dark:text-highlighter-bright",
    border: "border-highlighter dark:border-highlighter-bright",
  },
  low: {
    badge: "bg-stamp-tint dark:bg-stamp-green/25 text-stamp-green dark:text-stamp-green-bright",
    border: "border-stamp-green dark:border-stamp-green-bright",
  },
};

const pipeline = [
  {
    n: "01",
    title: "Upload & Extract",
    desc: "Upload your agreement and we read it automatically, even if it's scanned or multi-page.",
  },
  {
    n: "02",
    title: "Identify Key Clauses",
    desc: "We find the important stuff like deposit, notice period, lock-in, and more.",
  },
  {
    n: "03",
    title: "Compare with Risky Patterns",
    desc: "We check each clause against a curated risky-pattern database.",
  },
  {
    n: "04",
    title: "Get Your Risk Score",
    desc: "A clear score tells you what's fair, what's risky, and what needs renegotiation.",
  },
];

const tickerItems = [
  "HIGH SECURITY DEPOSIT", "NOTICE PERIOD", "LOCK-IN TRAPS", "MAINTENANCE ISSUES",
  "HIDDEN RENT HIKES", "EARLY TERMINATION", "UTILITY CHARGES",
];

function PipelineCarousel({ steps }) {
  const [index, setIndex] = useState(0);

  const goNext = () => setIndex((i) => (i + 1) % steps.length);
  const goPrev = () => setIndex((i) => (i - 1 + steps.length) % steps.length);

  return (
    <div className="max-w-xl mx-auto">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-ink-800">
        
        <div
          className="flex transition-transform duration-400 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {steps.map((step) => (
            <div key={step.n} className="w-full shrink-0 px-10 py-12 text-center">
              <span className="inline-flex items-center justify-center bg-ink-900 text-seal font-mono text-sm font-bold w-12 h-12 rounded-full border-2 border-seal/60 mb-5">
                {step.n}
              </span>
              <h3 className="text-paper text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-paper/60 text-sm leading-relaxed max-w-sm mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={goPrev}
          aria-label="Previous step"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink-900/80 border border-white/15 text-paper/70 hover:text-seal hover:border-seal/50 transition-colors flex items-center justify-center"
        >
          ‹
        </button>
        <button
          onClick={goNext}
          aria-label="Next step"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink-900/80 border border-white/15 text-paper/70 hover:text-seal hover:border-seal/50 transition-colors flex items-center justify-center"
        >
          ›
        </button>
      </div>

      {/* dot indicators */}
      <div className="flex justify-center gap-2 mt-5">
        {steps.map((step, i) => (
          <button
            key={step.n}
            onClick={() => setIndex(i)}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-seal" : "w-1.5 bg-white/20 hover:bg-white/35"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate])
  
  const [selected, setSelected] = useState(sampleClauses[0]);

  return (
    <div className="bg-ink-900 mx-auto px-16">
      {/* Hero — asymmetric split */}
      <section className="grid md:grid-cols-2 gap-12 items-center py-16 md:py-20">
        <div>
          <span className="inline-block bg-seal text-ink-900 font-mono text-[0.65rem] font-semibold tracking-widest px-3 py-1 rounded-sm mb-6">
            SMART CONTRACT SCANNER
          </span>
          <h1 className="text-4xl md:text-5xl text-paper mb-5 leading-[1.1]">
            Know the risk<br />before you sign
          </h1>
          <p className="text-paper/75 text-base md:text-lg mb-8 max-w-md">
            Upload your rent agreement. We'll conduct a{" "}
            <span className="text-highlighter dark:text-highlighter-bright">comprehensive clause by clause analysis</span> - identifying unbalanced terms,{" "}
            <span className="text-redline dark:text-redline-bright">hidden financial risks</span>, and
            critical protections you may be missing.
          </p>
          <div className="flex gap-4">
            <Link
              to="/register"
              className="bg-seal text-ink-900 px-7 py-3 rounded-sm font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(201,162,39,0.35)] transition-all"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="text-paper border border-paper/25 px-7 py-3 rounded-sm font-semibold text-sm hover:border-paper/60 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
        <div className="rotate-2 hover:rotate-0 transition-transform duration-500">
          <MarkedUpDoc />
        </div>
      </section>

      {/* Scrolling ticker */}
      <section className="border-y border-white/15 py-4 mb-20 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-paper/35 font-mono text-xs tracking-widest mx-6">
              {item} <span className="text-seal/50 mx-6">·</span>
            </span>
          ))}
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-paper text-3xl mb-1 text-center">How the analysis works</h2>
        <p className="text-paper/50 text-sm mb-10 text-center">Four steps, in order, each one feeding the next</p>

        <PipelineCarousel steps={pipeline} />
      </section>

      {/* Interactive demo — mock document viewer window */}
      <section className="mb-24">
        <h2 className="text-paper text-2xl text-center mb-1">See it in action</h2>
        <p className="text-paper/50 text-center text-sm mb-8">Select a clause to see how it's flagged</p>

        <div className="bg-ink-800 border border-white/10 rounded-lg overflow-hidden shadow-2xl">
          
          <div className="flex items-center gap-2 px-4 py-3 bg-black/20 border-b border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-redline/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-highlighter/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-stamp-green/70" />
            <span className="text-paper/40 font-mono text-xs ml-3">sample_agreement.pdf — analysis preview</span>
          </div>

          <div className="p-6">
            <div className="flex gap-2 flex-wrap mb-5">
              {sampleClauses.map((clause) => (
                <button
                  key={clause.id}
                  onClick={() => setSelected(clause)}
                  className={`px-3.5 py-1.5 rounded-sm text-sm font-medium border transition-colors ${
                    selected.id === clause.id
                      ? "bg-seal text-ink-900 border-seal"
                      : "text-paper/60 border-white/15 hover:border-white/35"
                  }`}
                >
                  {clause.label}
                </button>
              ))}
            </div>

            <div
              key={selected.id}
              className={`bg-ink-900/60 p-5 rounded-sm border-l-4 ${riskStyles[selected.risk].border} animate-[fadeIn_0.25s_ease]`}
            >
              <div className="flex gap-3 items-center mb-3">
                <span className={`${riskStyles[selected.risk].badge} px-2.5 py-1 rounded-sm text-[0.68rem] font-mono font-semibold tracking-wide`}>
                  {selected.risk.toUpperCase()}
                </span>
                <span className="text-paper font-semibold text-sm">{selected.label}</span>
              </div>
              <p className="italic text-paper/55 text-sm mb-3 pl-3 border-l-2 border-white/15">
                {selected.text}
              </p>
              <p className="text-paper/85 text-sm leading-relaxed">{selected.explanation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dashed border-white/15 py-8 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-paper/40 text-xs">
            Built by <span className="text-paper/70 font-medium">Shreya</span>
          </p>
          {/* <div className="flex gap-2 flex-wrap justify-center">
            {["React", "Node.js", "MongoDB", "Groq", "Vector Search"].map((tech) => (
              <span key={tech} className="text-paper/40 font-mono text-[0.65rem] border border-white/10 px-2 py-1 rounded-sm">
                {tech}
              </span>
            ))}
          </div> */}
        </div>
        <p className="text-paper/30 text-xs italic text-center mt-6">
          This tool provides informational analysis only and is not a substitute for professional legal advice.
        </p>
      </footer>
    </div>
  );
}