import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';
import {
  Play,
  RefreshCcw,
  Users,
  Sun,
  Moon,
  Target,
  Zap,
  AlertTriangle,
  Activity,
  ChevronRight,
  Info,
  Clock,
  TrendingDown,
  Database,
  Grid3X3,
  Map,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { runSimulation, STATE_NAMES, SimResult, INITIAL_PATHS, STATES_METADATA, buildMatrices } from './lib/simulation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = {
  success: '#10B981', // Emerald 500
  abandon: '#F43F5E', // Rose 500
  error: '#F59E0B',   // Amber 500
  primary: '#3B82F6', // Blue 500
  background: '#F8FAFC'
};

type TabType = 'dashboard' | 'modelo' | 'matrices' | 'recorridos' | 'mejoras';

export default function App() {
  const [numUsers, setNumUsers] = useState(0);
  const [maxSteps, setMaxSteps] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [results, setResults] = useState<SimResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [toast, setToast] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const matrices = useMemo(() => buildMatrices(), []);

  const stats = useMemo(() => {
    if (results.length === 0) return null;

    const SEGUIMIENTO_STATES = new Set(['S2', 'S3', 'S4', 'S5', 'S11', 'S12']);
    const categories = {
      Éxito: results.filter(r => r.categoria === 'Éxito').length,
      Abandono: results.filter(r => r.categoria === 'Abandono').length,
      Error: results.filter(r => r.categoria === 'Error').length,
      Seguimiento: results.filter(r => r.recorrido.some(s => SEGUIMIENTO_STATES.has(s))).length,
    };
    const steps = results.map(r => r.num_pasos);
    const avgSteps = steps.reduce((a, b) => a + b, 0) / steps.length;
    const maxStepsObserved = Math.max(...steps);
    const minStepsObserved = Math.min(...steps);
    const sortedSteps = [...steps].sort((a, b) => a - b);
    const medianSteps = sortedSteps[Math.floor(sortedSteps.length / 2)];

    const abandonmentPoints: Record<string, number> = {};
    results.filter(r => r.categoria === 'Abandono').forEach(r => {
      const penultimo = r.recorrido[r.recorrido.length - 2];
      if (penultimo) {
        abandonmentPoints[penultimo] = (abandonmentPoints[penultimo] || 0) + 1;
      }
    });


    const topCriticalStates = Object.entries(abandonmentPoints)
      .map(([id, count]) => ({
        id,
        count,
        name: STATE_NAMES[id] || id,
        metadata: STATES_METADATA[id]
      }))
      .sort((a, b) => b.count - a.count);

    const stepDistribution: Record<number, number> = {};
    steps.forEach(s => {
      stepDistribution[s] = (stepDistribution[s] || 0) + 1;
    });
    const distributionData = Object.entries(stepDistribution)
      .map(([step, count]) => ({ step: Number(step), count }))
      .sort((a, b) => a.step - b.step);

    return {
      categories,
      avgSteps,
      medianSteps,
      maxStepsObserved,
      minStepsObserved,
      topCriticalStates,
      distributionData,
      total: results.length
    };
  }, [results]);

  const exportMatricesToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1 - Matriz de Conteos
    const states = Object.keys(matrices.counts);
    const countsData = [
      ['', ...states],
      ...states.map(row => [row, ...states.map(col => matrices.counts[row][col])])
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(countsData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Matriz Conteos');

    // Hoja 2 - Matriz de Probabilidades
    const probsData = [
      ['', ...states],
      ...states.map(row => [row, ...states.map(col => Number(matrices.probabilities[row][col].toFixed(4)))])
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(probsData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Matriz Probabilidades');

    // Hoja 3 - Resultados simulación
    const resultsData = [
      ['Usuario', 'Recorrido', 'Pasos', 'Estado Final', 'Categoría'],
      ...results.map(r => [`ID-${r.usuario}`, r.recorrido.join(' → '), r.num_pasos, r.estado_final, r.categoria])
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(resultsData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Simulación');

    XLSX.writeFile(wb, `colombia_comparte_${numUsers}_usuarios.xlsx`);
  };

  const performSimulation = () => {
    if (!numUsers || numUsers < 1) {
      setToast('⚠️ Ingresa un número de usuarios válido');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    if (!maxSteps || maxSteps < 1) {
      setToast('⚠️ Ingresa un número de pasos válido');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    setIsSimulating(true);
    const worker = new Worker(
      new URL('./simulation.worker.ts', import.meta.url),
      { type: 'module' }
    );
    worker.onmessage = (e) => {
      setResults(e.data);
      setIsSimulating(false);
      worker.terminate();
    };
    worker.postMessage({ numUsers, maxSteps });
  };
  if (isSimulating) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-8">
      <img src="/Logo.png" alt="logo" className="w-20 h-20 object-contain" />
      <div className="text-center space-y-2">
        <h2 className="font-black text-2xl uppercase tracking-tighter text-slate-700">Simulando...</h2>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Procesando {numUsers.toLocaleString()} usuarios</p>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-blue-600"
            style={{
              animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`
            }}
          />
        ))}
      </div>
      <div className="w-64 bg-slate-200 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  );
  if (!stats) return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header solo con logo y título */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <header className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
         <img src="/Logo.png" alt="logo" className="w-20 h-20 object-contain" />
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">Colombia Comparte Sim</h1>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Markov Simulation Dashboard</div>
          </div>
        </header>
      </div>

      {/* Mensaje central con inputs */}
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
          Bienvenido a la
        </h1>
        <h2 className="text-4xl font-black uppercase tracking-tighter text-blue-600">
          Simulación De Colombia Comparte
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
          Markov Simulation Dashboard
        </p>
      </div>
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center max-w-md w-full">
          <Activity size={48} className="text-blue-200 mx-auto mb-4" />
          <h2 className="font-black text-xl text-slate-700 uppercase tracking-tight mb-2">Sin datos aún</h2>
          <p className="text-slate-400 font-bold text-sm mb-8">Configura los parámetros y presiona <span className="text-blue-600">EJECUTAR</span></p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
              <div className="text-[10px] font-black text-slate-400 uppercase leading-none w-24 text-left">Muestra</div>
              <input type="number" inputMode="numeric" value={numUsers || ''} placeholder="ej: 1000" onChange={(e) => setNumUsers(Math.min(100000, Math.max(0, Number(e.target.value))))} className="flex-1 font-bold text-slate-700 bg-transparent outline-none text-sm" />
              <span className="text-[9px] text-slate-300 font-bold">/ 100k MAX</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
              <div className="text-[10px] font-black text-slate-400 uppercase leading-none w-24 text-left">Pasos Máx</div>
              <input type="number" inputMode="numeric" value={maxSteps || ''} placeholder="ej: 15" onChange={(e) => setMaxSteps(Math.min(20, Math.max(0, Number(e.target.value))))} className="flex-1 font-bold text-slate-700 bg-transparent outline-none text-sm" />
              <span className="text-[9px] text-slate-300 font-bold">/ 20 MAX</span>
            </div>
            <button onClick={performSimulation} disabled={isSimulating} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200">
              <Play fill="currentColor" size={18} />
              EJECUTAR
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );

  const categoryData = [
    { name: 'Éxito', value: stats.categories.Éxito, color: COLORS.success },
    { name: 'Abandono', value: stats.categories.Abandono, color: COLORS.abandon },
    { name: 'Error', value: stats.categories.Error, color: COLORS.error },
  ];
  return (
    <div className={cn("min-h-screen font-sans pb-12", darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900")}>      {/* Header Fijo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <header className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="logo" className="w-20 h-20 object-contain" />
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                Colombia Comparte Simulacion
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Markov Simulation Dashboard</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
              <div className="text-[9px] font-black text-slate-400 uppercase leading-none">Muestra</div>
              <input type="number" inputMode="numeric" value={numUsers} onChange={(e) => setNumUsers(Math.min(100000, Math.max(1, Number(e.target.value))))} className="w-14 font-bold text-slate-700 bg-transparent outline-none text-sm" />
              <span className="text-[8px] text-slate-300 font-bold">/ 100K Max</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
              <div className="text-[9px] font-black text-slate-400 uppercase leading-none">Pasos</div>
              <input type="number" inputMode="numeric" value={maxSteps} onChange={(e) => setMaxSteps(Math.min(20, Math.max(1, Number(e.target.value))))} className="w-10 font-bold text-slate-700 bg-transparent outline-none text-sm" />
              <span className="text-[8px] text-slate-300 font-bold">/ 20 Max</span>
            </div>
            <button onClick={performSimulation} disabled={isSimulating} className={cn("flex items-center gap-1 px-3 py-2 rounded-xl font-bold transition-all text-xs", isSimulating ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200")}>
              {isSimulating ? <RefreshCcw className="animate-spin" size={14} /> : <Play fill="currentColor" size={14} />}
              {isSimulating ? "..." : "EJECUTAR"}
            </button>

            <button
              onClick={exportMatricesToExcel}
              className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold transition-all text-xs bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200"
            >
              <Grid3X3 size={14} />
              EXCEL
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "p-2 rounded-xl border transition-all",
                darkMode ? "bg-slate-700 border-slate-600 text-yellow-400" : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"
              )}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Tabs */}
        <nav className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-8 border-t border-slate-100">
            <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity size={16} />} label="Dashboard" />
            <TabButton active={activeTab === 'modelo'} onClick={() => setActiveTab('modelo')} icon={<Database size={16} />} label="Estados" />
            <TabButton active={activeTab === 'recorridos'} onClick={() => setActiveTab('recorridos')} icon={<Map size={16} />} label="Recorridos Base" />
            <TabButton active={activeTab === 'matrices'} onClick={() => setActiveTab('matrices')} icon={<Grid3X3 size={16} />} label="Matrices" />
            <TabButton active={activeTab === 'mejoras'} onClick={() => setActiveTab('mejoras')} icon={<Lightbulb size={16} />} label="Mejoras" />
          </div>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Éxito" value={`${((stats.categories.Éxito / stats.total) * 100).toFixed(1)}%`} subtitle={`${stats.categories.Éxito} usuarios`} icon={<Target className="text-emerald-500" />} color="emerald" />
                <StatCard title="Abandono" value={`${((stats.categories.Abandono / stats.total) * 100).toFixed(1)}%`} subtitle={`${stats.categories.Abandono} usuarios`} icon={<TrendingDown className="text-rose-500" />} color="rose" />
                <StatCard title="Pasos Promedio" value={stats.avgSteps.toFixed(1)} subtitle={`Mediana: ${stats.medianSteps}`} icon={<Zap className="text-blue-500" />} color="blue" />
                <StatCard title="Fallo Técnico" value={`${((stats.categories.Error / stats.total) * 100).toFixed(1)}%`} subtitle={`${stats.categories.Error} errores detectados`} icon={<AlertTriangle className="text-amber-500" />} color="amber" />
                <StatCard title="Seguimiento" value={`${((stats.categories.Seguimiento / stats.total) * 100).toFixed(1)}%`} subtitle={`${stats.categories.Seguimiento} usuarios`} icon={<Clock className="text-purple-500" />} color="purple" />
              </div>

              {/* Charts area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" /> Distribución de Resultados
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 700, fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="value" radius={[12, 12, 4, 4]} barSize={80}>
                          {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-6 self-start">Compisición Porcentual</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                          {categoryData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full mt-4">
                    {categoryData.map(c => (
                      <div key={c.name} className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: c.color }} />
                        <span className="text-[10px] font-black uppercase text-slate-400">{c.name}</span>
                        <span className="text-xs font-bold">{(c.value / stats.total * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulation Preview */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Log de Simulación (Muestra de 10)</h3>
                  <div className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 tracking-tighter">PREVIEW REAL-TIME</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="pb-3 px-2 w-16">Usuario</th>
                        <th className="pb-3 px-2">Recorrido</th>
                        <th className="pb-3 px-2 text-right">Pasos</th>
                        <th className="pb-3 px-2 text-right">Terminación</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold">
                      {results.slice(0, 10).map(u => (
                        <tr key={u.usuario} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                          <td className="py-4 px-2 text-slate-400">ID-{u.usuario}</td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                              {u.recorrido.map((s, si) => (
                                <span key={si} className="flex items-center gap-1 flex-shrink-0">
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px]",
                                    si === 0 ? "bg-blue-600 text-white" :
                                      si === u.recorrido.length - 1 ? (
                                        u.categoria === 'Éxito' ? "bg-emerald-500 text-white" :
                                          u.categoria === 'Error' ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                                      ) : "bg-slate-200 text-slate-600"
                                  )}>{s}</span>
                                  {si < u.recorrido.length - 1 && <ChevronRight size={10} className="text-slate-300" />}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">{u.num_pasos}</td>
                          <td className="py-4 px-2 text-right">
                            <span className={cn(
                              "px-2 py-1 rounded inline-block text-[9px] uppercase",
                              u.categoria === 'Éxito' ? "text-emerald-600 bg-emerald-50" :
                                u.categoria === 'Error' ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50"
                            )}>{u.categoria}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'modelo' && (
            <motion.div key="model" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-lg uppercase tracking-tight">Estados del Sistema</h3>
                <span className="text-xs font-bold text-slate-400 tracking-tighter">TOTAL: {Object.keys(STATES_METADATA).length} ESTADOS</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="py-4 px-6 w-24">Código</th>
                      <th className="py-4 px-6">Nombre</th>
                      <th className="py-4 px-6">Descripción</th>
                      <th className="py-4 px-6">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    {Object.values(STATES_METADATA).map(state => (
                      <tr key={state.code} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-5 px-6 font-black text-blue-600">{state.code}</td>
                        <td className="py-5 px-6 font-bold text-slate-800">{state.name}</td>
                        <td className="py-5 px-6 text-slate-500">{state.description}</td>
                        <td className="py-5 px-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] uppercase font-bold",
                            state.type === 'inicial' ? "bg-blue-100 text-blue-700" :
                              state.type === 'final exitoso' ? "bg-emerald-100 text-emerald-700" :
                                state.type === 'final negativo' ? "bg-rose-100 text-rose-700" :
                                  state.type === 'error' ? "bg-amber-100 text-amber-700" :
                                    state.type === 'seguimiento' ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"
                          )}>{state.type}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'recorridos' && (
            <motion.div key="paths" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Map size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase tracking-tight">Recorridos Base</h3>
                    <p className="text-slate-400 text-xs font-bold leading-none mt-1 uppercase tracking-tighter">Dataset histórico de rutas predefinidas</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {INITIAL_PATHS.map((path, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black text-blue-600">Ruta {idx + 1}</span>
                        <span className="text-[10px] font-bold text-slate-400">{path.length} pasos</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {path.map((s, si) => (
                          <span key={si} className="flex items-center gap-1">
                            <span className={cn(
                              "text-[10px] font-bold",
                              si === path.length - 1 ? (
                                s === 'S29' ? "text-emerald-600" : s === 'S31' ? "text-amber-600" : "text-rose-600"
                              ) : "text-slate-700"
                            )}>{s}</span>
                            {si < path.length - 1 && <ChevronRight size={10} className="text-slate-300" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'matrices' && (
            <motion.div key="matrix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 pb-12">
              {/* Matrix Conteo */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <h3 className="font-black text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Grid3X3 size={20} className="text-blue-500" /> Matriz de Conteos
                </h3>
                <div className="overflow-x-auto border rounded-xl overflow-hidden border-slate-100">
                  <MatrixTable data={matrices.counts} />
                </div>
              </div>

              {/* Matrix Probabilidad */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <h3 className="font-black text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
                  <TrendingDown size={20} className="text-emerald-500" /> Matriz de Probabilidades
                </h3>
                <div className="overflow-x-auto border rounded-xl overflow-hidden border-slate-100">
                  <MatrixTable data={matrices.probabilities} isProb />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'mejoras' && (
            <motion.div key="recs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="bg-white p-10 rounded-3xl border-4 border-slate-200 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 text-slate-50 opacity-10">
                  <Lightbulb size={240} />
                </div>

                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="p-4 bg-amber-500 text-white rounded-3xl shadow-lg shadow-amber-200">
                    <AlertTriangle size={32} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-900 leading-none">Estado Crítico Detectado</h3>
                    <p className="text-slate-400 font-bold uppercase text-xs mt-2 tracking-widest">Análisis de puntos de mayor fricción en el embudo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado con mayor deserción</span>
                          <h4 className="text-3xl font-black text-blue-600 tracking-tighter mt-1">{stats.topCriticalStates[0].id}</h4>
                          <p className="text-slate-800 font-bold text-lg leading-tight mt-2">{stats.topCriticalStates[0].name}</p>
                        </div>
                        <div className="bg-rose-500 text-white px-4 py-2 rounded-2xl font-black text-xl shadow-md">
                          {stats.topCriticalStates[0].count}
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">FRECUENCIA DE ABANDONO</span>
                        <span className="text-rose-600 font-black text-lg">{(stats.topCriticalStates[0].count / stats.categories.Abandono * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Otros estados de riesgo</h5>
                      {stats.topCriticalStates.slice(1, 4).map(s => (
                        <div key={s.id} className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-black">{s.id}</span>
                            <span className="text-xs font-bold text-slate-700">{s.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-400">{s.count} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-300 transform md:rotate-2">
                      <div className="flex items-center gap-3 mb-4">
                        <Lightbulb size={24} className="text-blue-200" />
                        <h4 className="font-black text-xl uppercase tracking-tight">Propuesta de Mejora</h4>
                      </div>
                      <p className="text-blue-100 font-medium leading-relaxed mb-6 italic">
                        "Hemos detectado que en el estado {stats.topCriticalStates[0].id} ({stats.topCriticalStates[0].name}) se genera el {(stats.topCriticalStates[0].count / stats.categories.Abandono * 100).toFixed(0)}% de las salidas del sistema."
                      </p>
                      <div className="space-y-4">
                        <RecommendationItem
                          title="Refuerzo Visual"
                          text="Implementar micro-copy persuasivo resaltando los beneficios directos de este paso."
                        />
                        <RecommendationItem
                          title="Optimización UX"
                          text="Reducir los campos requeridos o simplificar la navegación en esta sección específica."
                        />
                        <RecommendationItem
                          title="Social Proof"
                          text="Añadir una pequeña burbuja de testimonios específicos de este módulo para generar confianza."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {toast && (
          <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm z-50 animate-bounce">
            {toast}
          </div>
        )}
      </main>
    </div>
  );
}

function MatrixTable({ data, isProb = false }: { data: Record<string, Record<string, number>>, isProb?: boolean }) {
  const states = Object.keys(data).filter(s => {
    // Solo mostrar estados que tienen alguna salida o entrada significativa para que la tabla sea legible
    return Object.values(data[s]).some(v => v > 0) || Object.keys(data).some(ks => data[ks][s] > 0);
  });

  return (
    <div className="max-h-[600px] overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-white z-10">
          <tr>
            <th className="p-2 border-b border-r bg-slate-50 text-[9px] font-black w-12 text-center text-slate-400">STATE</th>
            {states.map(s => (
              <th key={s} className="p-2 border-b bg-slate-50 text-[9px] font-black min-w-[50px] text-center text-slate-500">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[10px] font-bold">
          {states.map(row => (
            <tr key={row} className="hover:bg-slate-50">
              <td className="p-2 border-r bg-slate-50 text-center font-black text-blue-600 sticky left-0 z-10">{row}</td>
              {states.map(col => {
                const val = data[row][col];
                return (
                  <td key={col} className={cn(
                    "p-2 border-b border-r text-center transition-all",
                    val > 0 ? "bg-blue-50/50 text-blue-600" : "text-slate-300"
                  )}>
                    {isProb ? (val === 0 ? '-' : val.toFixed(3)) : (val === 0 ? '-' : val)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecommendationItem({ title, text }: { title: string, text: string }) {
  return (
    <div className="bg-blue-500/30 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
      <span className="block text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">{title}</span>
      <p className="text-sm text-white font-bold leading-tight">{text}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 py-4 px-2 border-b-2 transition-all whitespace-nowrap",
        active ? "border-blue-600 text-blue-600 font-black" : "border-transparent text-slate-400 font-bold hover:text-slate-600"
      )}
    >
      <span className={cn(active ? "text-blue-600" : "text-slate-300")}>{icon}</span>
      <span className="text-xs uppercase tracking-widest">{label}</span>
    </button>
  );
}

function StatCard({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-slate-50 rounded-2xl">
          {icon}
        </div>
        <div className="px-2 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-tighter">KPI UNIT</div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h4 className="text-3xl font-black tracking-tighter text-slate-900">{value}</h4>
        </div>
        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">{subtitle}</p>
      </div>
    </motion.div>
  );
}


