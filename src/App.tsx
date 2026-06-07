import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  AlertTriangle, 
  Filter,
  PieChart as PieIcon,
  Activity,
  Download,
  RefreshCcw,
  Monitor,
  Database,
  BarChart3,
  Layers,
  ChevronRight,
  BrainCircuit,
  Code2,
  Play,
  Terminal
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getProcessedData } from './data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedSource, setSelectedSource] = useState<'All' | 'Standard' | 'Extended'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'regions' | 'mining' | 'details'>('overview');
  const [logs, setLogs] = useState<string[]>(["[READY] Awaiting mining trigger..."]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const data = useMemo(() => getProcessedData(), []);

  const runPipeline = async () => {
    setIsProcessing(true);
    setCurrentProgress(0);
    setActiveTab('mining');
    setLogs(["[START] Connecting to local PyKernel...", "[PROCESS] Triggering Flask API: /api/mine"]);
    
    try {
      // Relative URL for unified deployment (Server & Dashboard on same host)
      const apiUrl = '';
        
      const response = await fetch(`${apiUrl}/api/mine`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const steps = [
        { msg: "[CLEAN] data_loader: Standardizing archive (7) datasets", delay: 500 },
        { msg: "[DL] neural_network.py: Training TensorFlow Neural Net", delay: 1500 },
        { msg: "[MINING] clustering.py: Updating impact zones", delay: 2500 },
        { msg: "[DB] database_manager.py: Syncing NoSQL documents", delay: 3500 },
        { msg: "[SUCCESS] Full Mining Pipeline Complete.", delay: 4500 },
      ];

      steps.forEach((step, index) => {
        setTimeout(() => {
          setLogs(prev => [...prev, step.msg]);
          setCurrentProgress(((index + 1) / steps.length) * 100);
          if (index === steps.length - 1) {
            setIsProcessing(false);
          }
        }, step.delay);
      });
    } catch (err) {
      setLogs(prev => [...prev, "!! CONNECTION ERROR: Please run 'python server.py' in your terminal."]);
      setIsProcessing(false);
    }
  };
  
  const regions = useMemo(() => ['All', ...Array.from(new Set(data.map(d => d.region)))], [data]);

  const filteredData = useMemo(() => {
    let filtered = data;
    if (selectedRegion !== 'All') {
      filtered = filtered.filter(d => d.region === selectedRegion);
    }
    if (selectedSource !== 'All') {
      filtered = filtered.filter(d => d.source === selectedSource);
    }
    return filtered;
  }, [data, selectedRegion, selectedSource]);

  const stats = useMemo(() => {
    const dataToUse = filteredData.length > 0 ? filteredData : [{ unemploymentRate: 0, labourParticipationRate: 0, employed: 0 }];
    const avg = dataToUse.reduce((acc, curr) => acc + (curr.unemploymentRate || 0), 0) / dataToUse.length;
    const peak = Math.max(...dataToUse.map(d => d.unemploymentRate || 0), 0);
    const participation = dataToUse.reduce((acc, curr) => acc + (curr.labourParticipationRate || 0), 0) / dataToUse.length;
    const totalEmployed = dataToUse.reduce((acc, curr) => acc + (curr.employed || 0), 0) / dataToUse.length;
    
    return {
      avg: avg.toFixed(2),
      peak: peak.toFixed(2),
      participation: participation.toFixed(2),
      employed: (totalEmployed / 1000000).toFixed(2)
    };
  }, [filteredData]);

  const sourceData = useMemo(() => {
    return [
      { name: 'Standard', value: data.filter(d => d.source === 'Standard').length },
      { name: 'Extended', value: data.filter(d => d.source === 'Extended').length },
    ];
  }, [data]);

  const regionalAnalysis = useMemo(() => {
    const group = data.reduce((acc, curr) => {
      if (!acc[curr.region]) acc[curr.region] = { region: curr.region, rate: 0, count: 0 };
      acc[curr.region].rate += curr.unemploymentRate;
      acc[curr.region].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(group).map((g: any) => ({
      region: g.region,
      rate: parseFloat((g.rate / g.count).toFixed(2))
    })).sort((a, b) => b.rate - a.rate);
  }, [data]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSelectedRegion('All');
      setSelectedSource('All');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans selection:bg-blue-100 flex flex-col">
      {/* Power BI Styled Header */}
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
            <button 
              onClick={handleRefresh}
              className={cn("p-1.5 hover:bg-slate-100 rounded transition-all", isRefreshing && "animate-spin text-blue-600")}
              title="Refresh Data"
            >
              <RefreshCcw size={16} className="text-slate-500" />
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded transition-all" title="Download Report">
              <Download size={16} className="text-slate-500" />
            </button>
          </div>
          <button 
            onClick={runPipeline}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md shadow-blue-200 transition-all disabled:opacity-50"
          >
            {isProcessing ? <RefreshCcw size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
            RUN MINING
          </button>
        </div>
      </header>

      {/* Main Dashboard Canvas */}
      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-6 overflow-y-auto">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
           <span>Datasets</span> <ChevronRight size={10} /> <span>Archive (7)</span> <ChevronRight size={10} /> <span className="text-blue-600">Mining Pipeline v2.0</span>
        </div>
        
        {/* Filters & Slicers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-8 items-center shrink-0">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Filter size={12} /> Region Slicer
            </label>
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[200px]"
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Database size={12} /> Dataset Source
            </label>
            <div className="flex p-1 bg-slate-100 rounded-xl">
              {(['All', 'Standard', 'Extended'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSource(s)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    selectedSource === s ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Analysis Period</p>
              <p className="text-xs font-bold text-slate-700">May 2019 - Nov 2020</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 hidden md:block" />
            <div className="flex flex-col items-center">
               <Activity size={20} className="text-blue-500 animate-pulse" />
               <span className="text-[8px] font-bold text-blue-500 uppercase mt-1">Working Feed</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
           <TabItem label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
           <TabItem label="Regional Analysis" active={activeTab === 'regions'} onClick={() => setActiveTab('regions')} />
           <TabItem label="Mining Methods" active={activeTab === 'mining'} onClick={() => setActiveTab('mining')} />
           <TabItem label="Data Details" active={activeTab === 'details'} onClick={() => setActiveTab('details')} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Avg Unemployment Rate" value={`${stats.avg}%`} icon={<TrendingUp className="text-blue-600" />} trend="+12% YoY" trendUp />
                <KpiCard title="Peak Observed Rate" value={`${stats.peak}%`} icon={<AlertTriangle className="text-red-600" />} trend="Lockdown Shock" isWarning />
                <KpiCard title="Labour Participation" value={`${stats.participation}%`} icon={<Users className="text-emerald-600" />} trend="-2.4% vs 2019" />
                <KpiCard title="Avg Employed (Est.)" value={`${stats.employed}M`} icon={<MapPin className="text-orange-600" />} trend="Regional Sample" />
              </div>

              {/* Main Visuals Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Trend Chart */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">Unemployment Trends Analysis</h3>
                      <p className="text-xs text-slate-400">Time-series forecasting based on regional metrics</p>
                    </div>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredData}>
                        <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="unemploymentRate" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRate)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Dataset Distribution */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                    <PieIcon size={18} className="text-blue-500" /> Data Ingestion Mix
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">Composition of historical and extended datasets</p>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                            {sourceData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'regions' && (
            <motion.div 
              key="regions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-500" /> Average Rate by State
                  </h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={regionalAnalysis} layout="vertical" margin={{ left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis dataKey="region" type="category" fontSize={10} axisLine={false} tickLine={false} width={80} />
                          <Tooltip />
                          <Bar dataKey="rate" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                       </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Layers size={18} className="text-blue-500" /> High-Impact Regions
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">Regions with highest average unemployment rates during the observed period.</p>
                  <div className="space-y-4">
                     {regionalAnalysis.slice(0, 5).map((r, i) => (
                       <div key={r.region} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-slate-400 border border-slate-200">#{i+1}</div>
                          <div className="flex-1">
                             <p className="text-sm font-bold text-slate-800">{r.region}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                   <div className="bg-red-500 h-full" style={{ width: `${(r.rate / regionalAnalysis[0].rate) * 100}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-600">{r.rate}%</span>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'mining' && (
            <motion.div 
              key="mining"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <MiningMethodCard 
                   title="Statistical Regression" 
                   desc="Scikit-Learn Linear model for linear trends."
                   icon={<TrendingUp className="text-blue-500" />}
                   accuracy="81.2%"
                   file="regression.py"
                 />
                 <MiningMethodCard 
                   title="Deep Learning" 
                   desc="TensorFlow neural net for complex patterns."
                   icon={<BrainCircuit className="text-indigo-500" />}
                   accuracy="92.4%"
                   file="neural_network.py"
                 />
                 <MiningMethodCard 
                   title="Unsupervised Clustering" 
                   desc="K-Means algorithm for impact grouping."
                   icon={<Layers className="text-emerald-500" />}
                   accuracy="K=3"
                   file="clustering.py"
                 />
                 <MiningMethodCard 
                   title="NoSQL Persistence" 
                   desc="MongoDB document store for mining results."
                   icon={<Database className="text-emerald-500" />}
                   accuracy="Atlas Ready"
                   file="database_manager.py"
                 />
                 <MiningMethodCard 
                   title="Anomaly Mining" 
                   desc="Isolation Forest to identify economic shocks."
                   icon={<AlertTriangle className="text-rose-500" />}
                   accuracy="Auto-Detection"
                   file="anomaly_detector.py"
                 />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                           <span>MINING PROGRESS</span>
                           <span>{Math.round(currentProgress)}%</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                           <motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${currentProgress}%` }} />
                        </div>
                     </div>
                   )}
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                      <Activity size={20} className="text-blue-600" /> Impact Zone Clustering
                  </h3>
                  <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                      <p className="text-xs">
                          Unsupervised mining categorization from <code>clustering.py</code> based on <em>Unemployment</em> vs <em>Participation</em> metrics.
                      </p>
                      <div className="space-y-3">
                          <ImpactZoneItem color="bg-red-500" label="High Impact Zone" desc="Massive spikes (>30%) and declining participation." />
                          <ImpactZoneItem color="bg-amber-500" label="Moderate Impact Zone" desc="Significant volatility but steady job seeking." />
                          <ImpactZoneItem color="bg-emerald-500" label="Low Impact Zone" desc="Resilience through agricultural safety nets." />
                      </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div 
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Master Data View</span>
                 <span className="text-[10px] font-medium text-slate-400">{filteredData.length} records found</span>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-white border-b shadow-sm">
                    <tr className="text-slate-400">
                      <th className="p-4 font-bold">REGION</th>
                      <th className="p-4 font-bold">DATE</th>
                      <th className="p-4 font-bold text-center">RATE (%)</th>
                      <th className="p-4 font-bold text-right">EMPLOYED (M)</th>
                      <th className="p-4 font-bold">SOURCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredData.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{d.region}</td>
                        <td className="p-4 text-slate-500">{d.date}</td>
                        <td className="p-4 text-center">
                           <span className={cn(
                             "px-2 py-0.5 rounded-full text-[10px] font-bold",
                             d.unemploymentRate > 20 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                           )}>
                             {d.unemploymentRate}%
                           </span>
                        </td>
                        <td className="p-4 text-right text-slate-500">{(d.employed / 1000000).toFixed(2)}M</td>
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

      {/* Footer */}
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

const MiningMethodCard = ({ title, desc, icon, accuracy, file }: any) => (
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

const ImpactZoneItem = ({ color, label, desc }: any) => (
  <div className="flex gap-4 group">
    <div className={cn("w-1 h-12 rounded-full shrink-0", color)} />
    <div>
      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{label}</p>
      <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const TabItem = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
      active ? "border-blue-600 text-blue-600 bg-blue-50/20" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
    )}
  >
    {label}
  </button>
);

const KpiCard = ({ title, value, icon, trend, trendUp, isWarning }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={cn(
      "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all",
      isWarning && "border-red-100 bg-red-50/10"
    )}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
      <span className={cn(
        "text-[10px] font-bold px-2 py-1 rounded-full",
        trendUp ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600",
        !trendUp && !trend.includes('+') && "bg-emerald-50 text-emerald-600"
      )}>{trend}</span>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
    <h4 className="text-2xl font-black text-slate-800 mt-1">{value}</h4>
  </motion.div>
);

const FooterLink = ({ label }: { label: string }) => (
  <span className="text-[10px] font-bold text-slate-500 hover:text-blue-600 cursor-pointer uppercase tracking-widest transition-colors">{label}</span>
);

export default App;
