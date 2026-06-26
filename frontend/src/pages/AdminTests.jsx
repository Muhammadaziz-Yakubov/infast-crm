import { useState, useEffect } from 'react';
import { testAPI, courseAPI, groupAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    HiOutlineClipboardList, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineDocumentDuplicate, HiOutlineChartBar, HiOutlineCheckCircle,
    HiOutlineXCircle, HiOutlineClock, HiOutlineUserGroup, HiOutlineBookOpen,
    HiOutlineChevronLeft, HiOutlineSearch, HiOutlineX
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const toTashkentDatetimeValue = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    // Tashkent is UTC+5, so we add 5 hours to UTC time
    const tashkentTime = new Date(d.getTime() + (5 * 60 * 60 * 1000));
    return tashkentTime.toISOString().slice(0, 16);
};

const AdminTests = () => {
    const [tests, setTests] = useState([]);
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    // Active tab / view
    // 'list' yoki 'results'
    const [view, setView] = useState('list');
    const [selectedTestResults, setSelectedTestResults] = useState(null);
    const [resultsLoading, setResultsLoading] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' yoki 'edit'
    const [editingTestId, setEditingTestId] = useState(null);

    // Filter states
    const [filterCourse, setFilterCourse] = useState('');
    const [filterGroup, setFilterGroup] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Natijalar filtrlari
    const [resultsSearch, setResultsSearch] = useState('');
    const [resultsGroupFilter, setResultsGroupFilter] = useState('');

    // Form state
    const [form, setForm] = useState({
        nomi: '',
        kurs: '',
        guruhlar: [],
        vaqtLimiti: 30,
        boshlanishVaqti: '',
        tugashVaqti: '',
        urinishlarSoni: 1,
        savollar: [
            {
                questionText: '',
                options: ['', '', '', ''],
                correctOption: 0,
                score: 5
            }
        ]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [testsRes, coursesRes, groupsRes] = await Promise.all([
                testAPI.getAll(),
                courseAPI.getAll(),
                groupAPI.getAll()
            ]);
            setTests(testsRes.data.data);
            setCourses(coursesRes.data.data);
            setGroups(groupsRes.data.data);
        } catch (err) {
            toast.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTests = async () => {
        try {
            const res = await testAPI.getAll({
                kurs: filterCourse,
                guruh: filterGroup,
                search: searchTerm
            });
            setTests(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!loading) {
            fetchTests();
        }
    }, [filterCourse, filterGroup, searchTerm]);

    const addQuestion = () => {
        setForm({
            ...form,
            savollar: [
                ...form.savollar,
                {
                    questionText: '',
                    options: ['', '', '', ''],
                    correctOption: 0,
                    score: 5
                }
            ]
        });
    };

    const removeQuestion = (index) => {
        if (form.savollar.length === 1) {
            return toast.error('Testda kamida bitta savol bo\'lishi shart!');
        }
        const updated = form.savollar.filter((_, i) => i !== index);
        setForm({ ...form, savollar: updated });
    };

    const handleQuestionChange = (index, value) => {
        const updated = [...form.savollar];
        updated[index].questionText = value;
        setForm({ ...form, savollar: updated });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...form.savollar];
        updated[qIndex].options[oIndex] = value;
        setForm({ ...form, savollar: updated });
    };

    const handleCorrectOptionChange = (qIndex, value) => {
        const updated = [...form.savollar];
        updated[qIndex].correctOption = parseInt(value);
        setForm({ ...form, savollar: updated });
    };

    const handleScoreChange = (qIndex, value) => {
        const updated = [...form.savollar];
        updated[qIndex].score = parseInt(value) || 0;
        setForm({ ...form, savollar: updated });
    };

    const handleGroupSelection = (groupId) => {
        const current = [...form.guruhlar];
        if (current.includes(groupId)) {
            setForm({ ...form, guruhlar: current.filter(id => id !== groupId) });
        } else {
            setForm({ ...form, guruhlar: [...current, groupId] });
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setEditingTestId(null);
        
        const now = new Date();
        const start = toTashkentDatetimeValue(now);
        const end = toTashkentDatetimeValue(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // Default to 24 hours later

        setForm({
            nomi: '',
            kurs: courses[0]?._id || '',
            guruhlar: [],
            vaqtLimiti: 30,
            boshlanishVaqti: start,
            tugashVaqti: end,
            urinishlarSoni: 1,
            savollar: [
                {
                    questionText: '',
                    options: ['', '', '', ''],
                    correctOption: 0,
                    score: 5
                }
            ]
        });
        setShowModal(true);
    };

    const openEditModal = (test) => {
        setModalMode('edit');
        setEditingTestId(test._id);
        
        const start = test.boshlanishVaqti ? toTashkentDatetimeValue(test.boshlanishVaqti) : '';
        const end = test.tugashVaqti ? toTashkentDatetimeValue(test.tugashVaqti) : '';

        setForm({
            nomi: test.nomi,
            kurs: test.kurs?._id || test.kurs,
            guruhlar: test.guruhlar?.map(g => g._id) || [],
            vaqtLimiti: test.vaqtLimiti,
            boshlanishVaqti: start,
            tugashVaqti: end,
            urinishlarSoni: test.urinishlarSoni || 1,
            savollar: test.savollar.map(q => ({
                questionText: q.questionText,
                options: [...q.options],
                correctOption: q.correctOption,
                score: q.score
            }))
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.guruhlar.length === 0) {
            return toast.error('Kamida bitta guruh tanlanishi shart!');
        }

        for (let i = 0; i < form.savollar.length; i++) {
            const q = form.savollar[i];
            if (!q.questionText.trim()) {
                return toast.error(`${i + 1}-savol matni kiritilmagan!`);
            }
            for (let j = 0; j < 4; j++) {
                if (!q.options[j].trim()) {
                    return toast.error(`${i + 1}-savolning barcha variantlari to'ldirilishi shart!`);
                }
            }
        }

        const submitData = {
            ...form,
            boshlanishVaqti: form.boshlanishVaqti ? new Date(form.boshlanishVaqti + "+05:00").toISOString() : '',
            tugashVaqti: form.tugashVaqti ? new Date(form.tugashVaqti + "+05:00").toISOString() : ''
        };

        try {
            if (modalMode === 'create') {
                await testAPI.create(submitData);
                toast.success('Test yaratildi va Telegramga yuborildi 📢');
            } else {
                await testAPI.update(editingTestId, submitData);
                toast.success('Test muvaffaqiyatli tahrirlandi ✨');
            }
            setShowModal(false);
            fetchInitialData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Haqiqatdan ham ushbu testni va barcha o\'quvchi natijalarini o\'chirmoqchimisiz?')) {
            try {
                await testAPI.delete(id);
                toast.success('Test va natijalar o\'chirildi 🗑️');
                fetchInitialData();
            } catch (err) {
                toast.error('O\'chirishda xatolik yuz berdi');
            }
        }
    };

    const handleClone = async (id) => {
        try {
            await testAPI.clone(id);
            toast.success('Test muvaffaqiyatli klonlandi 📋');
            fetchInitialData();
        } catch (err) {
            toast.error('Klonlashda xatolik yuz berdi');
        }
    };

    const handleViewResults = async (testId) => {
        try {
            setView('results');
            setResultsLoading(true);
            const res = await testAPI.getResults(testId);
            setSelectedTestResults(res.data.data);
            setResultsSearch('');
            setResultsGroupFilter('');
        } catch (err) {
            toast.error('Natijalarni yuklashda xatolik yuz berdi');
            setView('list');
        } finally {
            setResultsLoading(false);
        }
    };

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('uz-UZ', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (test) => {
        const now = new Date();
        const start = new Date(test.boshlanishVaqti);
        const end = new Date(test.tugashVaqti);

        if (now < start) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    Kutilmoqda
                </span>
            );
        } else if (now >= start && now < end) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold border bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20">
                    Faol
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold border bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20">
                    Tugagan
                </span>
            );
        }
    };

    if (loading) return <LoadingSpinner />;

    const filteredResults = selectedTestResults?.results.filter(r => {
        const nameMatch = r.student?.ism.toLowerCase().includes(resultsSearch.toLowerCase());
        const groupMatch = resultsGroupFilter ? r.guruh?._id === resultsGroupFilter : true;
        return nameMatch && groupMatch;
    }) || [];

    const filteredNonSubmitters = selectedTestResults?.nonSubmitters.filter(s => {
        const nameMatch = s.ism.toLowerCase().includes(resultsSearch.toLowerCase());
        const groupMatch = resultsGroupFilter ? s.guruh?._id === resultsGroupFilter : true;
        return nameMatch && groupMatch;
    }) || [];

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    {view === 'results' && (
                        <button
                            onClick={() => setView('list')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066FF] hover:underline mb-2"
                        >
                            <HiOutlineChevronLeft className="w-4 h-4" />
                            <span>Orqaga qaytish</span>
                        </button>
                    )}
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">
                        {view === 'list' ? 'Testlar boshqaruvi' : 'Test natijalari'}
                    </h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1 font-medium">
                        {view === 'list' 
                            ? "Kurslar va guruhlar bo'yicha oraliq/yakuniy testlar" 
                            : `"${selectedTestResults?.testInfo.nomi}" bo'yicha batafsil statistika`}
                    </p>
                </div>

                {view === 'list' && (
                    <button
                        onClick={openCreateModal}
                        className="btn-primary flex items-center gap-2"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span>Yangi test yaratish</span>
                    </button>
                )}
            </div>

            {view === 'list' ? (
                <>
                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60">
                        <div className="relative">
                            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Qidirish..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold"
                            />
                        </div>

                        <div>
                            <select
                                value={filterCourse}
                                onChange={e => setFilterCourse(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold cursor-pointer"
                            >
                                <option value="">Barcha kurslar</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.nomi}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={filterGroup}
                                onChange={e => setFilterGroup(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold cursor-pointer"
                            >
                                <option value="">Barcha guruhlar</option>
                                {groups.map(g => (
                                    <option key={g._id} value={g._id}>{g.nomi}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tests List Card */}
                    <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-150 dark:border-zinc-900/60">
                                        <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Test nomi</th>
                                        <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Kurs</th>
                                        <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Guruhlar</th>
                                        <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Savollar / Vaqt</th>
                                        <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Muddati</th>
                                        <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Amal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-150 dark:divide-zinc-900/60">
                                    {tests.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-xs text-zinc-400 font-semibold">
                                                Testlar topilmadi.
                                            </td>
                                        </tr>
                                    ) : (
                                        tests.map(test => (
                                            <tr key={test._id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{test.nomi}</p>
                                                    <span className="text-[10px] text-zinc-400 mt-1 block">Urinishlar: {test.urinishlarSoni || 1} marta</span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-semibold text-zinc-600 dark:text-zinc-350">
                                                    {test.kurs?.nomi || "Yo'q"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                        {test.guruhlar?.map(g => (
                                                            <span key={g._id} className="px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] font-semibold text-zinc-600 dark:text-zinc-300">
                                                                {g.nomi}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{test.savollar?.length || 0} ta savol</p>
                                                    <p className="text-[10px] text-zinc-400 mt-0.5">{test.vaqtLimiti} daqiqa</p>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                                                    <div className="space-y-0.5">
                                                        <p><span className="text-[#00C853] font-semibold">B:</span> {formatDateTime(test.boshlanishVaqti)}</p>
                                                        <p><span className="text-[#FF3B30] font-semibold">T:</span> {formatDateTime(test.tugashVaqti)}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(test)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleViewResults(test._id)}
                                                            title="Natijalarni ko'rish"
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#0066FF] transition-all"
                                                        >
                                                            <HiOutlineChartBar className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleClone(test._id)}
                                                            title="Testni nusxalash"
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#0066FF] transition-all"
                                                        >
                                                            <HiOutlineDocumentDuplicate className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(test)}
                                                            title="Tahrirlash"
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#0066FF] transition-all"
                                                        >
                                                            <HiOutlinePencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(test._id)}
                                                            title="O'chirish"
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#FF3B30] transition-all"
                                                        >
                                                            <HiOutlineTrash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* Natijalar ko'rinishi */
                resultsLoading ? (
                    <LoadingSpinner />
                ) : (
                    selectedTestResults && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Analytics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60 text-center">
                                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Topshirganlar</span>
                                    <span className="text-xl font-bold text-[#00C853]">{selectedTestResults.analytics.topshirganlarSoni}</span>
                                </div>
                                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60 text-center">
                                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Topshirmaganlar</span>
                                    <span className="text-xl font-bold text-[#FF3B30]">{selectedTestResults.analytics.topshirmaganlarSoni}</span>
                                </div>
                                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60 text-center">
                                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">O'rtacha foiz</span>
                                    <span className="text-xl font-bold text-[#0066FF]">{selectedTestResults.analytics.ortachaFoiz}%</span>
                                </div>
                                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60 text-center">
                                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Eng yuqori ball</span>
                                    <span className="text-xl font-bold text-[#FF9500]">{selectedTestResults.analytics.engYuqoriBall}</span>
                                </div>
                                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60 text-center col-span-2 md:col-span-1">
                                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Eng past ball</span>
                                    <span className="text-xl font-bold text-zinc-500">{selectedTestResults.analytics.engPastBall}</span>
                                </div>
                            </div>

                            {/* Natijalar filtri */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60">
                                <div className="relative">
                                    <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="O'quvchi ismi..."
                                        value={resultsSearch}
                                        onChange={e => setResultsSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold"
                                    />
                                </div>

                                <div>
                                    <select
                                        value={resultsGroupFilter}
                                        onChange={e => setResultsGroupFilter(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold cursor-pointer"
                                    >
                                        <option value="">Barcha guruhlar</option>
                                        {groups.map(g => (
                                            <option key={g._id} value={g._id}>{g.nomi}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tables section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Topshirganlar */}
                                <div className="lg:col-span-2 bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 overflow-hidden">
                                    <div className="p-4 border-b border-gray-150 dark:border-zinc-900/60 bg-gray-50/30 dark:bg-zinc-900/10">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Topshirganlar ({filteredResults.length})</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-150 dark:border-zinc-900/60">
                                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">O'quvchi</th>
                                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Guruh</th>
                                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Ball / Foiz</th>
                                                    <th className="px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Sana</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-150 dark:divide-zinc-900/60">
                                                {filteredResults.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-8 text-center text-xs text-zinc-400 font-semibold">Topshirganlar topilmadi.</td>
                                                    </tr>
                                                ) : (
                                                    filteredResults.map(r => (
                                                        <tr key={r._id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.student?.ism}</p>
                                                                <span className="text-[10px] text-zinc-400 mt-0.5 block">ID: {r.student?.username}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-zinc-500 font-medium">
                                                                {r.guruh?.nomi || 'Yo\'q'}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{r.score} / {r.totalScore} ball</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="w-16 h-1 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-[#0066FF] rounded-full" style={{ width: `${r.percentage}%` }}></div>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-[#0066FF]">{r.percentage}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-zinc-400">
                                                                {formatDateTime(r.completedAt)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Topshirmaganlar */}
                                <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-gray-150 dark:border-zinc-900/60 bg-gray-50/30 dark:bg-zinc-900/10">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Topshirmaganlar ({filteredNonSubmitters.length})</h3>
                                    </div>
                                    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                                        {filteredNonSubmitters.length === 0 ? (
                                            <p className="py-8 text-center text-xs text-zinc-400 font-semibold">Topshirmaganlar yo'q! 🎉</p>
                                        ) : (
                                            filteredNonSubmitters.map(s => (
                                                <div key={s._id} className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{s.ism}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-semibold text-zinc-600 dark:text-zinc-350">
                                                            {s.guruh?.nomi}
                                                        </span>
                                                        <a href={`tel:${s.telefon}`} className="text-[10px] font-semibold text-[#0066FF]">{s.telefon}</a>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )
            )}

            {/* Test Yaratish / Tahrirlash Modali */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-[#111111] w-full max-w-4xl rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-zinc-900/60 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-150 dark:border-zinc-900/60 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                {modalMode === 'create' ? 'Yangi test yaratish' : 'Testni tahrirlash'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-850 text-zinc-400 hover:text-zinc-600"
                            >
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Test nomi</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.nomi}
                                        onChange={e => setForm({ ...form, nomi: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold"
                                        placeholder="Masalan: HTML & CSS imtihoni"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Kursni tanlang</label>
                                    <select
                                        value={form.kurs}
                                        onChange={e => setForm({ ...form, kurs: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer"
                                    >
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.nomi}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Guruhlarni tanlang</label>
                                    <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 max-h-[100px] overflow-y-auto">
                                        {groups.map(g => {
                                            const isSelected = form.guruhlar.includes(g._id);
                                            return (
                                                <button
                                                    type="button"
                                                    key={g._id}
                                                    onClick={() => handleGroupSelection(g._id)}
                                                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${isSelected ? 'bg-[#0066FF] text-white border-[#0066FF]' : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
                                                >
                                                    {g.nomi}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Vaqt limiti (Daqiqada)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={form.vaqtLimiti}
                                        onChange={e => setForm({ ...form, vaqtLimiti: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-bold"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Urinishlar soni</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={form.urinishlarSoni}
                                        onChange={e => setForm({ ...form, urinishlarSoni: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-bold"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Boshlanish vaqti</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={form.boshlanishVaqti}
                                        onChange={e => setForm({ ...form, boshlanishVaqti: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tugash vaqti</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={form.tugashVaqti}
                                        onChange={e => setForm({ ...form, tugashVaqti: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* SAVOLLAR RO'YXATI */}
                            <div className="pt-4 border-t border-gray-150 dark:border-zinc-900/60 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Savollar ro'yxati ({form.savollar.length})</h3>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="px-2.5 py-1.5 rounded bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 hover:bg-[#0066FF]/25 text-xs font-semibold transition-all flex items-center gap-1"
                                    >
                                        <HiOutlinePlus className="w-3.5 h-3.5" />
                                        <span>Savol qo'shish</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {form.savollar.map((q, qIndex) => (
                                        <div key={qIndex} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg relative group">
                                            {/* Savolni o'chirish */}
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIndex)}
                                                className="absolute top-3 right-3 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-[#FF3B30] transition-colors"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                                {/* Savol matni */}
                                                <div className="md:col-span-5 space-y-1">
                                                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">{qIndex + 1}-savol matni</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={q.questionText}
                                                        onChange={e => handleQuestionChange(qIndex, e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:border-[#0066FF] outline-none text-sm font-semibold"
                                                        placeholder="Savol matni..."
                                                    />
                                                </div>

                                                {/* Ball */}
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Ball</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        value={q.score}
                                                        onChange={e => handleScoreChange(qIndex, e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:border-[#0066FF] outline-none text-sm font-bold"
                                                    />
                                                </div>

                                                {/* 4 ta Variant */}
                                                <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {['A', 'B', 'C', 'D'].map((char, oIndex) => (
                                                        <div key={oIndex} className="space-y-1">
                                                            <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">{char}-variant</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={q.options[oIndex]}
                                                                onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:border-[#0066FF] outline-none text-xs font-semibold"
                                                                placeholder={`${char} javob varianti`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* To'g'ri javob */}
                                                <div className="md:col-span-6 flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg mt-2">
                                                    <span className="text-xs font-semibold text-zinc-500">To'g'ri variant</span>
                                                    <div className="flex gap-1.5">
                                                        {['A', 'B', 'C', 'D'].map((char, index) => {
                                                            const isSelected = q.correctOption === index;
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={index}
                                                                    onClick={() => handleCorrectOptionChange(qIndex, index)}
                                                                    className={`w-7 h-7 rounded-full border text-xs font-bold transition-all ${isSelected ? 'bg-[#00C853] border-[#00C853] text-white' : 'bg-transparent border-gray-200 dark:border-zinc-700 text-zinc-500'}`}
                                                                >
                                                                    {char}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-150 dark:border-zinc-900/60">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Bekor qilish</button>
                                <button type="submit" className="btn-primary">{modalMode === 'create' ? 'Yaratish' : 'Saqlash'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTests;
