import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Users, MapPin, AlertTriangle, Filter,
  PieChart as PieIcon, Activity, Download, RefreshCcw,
  Monitor, Database, BarChart3, Layers, ChevronRight,
  BrainCircuit, Code2, Play, Terminal, Leaf, FileText,
  Sun, CloudRain, Sprout, Building2, ShieldCheck
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, Cell, PieChart, Pie, Legend,
  LineChart, Line, ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getProcessedData } from './data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BRAND_BLUE   = '#2563eb';
const BRAND_RED    = '#dc2626';
const BRAND_GREEN  = '#059669';
const BRAND_AMBER  = '#d97706';
const BRAND_PURPLE = '#7c3aed';

const PALETTE = ['#2563eb','#059669','#d97706','#dc2626','#7c3aed','#db2777','#0891b2'];

// ─── helpers ─────────────────────────────────────────────────────────────────
function parseDate(dateStr: string): Date {
  const [d, m, y] = dateStr.trim().split('-').map(Number);
  return new Date(y, m - 1, d);
}

type TabId = 'overview' | 'regions' | 'seasonal' | 'mining' | 'policy' | 'details';

// ─── App ──────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [selectedRegion,  setSelectedRegion]  = useState('All');
  const [selectedSource,  setSelectedSource]  = useState<'All'|'Standard'|'Extended'>('All');
  const [isRefreshing,    setIsRefreshing]     = useState(false);
  const [activeTab,       setActiveTab]        = useState<TabId>('overview');
  const [logs,            setLogs]             = useState<string[]>(['[READY] Awaiting mining trigger...']);
  const [currentProgress, setCurrentProgress]  = useState(0);
  const [isProcessing,    setIsProcessing]     = useState(false);
  const [expandedPolicy,  setExpandedPolicy]   = useState<number|null>(1);
  
  // LIVE DATA STATE
  const [minedData, setMinedData] = useState<any[]>([]);
  // Function to load data from Python Backend
  const loadLatestResults = async () => {
    try {
      const host = window.location.port === '5173' ? 'http://127.0.0.1:5000' : '';
      const response = await fetch(`${host}/api/results`);
      const json = await response.json();
      if (json && json.length > 0) {
         // Process dates for Recharts
         const processed = json.map((d: any) => ({
            ...d,
            region: d.region || d.Region,
            unemploymentRate: d.unemployment_rate || d['Estimated Unemployment Rate (%)'],
            labourParticipationRate: d.participation_rate || d['Estimated Labour Participation Rate (%)'],
            employed: d.employed || d['Estimated Employed'],
            formattedDate: d.Date
         }));
         setMinedData(processed);
      }
    } catch (err) {
      console.log("Backend not active, using sample data.");
    }
  };
  // Load on startup
  React.useEffect(() => { loadLatestResults(); }, []);
  const data = useMemo(() => minedData.length > 0 ? minedData : getProcessedData(), [minedData]);
  // ── pipeline ──────────────────────────────────────────────────────────────
  const runPipeline = async () => {
    setIsProcessing(true);
    setCurrentProgress(0);
    setActiveTab('mining');
    setLogs(['[START] Connecting to Unified Engine...', '[PROCESS] API: /api/mine']);
    try {
      const host = window.location.port === '5173' ? 'http://127.0.0.1:5000' : '';
      const response = await fetch(`${host}/api/mine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error("Server Error");
      const steps = [
        { msg: '[CLEAN] data_loader: Scanning archive folder', delay: 500 },
        { msg: '[DL] neural_network.py: Training MLP Brain',   delay: 1500 },
        { msg: '[MINING] clustering.py: Calculating impact zones', delay: 2500 },
        { msg: '[SUCCESS] Mining Finished. Updating Dashboard...', delay: 4500 },
      ];
      steps.forEach(({ msg, delay }, i) => {
        setTimeout(() => {
          setLogs(p => [...p, msg]);
          setCurrentProgress(((i + 1) / steps.length) * 100);
          if (i === steps.length - 1) {
            setIsProcessing(false);
            loadLatestResults(); // <--- REFRESH CHARTS WITH NEW CSV DATA
          }
        }, delay);
      });
    } catch (err) {
      setLogs(p => [...p, "!! CONNECTION ERROR: Ensure 'python app.py' is running on Port 5000."]);
      setIsProcessing(false);
    }
  };

  // ── derived data ──────────────────────────────────────────────────────────
  // Only show state-level regions (Standard dataset) in the region slicer
  const stateRegions = useMemo(() => {
    const standardRegions = Array.from(new Set(
      data.filter(d => d.source === 'Standard').map(d => d.region)
    )).sort();
    return ['All', ...standardRegions];
  }, [data]);

  const filteredData = useMemo(() => {
    let f = data;
    if (selectedRegion !== 'All') f = f.filter(d => d.region === selectedRegion);
    if (selectedSource  !== 'All') f = f.filter(d => d.source === selectedSource);
    return f;
  }, [data, selectedRegion, selectedSource]);

  // ── FIX 1: Aggregate time-series by date for the overview chart ────────────
  // Average unemployment rate across all selected regions per date
  const timeSeriesData = useMemo(() => {
    const byDate = new Map<string, { rates: number[]; formattedDate: string; timestamp: number }>();
    filteredData.forEach(d => {
      if (!byDate.has(d.date)) {
        byDate.set(d.date, { rates: [], formattedDate: d.formattedDate, timestamp: d.timestamp });
      }
      byDate.get(d.date)!.rates.push(d.unemploymentRate);
    });
    return Array.from(byDate.values())
      .map(v => ({
        formattedDate: v.formattedDate,
        timestamp: v.timestamp,
        unemploymentRate: parseFloat((v.rates.reduce((a,c) => a+c, 0) / v.rates.length).toFixed(2)),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredData]);

  const stats = useMemo(() => {
    const src = filteredData.length ? filteredData : [{ unemploymentRate: 0, labourParticipationRate: 0, employed: 0 }];
    const avg  = src.reduce((a, c) => a + (c.unemploymentRate         || 0), 0) / src.length;
    const peak = Math.max(...src.map(d => d.unemploymentRate || 0), 0);
    const lpr  = src.reduce((a, c) => a + (c.labourParticipationRate  || 0), 0) / src.length;
    const emp  = src.reduce((a, c) => a + (c.employed                 || 0), 0) / src.length;
    return { avg: avg.toFixed(2), peak: peak.toFixed(2), lpr: lpr.toFixed(2), emp: (emp / 1_000_000).toFixed(2) };
  }, [filteredData]);

  const sourceData = useMemo(() => ([
    { name: 'Standard', value: data.filter(d => d.source === 'Standard').length },
    { name: 'Extended', value: data.filter(d => d.source === 'Extended').length },
  ]), [data]);

  // ── FIX 2: Regional analysis — only Standard (state-level) for meaningful comparison ──
  const regionalAnalysis = useMemo(() => {
    const stateData = data.filter(d => d.source === 'Standard');
    const grp = stateData.reduce((acc, cur) => {
      if (!acc[cur.region]) acc[cur.region] = { region: cur.region, rate: 0, count: 0 };
      acc[cur.region].rate  += cur.unemploymentRate;
      acc[cur.region].count += 1;
      return acc;
    }, {} as Record<string, { region: string; rate: number; count: number }>);
    return Object.values(grp)
      .map(g => ({ region: g.region, rate: parseFloat((g.rate / g.count).toFixed(2)) }))
      .sort((a, b) => b.rate - a.rate);
  }, [data]);

  // ── FIX 3: Seasonal — properly tag isCovid and pass to bar shape ──────────
  const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  // Apr=3, May=4, Jun=5 (0-indexed) are COVID months
  const COVID_MONTH_INDICES = new Set([3, 4, 5]);

  const seasonalData = useMemo(() => {
    const buckets: Record<number, { rates: number[]; lprs: number[] }> = {};
    for (let i = 0; i < 12; i++) buckets[i] = { rates: [], lprs: [] };
    // Use only Standard data for seasonal to avoid double-counting
    data.filter(d => d.source === 'Standard').forEach(d => {
      const date = parseDate(d.date);
      const m = date.getMonth();
      buckets[m].rates.push(d.unemploymentRate);
      buckets[m].lprs.push(d.labourParticipationRate);
    });
    return MONTH_SHORT.map((month, i) => ({
      month,
      avgRate: buckets[i].rates.length
        ? parseFloat((buckets[i].rates.reduce((a,c)=>a+c,0)/buckets[i].rates.length).toFixed(2)) : 0,
      avgLPR: buckets[i].lprs.length
        ? parseFloat((buckets[i].lprs.reduce((a,c)=>a+c,0)/buckets[i].lprs.length).toFixed(2))  : 0,
      count: buckets[i].rates.length,
      isCovid: COVID_MONTH_INDICES.has(i),
    }));
  }, [data]);

  const seasonalAvg = useMemo(() => {
    const active = seasonalData.filter(d => d.count > 0);
    return active.length ? parseFloat((active.reduce((s,d)=>s+d.avgRate,0)/active.length).toFixed(2)) : 0;
  }, [seasonalData]);

  // ── COVID phases ──────────────────────────────────────────────────────────
  const phases = useMemo(() => {
    // Use Standard data only for phase analysis
    const std = data.filter(d => d.source === 'Standard');
    const pre    = std.filter(d => parseDate(d.date) < new Date(2020,2,1));
    const during = std.filter(d => { const dt = parseDate(d.date); return dt >= new Date(2020,2,1) && dt <= new Date(2020,5,30); });
    const post   = std.filter(d => parseDate(d.date) > new Date(2020,5,30));
    const avg = (arr: typeof std) => arr.length ? parseFloat((arr.reduce((s,d)=>s+d.unemploymentRate,0)/arr.length).toFixed(2)) : 0;
    return [
      { label: 'Pre-COVID',  period: 'May 2019 – Feb 2020', avg: avg(pre),    color: BRAND_GREEN,  bg: '#d1fae5' },
      { label: 'Lockdown',   period: 'Mar 2020 – Jun 2020', avg: avg(during), color: BRAND_RED,    bg: '#fee2e2' },
      { label: 'Recovery',   period: 'Jul 2020 – Nov 2020', avg: avg(post),   color: BRAND_AMBER,  bg: '#fef3c7' },
    ];
  }, [data]);

  // ── policy insights ───────────────────────────────────────────────────────
  const policyInsights = [
    {
      id: 1, priority: 'High' as const,
      icon: <ShieldCheck size={18} className="text-red-600" />,
      category: 'Employment scheme', categoryColor: '#dc2626', categoryBg: '#fee2e2',
      title: 'Expand MGNREGA in chronically high-unemployment states',
      evidence: `Tripura (28.35%), Haryana (26.28%), Jharkhand (20.59%) and Bihar (18.92%) recorded the highest average unemployment rates — far above the national average of 11.91%.`,
      recommendation: 'Increase MGNREGA work-days from 100 to 150 in these states and fast-track wage disbursements to reduce seasonal displacement of agricultural workers.',
      states: ['Tripura', 'Haryana', 'Jharkhand', 'Bihar'],
    },
    {
      id: 2, priority: 'High' as const,
      icon: <AlertTriangle size={18} className="text-amber-600" />,
      category: 'Crisis preparedness', categoryColor: '#d97706', categoryBg: '#fef3c7',
      title: 'Build a national unemployment shock buffer fund',
      evidence: `COVID-19 lockdown caused unemployment to spike from ~${phases[0].avg}% (pre-COVID) to a peak of 76.74% within 6 weeks. Labour participation fell 2.4% simultaneously, signalling mass workforce exit.`,
      recommendation: 'Establish a statutory Unemployment Insurance Fund covering informal workers. Auto-trigger direct benefit transfers when state-level unemployment exceeds 20% for two consecutive months.',
      states: [],
    },
    {
      id: 3, priority: 'Medium' as const,
      icon: <Sprout size={18} className="text-green-600" />,
      category: 'Agricultural policy', categoryColor: '#059669', categoryBg: '#d1fae5',
      title: 'Bridge the rabi harvest off-season employment gap',
      evidence: 'Jan–Feb show elevated unemployment consistently due to the rabi harvest off-season. States in the Low Impact Zone showed early recovery in Jul–Aug 2020 when Kharif sowing began.',
      recommendation: 'Launch inter-season skill-bridging programs in food processing, cold-chain logistics, and rural infrastructure during Jan–Mar to absorb displaced agricultural workers.',
      states: [],
    },
    {
      id: 4, priority: 'High' as const,
      icon: <Building2 size={18} className="text-blue-600" />,
      category: 'Urban labour', categoryColor: '#2563eb', categoryBg: '#dbeafe',
      title: 'Protect urban informal workers during lockdown events',
      evidence: 'Tamil Nadu (49.83% peak) and Maharashtra (20.12% peak) saw disproportionate shocks. Urban-industrial states in the Moderate Impact Zone showed persistent volatility through Q3 2020.',
      recommendation: 'Mandate portable 3-month social security for gig and contract workers, auto-activated when city-level unemployment exceeds 15%. Pair with subsidised re-skilling vouchers at ITIs.',
      states: ['Tamil Nadu', 'Maharashtra'],
    },
    {
      id: 5, priority: 'Medium' as const,
      icon: <Activity size={18} className="text-purple-600" />,
      category: 'Data & monitoring', categoryColor: '#7c3aed', categoryBg: '#ede9fe',
      title: 'Shift to fortnightly real-time unemployment tracking',
      evidence: 'Monthly data granularity meant COVID policy responses were reactive. A 6-week detection lag between workforce exit and corrective stimulus was observed in the dataset.',
      recommendation: 'Deploy fortnightly Labour Force Surveys integrated with EPFO registration data and GST payroll records, producing a near-real-time employment index that triggers policy instruments automatically.',
      states: [],
    },
  ];

  const priorityBadge: Record<string, string> = {
    High: 'bg-red-50 text-red-600 border border-red-100',
    Medium: 'bg-amber-50 text-amber-600 border border-amber-100',
    Low: 'bg-green-50 text-green-600 border border-green-100',
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => { setIsRefreshing(false); setSelectedRegion('All'); setSelectedSource('All'); }, 800);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview',  label: 'Overview' },
    { id: 'regions',   label: 'Regional Analysis' },
    { id: 'seasonal',  label: 'Seasonal Trends' },
    { id: 'mining',    label: 'Mining Methods' },
    { id: 'policy',    label: 'Policy Insights' },
    { id: 'details',   label: 'Data Details' },
  ];

  // ── FIX 4: Custom bar properly reads isCovid from data payload ────────────
  const SeasonalBar = (props: any) => {
    const { x, y, width, height, isCovid } = props;
    if (!height || height <= 0) return null;
    return <rect x={x} y={y} width={width} height={height} fill={isCovid ? BRAND_RED : BRAND_BLUE} opacity={0.82} rx={3} />;
  };

  const SeasonalTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = seasonalData.find(m => m.month === label);
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-xs">
        <p className="font-bold text-slate-800 mb-1">{label} (all years)</p>
        {d?.isCovid && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full mr-1">COVID peak</span>}
        <p className="text-slate-500 mt-1">Avg rate: <strong className="text-slate-800">{payload[0]?.value}%</strong></p>
        <p className="text-slate-400">{d?.count} data points</p>
      </div>
    );
  };

  // ── FIX 5: Custom tooltip for the overview time-series ────────────────────
  const TimeSeriestooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-xs">
        <p className="font-bold text-slate-800 mb-1">{label}</p>
        <p className="text-slate-500">Avg rate: <strong className="text-slate-800">{payload[0]?.value}%</strong></p>
      </div>
    );
  };

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans selection:bg-blue-100 flex flex-col">

      {/* ── Header ── */}
      <header className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#f2c811] rounded flex items-center justify-center text-black font-bold text-sm shadow-sm border border-[#d2d0ce]">Pb</div>
          <h1 className="font-bold text-sm tracking-tight text-slate-800 flex items-center gap-2">
            Unemployment Analysis Report
            <span className="text-slate-400 font-normal">| Intelligence Dashboard</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
            <Monitor size={12} /> Live Presentation Mode
          </div>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-1">
            <button onClick={handleRefresh} className={cn('p-1.5 hover:bg-slate-100 rounded transition-all', isRefreshing && 'animate-spin text-blue-600')} title="Refresh Data">
              <RefreshCcw size={16} className="text-slate-500" />
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded transition-all" title="Download Report">
              <Download size={16} className="text-slate-500" />
            </button>
          </div>
          <button onClick={runPipeline} disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md shadow-blue-200 transition-all disabled:opacity-50">
            {isProcessing ? <RefreshCcw size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
            RUN MINING
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-6 overflow-y-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Datasets</span><ChevronRight size={10} /><span>Archive (7)</span><ChevronRight size={10} />
          <span className="text-blue-600">Mining Pipeline v2.0</span>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-8 items-center shrink-0">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Filter size={12} /> Region Slicer
            </label>
            <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[200px]">
              {stateRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Database size={12} /> Dataset Source
            </label>
            <div className="flex p-1 bg-slate-100 rounded-xl">
              {(['All','Standard','Extended'] as const).map(s => (
                <button key={s} onClick={() => setSelectedSource(s)}
                  className={cn('px-4 py-1.5 text-xs font-bold rounded-lg transition-all',
                    selectedSource === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Analysis Period</p>
              <p className="text-xs font-bold text-slate-700">May 2019 – Nov 2020</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 hidden md:block" />
            <div className="flex flex-col items-center">
              <Activity size={20} className="text-blue-500 animate-pulse" />
              <span className="text-[8px] font-bold text-blue-500 uppercase mt-1">Working Feed</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn('px-5 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap',
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/20'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Avg Unemployment Rate"  value={`${stats.avg}%`}  icon={<TrendingUp className="text-blue-600" />}    trend="+12% YoY"      trendColor="red"   />
                <KpiCard title="Peak Observed Rate"     value={`${stats.peak}%`} icon={<AlertTriangle className="text-red-600" />}  trend="Lockdown Shock" trendColor="red"   isWarning />
                <KpiCard title="Labour Participation"   value={`${stats.lpr}%`}  icon={<Users className="text-emerald-600" />}      trend="−2.4% vs 2019"  trendColor="amber" />
                <KpiCard title="Avg Employed (Est.)"    value={`${stats.emp}M`}  icon={<MapPin className="text-orange-600" />}      trend="Regional Sample" trendColor="green" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">Unemployment Trends Analysis</h3>
                      <p className="text-xs text-slate-400">
                        Monthly average across {selectedRegion === 'All' ? 'all regions' : selectedRegion} · COVID spike visible Apr–May 2020
                        {' '}· <span className="font-semibold">{timeSeriesData.length} data points</span>
                      </p>
                    </div>
                  </div>
                  {/* COVID annotation band */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-bold">▲ Lockdown shock: peak 76.74%</span>
                    <span className="text-[10px] bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-bold">↓ Recovery from Jul 2020</span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold">Showing date-averaged rates</span>
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false}
                          interval={Math.floor(timeSeriesData.length / 10)} />
                        <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                        <Tooltip content={<TimeSeriestooltip />} />
                        <Area type="monotone" dataKey="unemploymentRate" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#gr)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="font-bold text-lg text-slate-800 mb-1 flex items-center gap-2">
                    <PieIcon size={18} className="text-blue-500" /> Data Ingestion Mix
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Composition of historical and extended datasets</p>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                            {sourceData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => [`${v} records`]} />
                          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize:'11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-2xl font-black text-slate-800">{data.length.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total records</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── REGIONAL ANALYSIS ── */}
          {activeTab === 'regions' && (
            <motion.div key="regions" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-500" /> Average Rate by State
                </h3>
                <p className="text-xs text-slate-400 mb-4">Standard dataset · state-level averages (May 2019 – Jun 2020)</p>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionalAnalysis} layout="vertical" margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                      <YAxis dataKey="region" type="category" fontSize={9} axisLine={false} tickLine={false} width={110} />
                      <Tooltip formatter={(v:any) => [`${v}%`, 'Avg rate']} />
                      <Bar dataKey="rate" radius={[0,4,4,0]} barSize={12}>
                        {regionalAnalysis.map((r, i) => (
                          <Cell key={i} fill={r.rate > 20 ? BRAND_RED : r.rate > 12 ? BRAND_AMBER : BRAND_BLUE} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex gap-4 mt-3 text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block"/>{'> 20% (High)'}</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block"/>{'> 12% (Moderate)'}</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block"/>{'≤ 12% (Low)'}</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Layers size={18} className="text-blue-500" /> High-Impact Regions
                </h3>
                <p className="text-xs text-slate-400 mb-5">Top 5 states with highest average unemployment during the observed period.</p>
                <div className="space-y-3">
                  {regionalAnalysis.slice(0, 5).map((r, i) => (
                    <div key={r.region} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-slate-400 border border-slate-200 text-sm">#{i+1}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{r.region}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full transition-all" style={{ width:`${(r.rate/regionalAnalysis[0].rate)*100}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 min-w-[42px] text-right">{r.rate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extended dataset summary */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Extended Dataset — Regional Zones</p>
                  {(['South','North','East','West','Northeast'] as const).map(zone => {
                    const zoneData = data.filter(d => d.source === 'Extended' && d.region === zone);
                    if (!zoneData.length) return null;
                    const avg = parseFloat((zoneData.reduce((s,d)=>s+d.unemploymentRate,0)/zoneData.length).toFixed(2));
                    return (
                      <div key={zone} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <span className="text-xs font-semibold text-slate-600">{zone}</span>
                        <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full',
                          avg > 20 ? 'bg-red-50 text-red-600' : avg > 12 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}>
                          {avg}% avg
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SEASONAL TRENDS ── */}
          {activeTab === 'seasonal' && (
            <motion.div key="seasonal" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="space-y-6">
              {/* Phase cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {phases.map(p => (
                  <div key={p.label} style={{ borderLeftColor: p.color, background: p.bg }}
                    className="p-5 rounded-2xl border border-l-4 border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: p.color }}>{p.label}</p>
                    <p className="text-[11px] text-slate-500 mb-3">{p.period}</p>
                    <p className="text-3xl font-black text-slate-800">{p.avg}%</p>
                    <p className="text-[10px] text-slate-500 mt-1">avg unemployment</p>
                  </div>
                ))}
              </div>

              {/* Monthly bar chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Monthly Seasonal Pattern</h3>
                    <p className="text-xs text-slate-400">Average unemployment rate per calendar month · Standard dataset · all states combined</p>
                  </div>
                  <div className="flex gap-3 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500 inline-block"/>Normal</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 inline-block"/>COVID peak (Apr–Jun)</span>
                  </div>
                </div>
                <div className="h-[280px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seasonalData} margin={{ top:8, right:12, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize:12, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                      <Tooltip content={<SeasonalTooltip />} cursor={{ fill:'rgba(0,0,0,0.03)' }} />
                      <ReferenceLine y={seasonalAvg} stroke="#3b82f6" strokeDasharray="4 4"
                        label={{ value:`Avg ${seasonalAvg}%`, fill:'#3b82f6', fontSize:10, position:'insideTopRight' }} />
                      {/* FIX: Use Cell to colour each bar individually */}
                      <Bar dataKey="avgRate" radius={[3,3,0,0]} barSize={32}>
                        {seasonalData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isCovid ? BRAND_RED : BRAND_BLUE} opacity={0.82} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* LPR trend + insights row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-base text-slate-800 mb-1">Labour Participation Rate — seasonal</h3>
                  <p className="text-xs text-slate-400 mb-4">Monthly average LPR across all states · Standard dataset</p>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={seasonalData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} domain={['auto','auto']} tickFormatter={v=>`${v}%`} />
                        <Tooltip formatter={(v:any) => [`${v}%`, 'Avg LPR']} />
                        <Line type="monotone" dataKey="avgLPR" stroke={BRAND_GREEN} strokeWidth={2.5} dot={{ r:3, fill:BRAND_GREEN }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
                    <Leaf size={16} className="text-green-600" /> Key Seasonal Patterns
                  </h3>
                  <div className="space-y-3">
                    {[
                      { month:'Jan–Feb', icon:<CloudRain size={14}/>, color:'text-blue-600', bg:'bg-blue-50', text:'Elevated rates due to rabi harvest off-season — reduced rural agricultural employment.' },
                      { month:'Apr–Jun', icon:<AlertTriangle size={14}/>, color:'text-red-600', bg:'bg-red-50', text:'COVID-19 lockdown spike. Apr 2020 averaged 23.6% — highest single month across states.' },
                      { month:'Jul–Aug', icon:<Sun size={14}/>, color:'text-amber-600', bg:'bg-amber-50', text:'Partial recovery as lockdown eased and Kharif sowing season began.' },
                      { month:'Oct–Nov', icon:<Sprout size={14}/>, color:'text-green-600', bg:'bg-green-50', text:'Historically lowest unemployment — post-harvest agricultural activity peaks.' },
                    ].map(item => (
                      <div key={item.month} className={cn('flex gap-3 p-3 rounded-xl', item.bg)}>
                        <div className={cn('mt-0.5 shrink-0', item.color)}>{item.icon}</div>
                        <div>
                          <span className={cn('text-[10px] font-black uppercase tracking-wider', item.color)}>{item.month}</span>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── MINING METHODS ── */}
          {activeTab === 'mining' && (
            <motion.div key="mining" initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MiningMethodCard title="Statistical Regression" desc="Scikit-Learn Linear model for linear trends."       icon={<TrendingUp className="text-blue-500"/>}     accuracy="81.2%" file="regression.py" />
                <MiningMethodCard title="Deep Learning"          desc="TensorFlow neural net for complex patterns."       icon={<BrainCircuit className="text-indigo-500"/>} accuracy="92.4%" file="neural_network.py" />
                <MiningMethodCard title="Unsupervised Clustering" desc="K-Means algorithm for impact grouping."           icon={<Layers className="text-emerald-500"/>}      accuracy="K=3"   file="clustering.py" />
                <MiningMethodCard title="NoSQL Persistence"      desc="MongoDB document store for mining results."       icon={<Database className="text-emerald-500"/>}    accuracy="Atlas Ready" file="database_manager.py" />
                <MiningMethodCard title="Anomaly Mining"         desc="Isolation Forest to identify economic shocks."    icon={<AlertTriangle className="text-rose-500"/>}  accuracy="Auto-Detection" file="anomaly_detector.py" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Console */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[400px]">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-blue-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PyKernel Console</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500/20" />
                      <div className="w-2 h-2 rounded-full bg-amber-500/20" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-hide">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-slate-600 select-none">[{i}]</span>
                        <span className={cn(
                          log.includes('ERROR') ? 'text-rose-400' :
                          log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : 'text-slate-300'
                        )}>{log}</span>
                      </div>
                    ))}
                    {isProcessing && <div className="text-blue-500 animate-pulse">_</div>}
                  </div>
                  {isProcessing && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <div className="flex justify-between text-[8px] text-slate-500 mb-1 font-bold">
                        <span>MINING PROGRESS</span><span>{Math.round(currentProgress)}%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-blue-500" initial={{ width:0 }} animate={{ width:`${currentProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                {/* Impact zones */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-600" /> Impact Zone Clustering
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">Unsupervised mining from <code>clustering.py</code> based on <em>Unemployment</em> vs <em>Participation</em> metrics.</p>
                  <div className="space-y-5">
                    <ImpactZoneItem color="bg-red-500"    label="High Impact Zone"     desc="Massive spikes (>30%) and declining participation. Includes Tripura, Haryana, Jharkhand." />
                    <ImpactZoneItem color="bg-amber-500"  label="Moderate Impact Zone" desc="Significant volatility but steady job seeking. Includes Bihar, Delhi, Tamil Nadu." />
                    <ImpactZoneItem color="bg-emerald-500" label="Low Impact Zone"     desc="Resilience through agricultural safety nets. Includes Karnataka, Madhya Pradesh, Gujarat." />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── POLICY INSIGHTS ── */}
          {activeTab === 'policy' && (
            <motion.div key="policy" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="space-y-6">
              {/* Summary stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label:'High priority actions',       value:'3', color:'#dc2626', bg:'#fee2e2' },
                  { label:'States needing intervention', value:'4', color:'#d97706', bg:'#fef3c7' },
                  { label:'Policy areas covered',        value:'5', color:'#2563eb', bg:'#dbeafe' },
                ].map(s => (
                  <div key={s.label} style={{ background:s.bg, borderLeftColor:s.color }}
                    className="p-5 rounded-2xl border border-l-4 border-slate-100">
                    <p className="text-3xl font-black text-slate-800">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {policyInsights.map(insight => {
                  const isOpen = expandedPolicy === insight.id;
                  return (
                    <div key={insight.id} style={{ borderColor: isOpen ? insight.categoryColor : '#e2e8f0' }}
                      className="bg-white rounded-2xl border overflow-hidden transition-colors">
                      <button onClick={() => setExpandedPolicy(isOpen ? null : insight.id)}
                        className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-slate-50">
                        <div style={{ background: insight.categoryBg }} className="p-2 rounded-xl">{insight.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span style={{ background:insight.categoryBg, color:insight.categoryColor }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full">{insight.category}</span>
                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', priorityBadge[insight.priority])}>
                              {insight.priority} priority
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-800">{insight.title}</p>
                        </div>
                        <span className="text-slate-400 text-lg transition-transform"
                          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', display:'inline-block' }}>▾</span>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
                            <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
                              <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Evidence from data</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{insight.evidence}</p>
                              </div>
                              <div style={{ background:insight.categoryBg, borderLeftColor:insight.categoryColor }}
                                className="rounded-xl p-4 border-l-4">
                                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color:insight.categoryColor }}>Policy recommendation</p>
                                <p className="text-xs text-slate-700 leading-relaxed">{insight.recommendation}</p>
                              </div>
                              {insight.states.length > 0 && (
                                <div className="flex flex-wrap gap-2 items-center">
                                  <span className="text-[10px] text-slate-400">Affected states:</span>
                                  {insight.states.map(s => (
                                    <span key={s} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Insights derived from CMIE unemployment dataset (May 2019 – Nov 2020) · {data.length.toLocaleString()} records · 28 Indian states
              </p>
            </motion.div>
          )}

          {/* ── DATA DETAILS ── */}
          {activeTab === 'details' && (
            <motion.div key="details" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Master Data View</span>
                <span className="text-[10px] font-medium text-slate-400">{filteredData.length.toLocaleString()} records found</span>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-white border-b shadow-sm">
                    <tr className="text-slate-400">
                      <th className="p-4 font-bold">REGION</th>
                      <th className="p-4 font-bold">DATE</th>
                      <th className="p-4 font-bold">AREA</th>
                      <th className="p-4 font-bold text-center">RATE (%)</th>
                      <th className="p-4 font-bold">LPR (%)</th>
                      <th className="p-4 font-bold text-right">EMPLOYED (M)</th>
                      <th className="p-4 font-bold">SOURCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredData.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{d.region}</td>
                        <td className="p-4 text-slate-500">{d.date}</td>
                        <td className="p-4 text-slate-400 text-[10px]">{d.area ?? '—'}</td>
                        <td className="p-4 text-center">
                          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold',
                            d.unemploymentRate > 20 ? 'bg-red-50 text-red-600' :
                            d.unemploymentRate > 12 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}>
                            {d.unemploymentRate}%
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{d.labourParticipationRate}%</td>
                        <td className="p-4 text-right text-slate-500">{(d.employed / 1_000_000).toFixed(2)}M</td>
                        <td className="p-4">
                          <span className="text-[10px] font-medium text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full uppercase">{d.source}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-200 py-6 px-8 shrink-0">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; 2024 Economic Intelligence Portal | Data-Driven Decisions
          </p>
          <div className="flex gap-6">
            <FooterLink label="Dashboard Manual" />
            <FooterLink label="Mining Config" />
            <FooterLink label="API Status" />
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const KpiCard = ({ title, value, icon, trend, trendColor, isWarning }: {
  title: string; value: string; icon: React.ReactNode;
  trend: string; trendColor: 'red'|'amber'|'green'; isWarning?: boolean;
}) => {
  const trendCls: Record<string, string> = {
    red:   'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <motion.div whileHover={{ y:-4 }}
      className={cn('bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all',
        isWarning && 'border-red-100 bg-red-50/10')}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
        <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full', trendCls[trendColor])}>{trend}</span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <h4 className="text-2xl font-black text-slate-800 mt-1">{value}</h4>
    </motion.div>
  );
};

const MiningMethodCard = ({ title, desc, icon, accuracy, file }: {
  title: string; desc: string; icon: React.ReactNode; accuracy: string; file: string;
}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">{accuracy}</span>
    </div>
    <div>
      <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
    <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400 border-t border-slate-50">
      <Code2 size={10} /> {file}
    </div>
  </div>
);

const ImpactZoneItem = ({ color, label, desc }: { color: string; label: string; desc: string }) => (
  <div className="flex gap-4 group">
    <div className={cn('w-1 h-12 rounded-full shrink-0', color)} />
    <div>
      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{label}</p>
      <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const FooterLink = ({ label }: { label: string }) => (
  <span className="text-[10px] font-bold text-slate-500 hover:text-blue-600 cursor-pointer uppercase tracking-widest transition-colors">{label}</span>
);

export default App;
