import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineSearch,
    HiOutlineFilter,
    HiOutlineCollection,
    HiOutlineTable,
    HiOutlineChartBar,
    HiOutlinePhone,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlineChatAlt2,
    HiOutlineBadgeCheck,
    HiOutlineXCircle,
    HiOutlineBell,
    HiOutlineAcademicCap,
    HiOutlineTrendingUp,
    HiOutlineUserAdd,
    HiOutlineLink
} from 'react-icons/hi';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area,
    BarChart, Bar, LabelList
} from 'recharts';

const STATUSES = ['Yangi Lead', 'Bog\'lanildi', 'Qiziqdi', 'Sinov darsi', 'O\'quvchi bo\'ldi', 'Yo\'qotildi'];
const SOURCES = ['Instagram', 'Telegram', 'YouTube', 'TikTok', 'Referral', 'Website'];

const Marketing = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard'); // dashboard, table, kanban
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkSource, setLinkSource] = useState('Instagram');
    const [editingLead, setEditingLead] = useState(null);

    // Filters & Search
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSource, setFilterSource] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        course: '',
        source: 'Telegram',
        status: 'Yangi Lead',
        followUpDate: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterSource, filterDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leadsRes, statsRes] = await Promise.all([
                leadAPI.getAll({
                    status: filterStatus,
                    source: filterSource,
                    date: filterDate,
                    search: search
                }),
                leadAPI.getStats()
            ]);
            setLeads(leadsRes.data.data);
            setStats(statsRes.data.data);
        } catch (err) {
            toast.error('Ma\'lumotlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLead) {
                await leadAPI.update(editingLead._id, formData);
                toast.success('Lead yangilandi');
            } else {
                await leadAPI.create(formData);
                toast.success('Yangi lead qo\'shildi');
            }
            setIsModalOpen(false);
            setEditingLead(null);
            fetchData();
        } catch (err) {
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Haqiqatan ham bu leadni o\'chirmoqchimisiz?')) return;
        try {
            await leadAPI.delete(id);
            toast.success('Lead o\'chirildi');
            fetchData();
        } catch (err) {
            toast.error('O\'chirishda xatolik');
        }
    };

    const openEditModal = (lead) => {
        setEditingLead(lead);
        setFormData({
            name: lead.name,
            phone: lead.phone,
            course: lead.course,
            source: lead.source,
            status: lead.status,
            followUpDate: lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '',
            notes: lead.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleEnroll = (lead) => {
        navigate('/students', { state: { lead } });
    };

    const copyLink = () => {
        const link = `${window.location.origin}/join/${linkSource}`;
        navigator.clipboard.writeText(link);
        toast.success(`Nusxalandi: ${linkSource} linki 🔗`);
    };

    // Drag and Drop Logic
    const onDragStart = (e, leadId) => {
        e.dataTransfer.setData('leadId', leadId);
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const onDrop = async (e, newStatus) => {
        const leadId = e.dataTransfer.getData('leadId');
        try {
            await leadAPI.update(leadId, { status: newStatus });
            toast.success(`Holat: ${newStatus}`);
            fetchData();
        } catch (err) {
            toast.error('Yangilashda xatolik');
        }
    };

    // Follow-up Reminders
    const todayReminders = useMemo(() => {
        if (!leads) return [];
        const todayStr = new Date().toISOString().split('T')[0];
        return leads.filter(l => l.followUpDate && l.followUpDate.startsWith(todayStr));
    }, [leads]);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (loading && !leads.length) return <LoadingSpinner text="Marketing ma'lumotlari yuklanmoqda..." />;

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight flex items-center gap-3">
                        Marketing <span className="text-primary-500">Boshqaruvi</span>
                        {todayReminders.length > 0 && (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 italic opacity-80">Leadlar va konversiyani boshqarish tizimi</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-dark-900 p-1 rounded-2xl border border-gray-200 dark:border-white/5 shadow-inner">
                        <button
                            onClick={() => setActiveView('dashboard')}
                            className={`p-3 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-white dark:bg-dark-800 text-primary-500 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Dashboard"
                        >
                            <HiOutlineChartBar className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setActiveView('table')}
                            className={`p-3 rounded-xl transition-all ${activeView === 'table' ? 'bg-white dark:bg-dark-800 text-primary-500 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Table View"
                        >
                            <HiOutlineTable className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setActiveView('kanban')}
                            className={`p-3 rounded-xl transition-all ${activeView === 'kanban' ? 'bg-white dark:bg-dark-800 text-primary-500 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Kanban Board"
                        >
                            <HiOutlineCollection className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsLinkModalOpen(true)}
                        className="bg-white dark:bg-dark-800 text-gray-900 dark:text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 border border-gray-100 dark:border-white/5 transition-all shadow-xl shadow-gray-200/20 active:scale-95 flex items-center gap-3"
                    >
                        <HiOutlineLink className="w-5 h-5 text-primary-500" />
                        Link Yaratish
                    </button>
                    <button
                        onClick={() => {
                            setEditingLead(null);
                            setFormData({ name: '', phone: '', course: '', source: 'Telegram', status: 'Yangi Lead', followUpDate: '', notes: '' });
                            setIsModalOpen(true);
                        }}
                        className="bg-primary-500 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95 flex items-center gap-3"
                    >
                        <HiOutlinePlus className="w-5 h-5" />
                        Yangi Lead
                    </button>
                </div>
            </div>

            {/* Reminders Alert */}
            {todayReminders.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-bounce-subtle">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                            <HiOutlineBell className="w-6 h-6 animate-swing" />
                        </div>
                        <div>
                            <h4 className="font-black text-red-500 uppercase italic tracking-tight text-sm">Bugun bog'lanish kerak!</h4>
                            <p className="text-xs font-bold text-red-500/70 uppercase tracking-widest">{todayReminders.length} ta leadga qo'ng'iroq qilish zarur</p>
                        </div>
                    </div>
                    <div className="flex -space-x-3">
                        {todayReminders.slice(0, 5).map((l, i) => (
                            <div key={i} className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border-2 border-red-500/30 flex items-center justify-center font-black text-xs text-red-500 shadow-sm" title={l.name}>
                                {l.name.charAt(0)}
                            </div>
                        ))}
                        {todayReminders.length > 5 && (
                            <div className="w-10 h-10 rounded-full bg-red-500 border-2 border-white flex items-center justify-center font-black text-[10px] text-white">
                                +{todayReminders.length - 5}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeView === 'dashboard' && stats && (
                <div className="space-y-8">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[
                            { label: 'Jami Leadlar', value: stats.totalLeads, color: 'primary', icon: HiOutlineUser },
                            { label: 'Bugun Kelganlar', value: stats.newLeadsToday, color: 'emerald', icon: HiOutlinePlus },
                            { label: 'Bog\'lanilganlar', value: stats.contactedLeads, color: 'blue', icon: HiOutlinePhone },
                            { label: 'O\'quvchilar', value: stats.enrolledLeads, color: 'purple', icon: HiOutlineBadgeCheck },
                            { label: 'Konversiya %', value: stats.conversionRate + '%', color: 'amber', icon: HiOutlineTrendingUp },
                        ].map((s, i) => (
                            <div key={i} className="bg-white dark:bg-dark-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm group hover:shadow-2xl transition-all duration-500">
                                <div className={`w-14 h-14 rounded-2xl bg-${s.color}-500/10 text-${s.color}-500 flex items-center justify-center mb-6 shadow-lg shadow-${s.color}-500/10 group-hover:scale-110 transition-transform`}>
                                    <s.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{s.label}</h3>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Analytics Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Leads per Day */}
                        <div className="bg-white dark:bg-dark-800 p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-8">Leadlar <span className="text-primary-500">Dinamikasi</span></h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.dailyLeads}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', background: '#fff' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#6366f1' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Leads by Source */}
                        <div className="bg-white dark:bg-dark-800 p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-8">Manbalar <span className="text-primary-500">Tahlili</span></h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.sourceDistribution}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={8}
                                            dataKey="count"
                                            nameKey="_id"
                                        >
                                            {stats.sourceDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', background: '#fff' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Conversion Funnel */}
                        <div className="bg-white dark:bg-dark-800 p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden lg:col-span-2">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-8">Konversiya <span className="text-primary-500">Hunisi</span></h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={stats.funnelData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#88888820" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} width={100} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', background: '#fff' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                                        />
                                        <Bar dataKey="count" fill="#6366f1" radius={[0, 20, 20, 0]} barSize={40}>
                                            <LabelList dataKey="count" position="right" style={{ fontSize: 12, fontWeight: 'black', fill: '#6366f1' }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'table' && (
                <div className="space-y-6">
                    {/* Filters & Search */}
                    <div className="bg-white dark:bg-dark-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative group">
                                <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Ism yoki telefon..."
                                    className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 pl-14 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase tracking-tight"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <HiOutlineFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 pl-14 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase tracking-tight appearance-none"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="">Barcha Holatlar</option>
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <HiOutlineCollection className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 pl-14 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase tracking-tight appearance-none"
                                    value={filterSource}
                                    onChange={(e) => setFilterSource(e.target.value)}
                                >
                                    <option value="">Barcha Manbalar</option>
                                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <HiOutlineCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 pl-14 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase tracking-tight"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-dark-800 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden overflow-x-auto border-collapse">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lead</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kurs/Manba</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Holat</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Menejer</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bog'lanish</th>
                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sana</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {leads.map((lead) => (
                                    <tr key={lead._id} className="group hover:bg-gray-50/50 dark:hover:bg-dark-900/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-black text-lg border border-primary-500/20 shadow-sm shrink-0">
                                                    {lead.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-gray-900 dark:text-white uppercase italic tracking-tight truncate">{lead.name}</p>
                                                    <p className="text-xs font-bold text-gray-400 italic mt-0.5">{lead.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="font-black text-gray-800 dark:text-gray-200 uppercase text-xs tracking-tight italic line-clamp-1">{lead.course}</p>
                                            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{lead.source}</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="relative inline-block w-40">
                                                <select
                                                    defaultValue={lead.status}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        try {
                                                            await leadAPI.update(lead._id, { status: newStatus });
                                                            toast.success(`Holat: ${newStatus}`);
                                                            fetchData();
                                                        } catch (err) {
                                                            toast.error('Xatolik yuz berdi');
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm cursor-pointer appearance-none text-center focus:ring-2 focus:ring-primary-500/20 transition-all
                                                        ${lead.status === 'O\'quvchi bo\'ldi' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            lead.status === 'Yo\'qotildi' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}
                                                >
                                                    {STATUSES.map(s => (
                                                        <option key={s} value={s} className="bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-xs font-bold uppercase">{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-dark-900 flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-200 dark:border-white/5">A</div>
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Admin</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-1">
                                                <p className="font-black text-blue-500 italic text-xs uppercase tracking-tighter">
                                                    {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : '—'}
                                                </p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase italic line-clamp-1 max-w-[120px]">{lead.notes || 'Izoh yo\'q'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-[10px] font-bold text-gray-400 italic">{new Date(lead.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleEnroll(lead)} title="O'quvchi sifatida qo'shish" className="p-3 bg-white dark:bg-dark-900 rounded-xl text-emerald-500 hover:scale-110 shadow-lg border border-gray-100 dark:border-white/5 transition-transform"><HiOutlineUserAdd className="w-4 h-4" /></button>
                                                <button onClick={() => openEditModal(lead)} className="p-3 bg-white dark:bg-dark-900 rounded-xl text-blue-500 hover:scale-110 shadow-lg border border-gray-100 dark:border-white/5 transition-transform"><HiOutlinePencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(lead._id)} className="p-3 bg-white dark:bg-dark-900 rounded-xl text-red-500 hover:scale-110 shadow-lg border border-gray-100 dark:border-white/5 transition-transform"><HiOutlineTrash className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeView === 'kanban' && (
                <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar snap-x">
                    {STATUSES.map(column => (
                        <div
                            key={column}
                            className="flex-shrink-0 w-[320px] snap-start"
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, column)}
                        >
                            <div className="flex items-center justify-between mb-6 px-4">
                                <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest italic">{column}</h3>
                                <span className="bg-gray-100 dark:bg-dark-900 text-[10px] font-black text-gray-500 px-3 py-1 rounded-full">{leads.filter(l => l.status === column).length}</span>
                            </div>

                            <div className="space-y-4 min-h-[60vh] bg-gray-50/50 dark:bg-dark-900/30 p-4 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/5">
                                {leads.filter(l => l.status === column).map(lead => (
                                    <div
                                        key={lead._id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, lead._id)}
                                        className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest">{lead.source}</span>
                                            <button onClick={() => openEditModal(lead)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-primary-500 transition-all"><HiOutlinePencil className="w-3 h-3" /></button>
                                        </div>
                                        <h4 className="font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-1">{lead.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 italic mb-4">{lead.phone}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-tighter italic">
                                                <HiOutlineAcademicCap className="w-3 h-3 text-primary-500" />
                                                {lead.course}
                                            </div>
                                            <button
                                                onClick={() => handleEnroll(lead)}
                                                className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                title="O'quvchi sifatida qo'shish"
                                            >
                                                <HiOutlineUserAdd className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingLead ? 'Leadni tahrirlash' : 'Yangi Lead qo\'shish'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">F.I.O</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase italic"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Telefon</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all italic"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Qiziqqan Kursi</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase italic"
                            value={formData.course}
                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Manba</label>
                            <select
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase appearance-none"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            >
                                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Holat</label>
                            <select
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase appearance-none"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Follow-up sana</label>
                            <input
                                type="date"
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all"
                                value={formData.followUpDate}
                                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Eslatmalar</label>
                        <textarea
                            className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all min-h-[100px]"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-4 bg-gray-100 dark:bg-dark-900 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                        >
                            Saqlash
                        </button>
                    </div>
                </form>
            </Modal>
            {/* Link Modal */}
            <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title="Marketing Link Yaratish">
                <div className="p-8 space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Manbani Tanlang</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {SOURCES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setLinkSource(s)}
                                    className={`px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all border
                                        ${linkSource === s ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20' : 'bg-gray-50 dark:bg-dark-900/50 text-gray-500 border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-dark-900'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 p-6 bg-primary-500/5 rounded-3xl border border-primary-500/10">
                        <label className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] italic">Tayyor Link</label>
                        <div className="flex items-center gap-4 bg-white dark:bg-dark-900 p-2 rounded-2xl border border-gray-100 dark:border-white/5">
                            <input
                                readOnly
                                value={`${window.location.origin}/join/${linkSource}`}
                                className="flex-1 bg-transparent border-none text-[10px] font-black text-gray-600 dark:text-gray-400 italic px-4 focus:ring-0"
                            />
                            <button
                                onClick={copyLink}
                                className="bg-primary-500 text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-500/20"
                            >
                                <HiOutlineLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest italic leading-relaxed">
                        * Ushbu linkni ijtimoiy tarmoqlarga yoki reklama tugmalariga joylang. Link orqali kelgan leadlar avtomatik "{linkSource}" manbasi bilan saqlanadi.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default Marketing;
