import React, {useState, useMemo} from 'react';
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    Users,
    Building2,
    CreditCard,
    AlertCircle,
    Activity,
    RefreshCcw,
    TrendingUp,
    Loader2
} from 'lucide-react';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import DataTable from './components/DataTable';
import {DashboardView, SummaryStats} from './types';
import {useDashboardData} from './hooks/useDashboardData';
import {
    MOCK_DATA_SIMULACRO,
    SUMMARY_SIMULACRO,
    SUMMARY_ADMISION
} from './constants.tsx';

const App: React.FC = () => {
    // Estado que mantiene la vista actual del dashboard.
    // Documentación:
    // - `currentView` puede ser `DashboardView.ADMISION` o `DashboardView.SIMULACRO`.
    // - El componente `Header` recibe `currentView` y una función `onViewChange`.
    // - Cuando el usuario hace click en uno de los botones del `Header`,
    //   `onViewChange` se invoca con el nuevo valor y `setCurrentView` actualiza
    //   el estado aquí en `App`.
    // - Al cambiar `currentView`, se vuelve a ejecutar `useDashboardData(currentView)`
    //   porque el hook acepta la vista como argumento y re-fetchea datos cuando
    //   su dependencia `view` cambia (ver `hooks/useDashboardData.ts`).
    const [currentView, setCurrentView] = useState<DashboardView>(DashboardView.ADMISION);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Hook para obtener datos de la API (solo para ADMISION)
    const {
        data: apiData,
        isLoading,
        error,
        refresh,
        partialScholarships,
        partialTotal,
        vocationalCepreTotal,
        vocationalCepreIntensiveTotal,
        swornDeclarations,
        swornTotal
    } = useDashboardData(currentView);

    // Usar la data del API tanto para ADMISION como para SIMULACRO. Mantener mocks si quieres fallback.
    const data = useMemo(() => {
        return (currentView === DashboardView.ADMISION || currentView === DashboardView.SIMULACRO) ? apiData : MOCK_DATA_SIMULACRO;
    }, [currentView, apiData]);

    // Calcular resumen dinámicamente basado en los datos de la API
    const summary = useMemo((): SummaryStats => {
        // Si no hay datos del API para esta vista, usar el summary mock como fallback
        if ((currentView === DashboardView.SIMULACRO || currentView === DashboardView.ADMISION) && apiData.length === 0) {
            return currentView === DashboardView.SIMULACRO ? SUMMARY_SIMULACRO : SUMMARY_ADMISION;
        }

        // Calcular estadísticas desde los datos de la API
        const totalPreinscritos = apiData.reduce((acc, item) => acc + item.preinscritos, 0);
        const totalPagos = apiData.reduce((acc, item) => acc + item.pagos, 0);

        return {
            totalPreinscritos,
            totalConSede: totalPreinscritos,
            derechoExamen: 'Sin datos',
            totalPagos,
            promedioGap: 0
        };
    }, [currentView, apiData]);

    // Reverse data for chronological chart display
    const chartData = useMemo(() => {
        return [...data].reverse().map(item => ({
            ...item,
            // Format date for chart labels (e.g., 2026-01-13 -> 1-13)
            label: item.fecha.split('-').slice(1).map(s => parseInt(s, 10)).join('-')
        }));
    }, [data]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // llamar refresh independientemente de la vista (admision o simulacro)
        refresh();
        setTimeout(() => setIsRefreshing(false), 800);
    };

    const title = currentView === DashboardView.ADMISION ? 'Dashboard de Admisión' : 'Dashboard de Simulacro';
    const subtitle = currentView === DashboardView.ADMISION
        ? 'Análisis de brechas entre inscripciones y pagos'
        : 'Seguimiento de participación y recaudación';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header currentView={currentView} onViewChange={setCurrentView}/>

            <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
                {/* Title and Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                            <Activity size={24}/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <p className="text-sm text-gray-500">{subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-100 active:scale-95"
                    >
                        <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''}/>
                        <span>Actualizar Datos</span>
                    </button>
                </div>

                {/* Top Row: Chart & Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart Card */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex items-center justify-center h-[300px]">
                                <Loader2 size={40} className="text-indigo-600 animate-spin"/>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="flex flex-col items-center justify-center h-[300px] text-red-500">
                                <AlertCircle size={40}/>
                                <p className="mt-2 text-sm">{error}</p>
                                <button
                                    onClick={refresh}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {/* Chart Content */}
                        {(!isLoading && !error) && (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <TrendingUp size={18} className="text-indigo-600"/>
                                            <h3 className="font-semibold text-gray-800">Evolución Diaria General</h3>
                                        </div>
                                        <p className="text-xs text-gray-400">Comparativa de volumen diario</p>
                                    </div>
                                    <div
                                        className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-wider">
                                        <div className="flex items-center space-x-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                            <span className="text-gray-500">Preinscritos</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                                            <span className="text-gray-500">D. Examen</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                            <span className="text-gray-500">Pagantes</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                            <defs>
                                                <linearGradient id="colorPre" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorPag" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                            <XAxis
                                                dataKey="label"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{fontSize: 11, fill: '#94a3b8'}}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{fontSize: 11, fill: '#94a3b8'}}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="preinscritos"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorPre)"
                                                dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}}
                                                activeDot={{r: 6}}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="pagos"
                                                stroke="#22c55e"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorPag)"
                                                dot={{r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff'}}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="derechoExamen"
                                                stroke="#eab308"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Table Card */}
                    <div className="lg:col-span-1">
                        <DataTable data={data}/>
                    </div>
                </div>

                {/* Bottom Row: Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <SummaryCard
                        title="Total Pre-inscritos"
                        value={summary.totalPreinscritos}
                        subtitle="Postulantes que han creado su cuenta"
                        colorClass="text-orange-600"
                        iconBgClass="bg-orange-50"
                        icon={<Users className="text-orange-600" size={18}/>}
                    />
                    <SummaryCard
                        title="Total Pagos"
                        value={summary.totalPagos}
                        subtitle="Todos los pagos por derecho a examen"
                        colorClass="text-green-600"
                        iconBgClass="bg-green-50"
                        icon={<CreditCard className="text-green-600" size={18}/>}
                    />
                    <SummaryCard
                        title="Total de Solicitudes de Semibecas"
                        value={partialTotal}
                        subtitle="Acumulado total"
                        colorClass="text-blue-600"
                        iconBgClass="bg-blue-50"
                        icon={<Building2 className="text-blue-600" size={18}/>}
                    />
                    <SummaryCard
                        title="Total de Postulantes a Arquitectura"
                        value={vocationalCepreTotal}
                        subtitle="CEPRE UNI"
                        colorClass="text-amber-600"
                        iconBgClass="bg-amber-50"
                        icon={<AlertCircle className="text-amber-600" size={18}/>}
                    />

                    <SummaryCard
                        title="Total de Postulantes a Arquitectura"
                        value={vocationalCepreIntensiveTotal}
                        subtitle="CEPRE UNI INTENSIVO"
                        colorClass="text-purple-600"
                        iconBgClass="bg-purple-50"
                        icon={<Activity className="text-purple-600" size={18}/>}
                    />
                </div>

                {/* Tabla de Semibecas (desagregado) - solo en vista ADMISION */}
                {currentView === DashboardView.ADMISION && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800">Desagregado de Semibecas Parciales</h3>
                                <span className="text-sm text-gray-400">Total: {partialTotal}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="py-2 px-3">Estado</th>
                                        <th className="py-2 px-3 text-right">Cantidad</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {partialScholarships.map((row, idx) => (
                                        <tr key={idx} className="border-b border-gray-50">
                                            <td className="py-3 px-3 text-gray-700">{row.estado}</td>
                                            <td className="py-3 px-3 text-right font-bold text-gray-800">{row.cantidad}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800">Desagregado de Declaraciones Juradas</h3>
                                <span className="text-sm text-gray-400">Total: {swornTotal}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="py-2 px-3">Estado</th>
                                        <th className="py-2 px-3 text-right">Cantidad</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {swornDeclarations.map((row, idx) => (
                                        <tr key={idx} className="border-b border-gray-50">
                                            <td className="py-3 px-3 text-gray-700">{row.estado}</td>
                                            <td className="py-3 px-3 text-right font-bold text-gray-800">{row.cantidad}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="bg-white border-t border-gray-100 py-6 text-center">
                <p className="text-xs text-gray-400">© 2024 Dashboard de Inscripciones. Todos los derechos
                    reservados.</p>
            </footer>
        </div>
    );
};

export default App;
