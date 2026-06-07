import { useState } from "react";

interface PolicyInsight {
  id: number;
  icon: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  title: string;
  evidence: string;
  recommendation: string;
  states?: string[];
  priority: "High" | "Medium" | "Low";
}

const insights: PolicyInsight[] = [
  {
    id: 1,
    icon: "🎯",
    category: "Employment scheme",
    categoryColor: "#A32D2D",
    categoryBg: "#FCEBEB",
    title: "Expand MGNREGA in chronically high-unemployment states",
    evidence:
      "Tripura (28.35%), Haryana (26.28%), Jharkhand (20.59%) and Bihar (18.92%) recorded the highest average unemployment rates across the entire 2019–2020 period — well above the national average of 11.91%.",
    recommendation:
      "Increase MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) work-days allocation from 100 to 150 days in these states, and fast-track wage disbursement to reduce seasonal displacement.",
    states: ["Tripura", "Haryana", "Jharkhand", "Bihar"],
    priority: "High",
  },
  {
    id: 2,
    icon: "🏥",
    category: "Crisis preparedness",
    categoryColor: "#854F0B",
    categoryBg: "#FAEEDA",
    title: "Build a national unemployment shock buffer fund",
    evidence:
      "The COVID-19 lockdown caused unemployment to spike from a pre-lockdown average of ~10% to a peak of 76.74% within 6 weeks (Mar–Apr 2020). Labour participation simultaneously fell by 2.4%, indicating mass workforce exit.",
    recommendation:
      "Establish a statutory Unemployment Insurance Fund covering informal workers — who make up ~90% of India's workforce. Auto-trigger direct benefit transfers when state-level unemployment exceeds 20% for two consecutive months.",
    priority: "High",
  },
  {
    id: 3,
    icon: "🌾",
    category: "Agricultural policy",
    categoryColor: "#0F6E56",
    categoryBg: "#E1F5EE",
    title: "Smooth seasonal agricultural employment gaps",
    evidence:
      "States classified in the Low Impact Zone (resilient through agricultural safety nets) showed recovery by Jul–Aug 2020 as Kharif sowing began. Jan–Feb consistently show elevated unemployment due to the rabi harvest off-season.",
    recommendation:
      "Introduce inter-season skill-bridging programs in rural areas during Jan–Mar to absorb agricultural workers in allied sectors (food processing, cold-chain logistics, rural infrastructure).",
    priority: "Medium",
  },
  {
    id: 4,
    icon: "🏙️",
    category: "Urban labour",
    categoryColor: "#185FA5",
    categoryBg: "#E6F1FB",
    title: "Protect urban informal workers during lockdown events",
    evidence:
      "Urban states like Tamil Nadu (49.83% peak) and Maharashtra (20.12% peak) saw disproportionate shocks. The Extended dataset's Moderate Impact Zone — significant volatility but steady job-seeking — corresponds to urban-industrial belts.",
    recommendation:
      "Mandate a 3-month portable social security cover for gig and contract workers, activated automatically when city-level unemployment exceeds 15%. Pair with subsidised re-skilling vouchers redeemable at ITIs.",
    priority: "High",
  },
  {
    id: 5,
    icon: "📊",
    category: "Data & monitoring",
    categoryColor: "#534AB7",
    categoryBg: "#EEEDFE",
    title: "Move to monthly real-time unemployment tracking",
    evidence:
      "This dataset covers only May 2019 – Nov 2020 at monthly granularity. The COVID shock shows that a 6-week lag in unemployment data meant policy responses were reactive rather than anticipatory.",
    recommendation:
      "Deploy a fortnightly Labour Force Survey with state-level granularity, integrated with EPFO registration data and GST payroll records to produce a near-real-time employment index that triggers policy instruments automatically.",
    priority: "Medium",
  },
];

const priorityStyle: Record<string, { bg: string; color: string }> = {
  High:   { bg: "#FCEBEB", color: "#A32D2D" },
  Medium: { bg: "#FAEEDA", color: "#854F0B" },
  Low:    { bg: "#E1F5EE", color: "#0F6E56" },
};

export default function PolicyInsights() {
  const [expanded, setExpanded] = useState<number | null>(1);

  return (
    <div style={{ padding: "0 0 1rem" }}>

      {/* Header stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "High priority actions", value: "3", color: "#A32D2D", bg: "#FCEBEB" },
          { label: "States needing intervention", value: "4",  color: "#854F0B", bg: "#FAEEDA" },
          { label: "Policy areas covered",  value: "5",  color: "#185FA5", bg: "#E6F1FB" },
        ].map((s) => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 10, padding: "12px 14px",
            borderLeft: `3px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#1a1a1a" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Insight cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {insights.map((insight) => {
          const isOpen = expanded === insight.id;
          const ps = priorityStyle[insight.priority];
          return (
            <div
              key={insight.id}
              style={{
                background: "white",
                border: `0.5px solid ${isOpen ? insight.categoryColor : "#e5e5e5"}`,
                borderRadius: 10,
                overflow: "hidden",
                transition: "border-color .2s",
              }}
            >
              {/* Card header */}
              <div
                onClick={() => setExpanded(isOpen ? null : insight.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", cursor: "pointer",
                  background: isOpen ? `${insight.categoryBg}66` : "white",
                  transition: "background .2s",
                }}
              >
                <span style={{ fontSize: 20 }}>{insight.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 500, padding: "2px 7px",
                      borderRadius: 4, background: insight.categoryBg, color: insight.categoryColor,
                    }}>
                      {insight.category}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 500, padding: "2px 7px",
                      borderRadius: 4, background: ps.bg, color: ps.color,
                    }}>
                      {insight.priority} priority
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.4 }}>
                    {insight.title}
                  </div>
                </div>
                <span style={{
                  fontSize: 16, color: "#aaa", transform: isOpen ? "rotate(180deg)" : "none",
                  transition: "transform .2s", flexShrink: 0,
                }}>
                  ▾
                </span>
              </div>

              {/* Expanded body */}
              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: `0.5px solid ${insight.categoryColor}22` }}>
                  <div style={{
                    marginTop: 12, padding: "10px 12px",
                    background: "#f8f9fa", borderRadius: 8,
                    borderLeft: `3px solid #ddd`,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#888", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".03em" }}>
                      Evidence from data
                    </div>
                    <div style={{ fontSize: 12, color: "#444", lineHeight: 1.65 }}>
                      {insight.evidence}
                    </div>
                  </div>

                  <div style={{
                    marginTop: 10, padding: "10px 12px",
                    background: `${insight.categoryBg}88`, borderRadius: 8,
                    borderLeft: `3px solid ${insight.categoryColor}`,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: insight.categoryColor, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".03em" }}>
                      Policy recommendation
                    </div>
                    <div style={{ fontSize: 12, color: "#333", lineHeight: 1.65 }}>
                      {insight.recommendation}
                    </div>
                  </div>

                  {insight.states && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: "#888", alignSelf: "center" }}>Affected states:</span>
                      {insight.states.map((s) => (
                        <span key={s} style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 4,
                          background: "#f0f0f0", color: "#444",
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: 16, padding: "10px 14px", background: "#f8f9fa",
        borderRadius: 8, fontSize: 11, color: "#888", lineHeight: 1.6,
      }}>
        Insights derived from CMIE unemployment dataset (May 2019 – Nov 2020), 1,007 records across 28 Indian states.
        Statistical methods: regression analysis, K-Means clustering (K=3), Isolation Forest anomaly detection.
      </div>
    </div>
  );
}