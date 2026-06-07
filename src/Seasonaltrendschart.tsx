import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

// ── paste your real rawData import in place of this inline sample ──
const rawData = [
  { region: "Andhra Pradesh", date: "31-05-2019", unemploymentRate: 3.65, labourParticipationRate: 43.24, area: "Rural" },
  { region: "Andhra Pradesh", date: "30-06-2019", unemploymentRate: 3.05, labourParticipationRate: 42.05, area: "Rural" },
  { region: "Andhra Pradesh", date: "31-07-2019", unemploymentRate: 3.75, labourParticipationRate: 43.5,  area: "Rural" },
  { region: "Andhra Pradesh", date: "31-08-2019", unemploymentRate: 3.32, labourParticipationRate: 43.97, area: "Rural" },
  { region: "Andhra Pradesh", date: "30-09-2019", unemploymentRate: 5.17, labourParticipationRate: 44.68, area: "Rural" },
  { region: "Andhra Pradesh", date: "31-10-2019", unemploymentRate: 3.52, labourParticipationRate: 43.01, area: "Rural" },
  { region: "Andhra Pradesh", date: "30-11-2019", unemploymentRate: 4.12, labourParticipationRate: 41.0,  area: "Rural" },
  { region: "Andhra Pradesh", date: "31-12-2019", unemploymentRate: 4.38, labourParticipationRate: 45.14, area: "Rural" },
  { region: "Andhra Pradesh", date: "31-01-2020", unemploymentRate: 4.84, labourParticipationRate: 43.46, area: "Rural" },
  { region: "Andhra Pradesh", date: "29-02-2020", unemploymentRate: 5.91, labourParticipationRate: 42.83, area: "Rural" },
  { region: "Andhra Pradesh", date: "31-03-2020", unemploymentRate: 5.79, labourParticipationRate: 39.18, area: "Rural" },
  { region: "Andhra Pradesh", date: "30-04-2020", unemploymentRate: 16.29, labourParticipationRate: 36.03, area: "Rural" },
  { region: "Andhra Pradesh", date: "31-05-2020", unemploymentRate: 14.46, labourParticipationRate: 38.16, area: "Rural" },
  { region: "Bihar",          date: "31-05-2019", unemploymentRate: 9.27,  labourParticipationRate: 39.75, area: "Rural" },
  { region: "Bihar",          date: "31-01-2020", unemploymentRate: 10.61, labourParticipationRate: 37.72, area: "Rural" },
  { region: "Bihar",          date: "31-03-2020", unemploymentRate: 12.01, labourParticipationRate: 38.11, area: "Rural" },
  { region: "Bihar",          date: "30-04-2020", unemploymentRate: 45.09, labourParticipationRate: 38.14, area: "Rural" },
  { region: "Bihar",          date: "31-05-2020", unemploymentRate: 46.26, labourParticipationRate: 38.97, area: "Rural" },
  { region: "Haryana",        date: "31-05-2019", unemploymentRate: 23.08, labourParticipationRate: 46.36, area: "Rural" },
  { region: "Haryana",        date: "31-03-2020", unemploymentRate: 25.12, labourParticipationRate: 44.21, area: "Rural" },
  { region: "Haryana",        date: "30-04-2020", unemploymentRate: 43.22, labourParticipationRate: 39.11, area: "Rural" },
  { region: "Tamil Nadu",     date: "31-05-2019", unemploymentRate: 0.97,  labourParticipationRate: 40.12, area: "Rural" },
  { region: "Tamil Nadu",     date: "30-04-2020", unemploymentRate: 49.83, labourParticipationRate: 35.21, area: "Rural" },
  { region: "Tamil Nadu",     date: "31-05-2020", unemploymentRate: 33.12, labourParticipationRate: 37.42, area: "Rural" },
  { region: "Maharashtra",    date: "31-05-2019", unemploymentRate: 4.12,  labourParticipationRate: 45.21, area: "Rural" },
  { region: "Maharashtra",    date: "30-04-2020", unemploymentRate: 20.12, labourParticipationRate: 40.21, area: "Rural" },
  { region: "Maharashtra",    date: "31-05-2020", unemploymentRate: 15.34, labourParticipationRate: 41.56, area: "Rural" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const COVID_MONTHS = [3, 4, 5]; // Apr, May, Jun (0-indexed)

function parseDate(dateStr: string): Date {
  const [d, m, y] = dateStr.trim().split("-").map(Number);
  return new Date(y, m - 1, d);
}

interface MonthlyPoint {
  month: string;
  monthIndex: number;
  avgRate: number;
  avgLPR: number;
  count: number;
  isCovid: boolean;
}

interface PhaseStats {
  label: string;
  period: string;
  avg: number;
  color: string;
  bg: string;
}

const COLORS = {
  rate:   "#378ADD",
  lpr:    "#1D9E75",
  covid:  "#E24B4A",
  normal: "#378ADD",
};

export default function SeasonalTrendsChart() {
  const [metric, setMetric] = useState<"rate" | "lpr">("rate");

  const monthlyData = useMemo<MonthlyPoint[]>(() => {
    const buckets: Record<number, { rates: number[]; lprs: number[] }> = {};
    for (let i = 0; i < 12; i++) buckets[i] = { rates: [], lprs: [] };

    rawData.forEach((d) => {
      const date = parseDate(d.date);
      const m = date.getMonth();
      buckets[m].rates.push(d.unemploymentRate);
      buckets[m].lprs.push(d.labourParticipationRate);
    });

    return MONTHS.map((month, i) => {
      const b = buckets[i];
      const avgRate = b.rates.length ? b.rates.reduce((a, c) => a + c, 0) / b.rates.length : 0;
      const avgLPR  = b.lprs.length  ? b.lprs.reduce((a, c)  => a + c, 0) / b.lprs.length  : 0;
      return {
        month,
        monthIndex: i,
        avgRate:  parseFloat(avgRate.toFixed(2)),
        avgLPR:   parseFloat(avgLPR.toFixed(2)),
        count:    b.rates.length,
        isCovid:  COVID_MONTHS.includes(i),
      };
    });
  }, []);

  const phaseStats = useMemo<PhaseStats[]>(() => {
    const pre = rawData.filter((d) => {
      const date = parseDate(d.date);
      return date < new Date(2020, 2, 1);
    });
    const during = rawData.filter((d) => {
      const date = parseDate(d.date);
      return date >= new Date(2020, 2, 1) && date <= new Date(2020, 5, 30);
    });
    const post = rawData.filter((d) => {
      const date = parseDate(d.date);
      return date > new Date(2020, 5, 30);
    });

    const avg = (arr: typeof rawData) =>
      arr.length ? parseFloat((arr.reduce((s, d) => s + d.unemploymentRate, 0) / arr.length).toFixed(2)) : 0;

    return [
      { label: "Pre-COVID",    period: "May 2019 – Feb 2020", avg: avg(pre),    color: "#1D9E75", bg: "#E1F5EE" },
      { label: "Lockdown",     period: "Mar 2020 – Jun 2020", avg: avg(during), color: "#E24B4A", bg: "#FCEBEB" },
      { label: "Recovery",     period: "Jul 2020 – Nov 2020", avg: avg(post),   color: "#BA7517", bg: "#FAEEDA" },
    ];
  }, []);

  const overallAvg = useMemo(() => {
    const active = monthlyData.filter((d) => d.count > 0);
    return active.length
      ? parseFloat((active.reduce((s, d) => s + d.avgRate, 0) / active.length).toFixed(2))
      : 0;
  }, [monthlyData]);

  const activeMetric   = metric === "rate" ? "avgRate" : "avgLPR";
  const metricLabel    = metric === "rate" ? "Avg unemployment rate (%)" : "Avg labour participation rate (%)";
  const metricColor    = metric === "rate" ? COLORS.rate : COLORS.lpr;

  const CustomBar = (props: any) => {
    const { x, y, width, height, monthIndex, isCovid } = props;
    return (
      <rect
        x={x} y={y} width={width} height={height}
        fill={isCovid ? COLORS.covid : metricColor}
        opacity={0.85}
        rx={3}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = monthlyData.find((m) => m.month === label);
    return (
      <div style={{
        background: "white", border: "0.5px solid #e0e0e0",
        borderRadius: 8, padding: "10px 14px", fontSize: 13,
      }}>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>
          {MONTH_FULL[d?.monthIndex ?? 0]}
          {d?.isCovid && (
            <span style={{ marginLeft: 6, fontSize: 11, background: "#FCEBEB", color: "#A32D2D", padding: "1px 6px", borderRadius: 4 }}>
              COVID peak
            </span>
          )}
        </div>
        <div style={{ color: "#555" }}>
          {metricLabel.split(" (")[0]}: <strong>{payload[0]?.value}%</strong>
        </div>
        <div style={{ color: "#888", fontSize: 11, marginTop: 2 }}>
          {d?.count} data point{d?.count !== 1 ? "s" : ""}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "0 0 1rem" }}>

      {/* Phase comparison cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {phaseStats.map((p) => (
          <div key={p.label} style={{
            background: p.bg, borderRadius: 10,
            padding: "12px 14px",
            borderLeft: `3px solid ${p.color}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: p.color, marginBottom: 2 }}>{p.label}</div>
            <div style={{ fontSize: 11, color: "#777", marginBottom: 6 }}>{p.period}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#1a1a1a" }}>{p.avg}%</div>
            <div style={{ fontSize: 11, color: "#888" }}>avg unemployment</div>
          </div>
        ))}
      </div>

      {/* Metric toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["rate", "lpr"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            style={{
              fontSize: 12, padding: "5px 14px", borderRadius: 6, cursor: "pointer",
              border: metric === m ? `1.5px solid ${m === "rate" ? COLORS.rate : COLORS.lpr}` : "1px solid #ddd",
              background: metric === m ? (m === "rate" ? "#E6F1FB" : "#E1F5EE") : "white",
              color: metric === m ? (m === "rate" ? "#185FA5" : "#0F6E56") : "#555",
              fontWeight: metric === m ? 500 : 400,
              transition: "all .15s",
            }}
          >
            {m === "rate" ? "Unemployment rate" : "Labour participation"}
          </button>
        ))}
      </div>

      {/* Seasonal bar chart */}
      <div style={{ position: "relative", width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#aaa" }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            {metric === "rate" && (
              <ReferenceLine
                y={overallAvg} stroke="#378ADD" strokeDasharray="4 4"
                label={{ value: `Avg ${overallAvg}%`, fill: "#378ADD", fontSize: 11, position: "insideTopRight" }}
              />
            )}
            <Bar dataKey={activeMetric} shape={<CustomBar />} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12, color: "#777" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: metricColor, display: "inline-block" }} />
          Normal months
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.covid, display: "inline-block" }} />
          COVID-19 peak months (Apr–Jun 2020)
        </span>
      </div>

      {/* Key observations */}
      <div style={{
        marginTop: 18, background: "#f8f9fa", borderRadius: 10,
        padding: "12px 16px", fontSize: 12, lineHeight: 1.7,
      }}>
        <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 6, color: "#1a1a1a" }}>
          Key seasonal patterns
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#444" }}>
          <li>Jan–Feb tend to show elevated rates — agricultural rabi harvest off-season reduces rural employment.</li>
          <li>Apr–May 2020 show a dramatic spike caused by the COVID-19 national lockdown.</li>
          <li>Jul–Aug show a partial recovery as lockdown restrictions eased and Kharif sowing began.</li>
          <li>Oct–Nov are historically the lowest unemployment months — post-harvest agricultural activity peaks.</li>
        </ul>
      </div>
    </div>
  );
}