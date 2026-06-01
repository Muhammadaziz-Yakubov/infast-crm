import { useState, useEffect } from 'react';
import { testAPI, courseAPI, groupAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    HiOutlineClipboardList, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineDocumentDuplicate, HiOutlineEye, HiOutlineChartBar, HiOutlineCheckCircle,
    HiOutlineXCircle, HiOutlineClock, HiOutlineUserGroup, HiOutlineBookOpen,
    HiOutlineChevronLeft, HiOutlineSearch, HiOutlineFilter
} from 'react-icons/hi';
import toast from 'react-hot-toast';

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

    // Savol qo'shish modalda
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

    // Savolni o'chirish modalda
    const removeQuestion = (index) => {
        if (form.savollar.length === 1) {
            return toast.error('Testda kamida bitta savol bo\'lishi shart!');
        }
        const updated = form.savollar.filter((_, i) => i !== index);
        setForm({ ...form, savollar: updated });
    };

    // Savol matnini yangilash
    const handleQuestionChange = (index, value) => {
        const updated = [...form.savollar];
        updated[index].questionText = value;
        setForm({ ...form, savollar: updated });
    };

    // Variantni yangilash
    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...form.savollar];
        updated[qIndex].options[oIndex] = value;
        setForm({ ...form, savollar: updated });
    };

    // To'g'ri variantni tanlash
    const handleCorrectOptionChange = (qIndex, value) => {
        const updated = [...form.savollar];
        updated[qIndex].correctOption = parseInt(value);
        setForm({ ...form, savollar: updated });
    };

    // Savol ballini o'zgartirish
    const handleScoreChange = (qIndex, value) => {
        const updated = [...form.savollar];
        updated[qIndex].score = parseInt(value) || 0;
        setForm({ ...form, savollar: updated });
    };

    // Guruhlarni tanlashni boshqarish
    const handleGroupSelection = (groupId) => {
        const current = [...form.guruhlar];
        if (current.includes(groupId)) {
            setForm({ ...form, guruhlar: current.filter(id => id !== groupId) });
        } else {
            setForm({ ...form, guruhlar: [...current, groupId] });
        }
    };

    // Yaratish modalini ochish
    const openCreateModal = () => {
        setModalMode('create');
        setEditingTestId(null);
        setForm({
            nomi: '',
            kurs: courses[0]?._id || '',
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
        setShowModal(true);
    };

    // Tahrirlash modalini ochish
    const openEditModal = (test) => {
        setModalMode('edit');
        setEditingTestId(test._id);
        
        // datetime-local input formati uchun sanalarni moslashtirish (YYYY-MM-DDThh:mm)
        const start = test.boshlanishVaqti ? new Date(test.boshlanishVaqti).toISOString().substring(0, 16) : '';
        const end = test.tugashVaqti ? new Date(test.tugashVaqti).toISOString().substring(0, 16) : '';

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

    // Formani yuborish
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.guruhlar.length === 0) {
            return toast.error('Kamida bitta guruh tanlanishi shart!');
        }

        // Savollar validatsiyasi
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

        try {
            if (modalMode === 'create') {
                await testAPI.create(form);
                toast.success('Test yaratildi va Telegramga yuborildi 📢');
            } else {
                await testAPI.update(editingTestId, form);
                toast.success('Test muvaffaqiyatli tahrirlandi ✨');
            }
            setShowModal(false);
            fetchInitialData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
        }
    };

    // O'chirish
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

    // Klonlash
    const handleClone = async (id) => {
        try {
            await testAPI.clone(id);
            toast.success('Test muvaffaqiyatli klonlandi 📋');
            fetchInitialData();
        } catch (err) {
            toast.error('Klonlashda xatolik yuz berdi');
        }
    };

    // Natijalar ko'rinishiga o'tish
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

    // Sanani formatlash
    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('uz-UZ', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Statusga qarab rang va matn
    const getStatusBadge = (test) => {
        const now = new Date();
        const start = new Date(test.boshlanishVaqti);
        const end = new Date(test.tugashVaqti);

        if (now < start) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider italic">
                    <HiOutlineClock className="w-3.5 h-3.5" /> Rejalashtirilgan
                </span>
            );
        } else if (now >= start && now < end) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider animate-pulse italic">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Faol
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider italic">
                    <HiOutlineXCircle className="w-3.5 h-3.5" /> Tugagan
                </span>
            );
        }
    };

    if (loading) return <LoadingSpinner text="Testlar tizimi yuklanmoqda..." />;

    // Filtrlanadigan natijalar
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
        <div className="space-y-6 md:space-y-10 animate-fade-in max-w-7xl mx-auto pb-24 lg:pb-10 px-4 md:px-0">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    {view === 'results' ? (
                        <button
                            onClick={() => setView('list')}
                            className="inline-flex items-center gap-2 text-sm font-black text-primary-500 hover:text-primary-600 dark:text-primary-400 uppercase tracking-widest italic"
                        >
                            <HiOutlineChevronLeft className="w-4 h-4" /> Testlar ro'yxatiga qaytish
                        </button>
                    ) : null}
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                        {view === 'list' ? (
                            <>📚 Testlar <span className="text-primary-500">Boshqaruvi</span></>
                        ) : (
                            <>🏆 Test <span className="text-primary-500">Natijalari</span></>
                        )}
                    </h1>
                    <p className="text-sm font-medium text-gray-500">
                        {view === 'list' 
                            ? "Kurslar va guruhlar bo'yicha testlarni rejalashtirish va boshqarish" 
                            : `"${selectedTestResults?.testInfo.nomi}" testi bo'yicha batafsil statistika`}
                    </p>
                </div>

                {view === 'list' && (
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 italic"
                    >
                        <HiOutlinePlus className="w-5 h-5" /> Yangi Test Yaratish
                    </button>
                )}
            </div>

            {view === 'list' ? (
                <>
                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="relative">
                            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Test nomi bo'yicha qidirish..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 dark:focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all"
                            />
                        </div>

                        <div className="relative">
                            <HiOutlineBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={filterCourse}
                                onChange={e => setFilterCourse(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all appearance-none"
                            >
                                <option value="">Barcha kurslar</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.nomi}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <HiOutlineUserGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={filterGroup}
                                onChange={e => setFilterGroup(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all appearance-none"
                            >
                                <option value="">Barcha guruhlar</option>
                                {groups.map(g => (
                                    <option key={g._id} value={g._id}>{g.nomi}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tests List Card */}
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-dark-900 border-b border-gray-100 dark:border-white/5">
                                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Test Nomi</th>
                                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Kurs</th>
                                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Guruh(lar)</th>
                                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Savollar / Vaqt</th>
                                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Muddati</th>
                                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Status</th>
                                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider italic text-center">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {tests.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-12 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                                                Testlar topilmadi. Yangi test yaratish uchun yuqoridagi tugmani bosing.
                                            </td>
                                        </tr>
                                    ) : (
                                        tests.map(test => (
                                            <tr key={test._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-900/30 transition-colors">
                                                <td className="p-6">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{test.nomi}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">Urinishlar: {test.urinishlarSoni || 1}</p>
                                                </td>
                                                <td className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400">
                                                    {test.kurs?.nomi || "Nomalum Kurs"}
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                        {test.guruhlar?.map(g => (
                                                            <span key={g._id} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-950 border border-gray-200 dark:border-white/5 text-[9px] font-black uppercase text-gray-600 dark:text-gray-300">
                                                                {g.nomi}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{test.savollar?.length || 0} ta savol</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">{test.vaqtLimiti} daqiqa limit</p>
                                                </td>
                                                <td className="p-6 text-xs font-bold text-gray-500 dark:text-gray-400">
                                                    <div className="space-y-1">
                                                        <p><span className="text-emerald-500 font-extrabold uppercase">B:</span> {formatDateTime(test.boshlanishVaqti)}</p>
                                                        <p><span className="text-rose-500 font-extrabold uppercase">T:</span> {formatDateTime(test.tugashVaqti)}</p>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    {getStatusBadge(test)}
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleViewResults(test._id)}
                                                            title="Natijalarni ko'rish"
                                                            className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                                                        >
                                                            <HiOutlineChartBar className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleClone(test._id)}
                                                            title="Testni nusxalash"
                                                            className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                                        >
                                                            <HiOutlineDocumentDuplicate className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(test)}
                                                            title="Tahrirlash"
                                                            className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                                                        >
                                                            <HiOutlinePencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(test._id)}
                                                            title="O'chirish"
                                                            className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
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
                    <LoadingSpinner text="Natijalar yuklanmoqda..." />
                ) : (
                    selectedTestResults && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Analytics Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                                <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 italic">Topshirganlar</p>
                                    <h3 className="text-2xl md:text-4xl font-black text-emerald-500 tracking-tight leading-none">
                                        {selectedTestResults.analytics.topshirganlarSoni}
                                    </h3>
                                </div>
                                <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 italic">Topshirmaganlar</p>
                                    <h3 className="text-2xl md:text-4xl font-black text-rose-500 tracking-tight leading-none">
                                        {selectedTestResults.analytics.topshirmaganlarSoni}
                                    </h3>
                                </div>
                                <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 italic">O'rtacha natija</p>
                                    <h3 className="text-2xl md:text-4xl font-black text-primary-500 tracking-tight leading-none">
                                        {selectedTestResults.analytics.ortachaFoiz}%
                                    </h3>
                                </div>
                                <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 italic">Eng yuqori ball</p>
                                    <h3 className="text-2xl md:text-4xl font-black text-amber-500 tracking-tight leading-none">
                                        {selectedTestResults.analytics.engYuqoriBall}
                                    </h3>
                                </div>
                                <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm text-center col-span-2 lg:col-span-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 italic">Eng past ball</p>
                                    <h3 className="text-2xl md:text-4xl font-black text-gray-600 dark:text-gray-400 tracking-tight leading-none">
                                        {selectedTestResults.analytics.engPastBall}
                                    </h3>
                                </div>
                            </div>

                            {/* Natijalar filtri */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                                <div className="relative">
                                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="O'quvchi ismi bo'yicha qidirish..."
                                        value={resultsSearch}
                                        onChange={e => setResultsSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 dark:focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all"
                                    />
                                </div>

                                <div className="relative">
                                    <HiOutlineUserGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        value={resultsGroupFilter}
                                        onChange={e => setResultsGroupFilter(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all appearance-none"
                                    >
                                        <option value="">Barcha guruhlar</option>
                                        {groups.map(g => (
                                            <option key={g._id} value={g._id}>{g.nomi}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tables section */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Topshirganlar */}
                                <div className="xl:col-span-2 bg-white dark:bg-dark-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm flex flex-col">
                                    <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-dark-900/30">
                                        <h3 className="text-md font-black text-gray-900 dark:text-white uppercase tracking-wider italic">Topshirganlar ({filteredResults.length})</h3>
                                    </div>
                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full border-collapse text-left">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-dark-900 border-b border-gray-100 dark:border-white/5">
                                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider italic">O'quvchi</th>
                                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Guruh</th>
                                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Ball / Foiz</th>
                                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Topshirgan Vaqt</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                {filteredResults.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="p-10 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Topshirganlar topilmadi.</td>
                                                    </tr>
                                                ) : (
                                                    filteredResults.map(r => (
                                                        <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-900/30 transition-colors">
                                                            <td className="p-4">
                                                                <p className="text-sm font-black text-gray-900 dark:text-white">{r.student?.ism}</p>
                                                                <p className="text-[9px] font-bold text-gray-400 font-mono mt-0.5 uppercase">ID: {r.student?.username}</p>
                                                            </td>
                                                            <td className="p-4 text-xs font-bold text-gray-500">
                                                                {r.guruh?.nomi || 'Nomalum guruh'}
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="text-sm font-black text-gray-900 dark:text-white leading-none">{r.score} / {r.totalScore} ball</p>
                                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-dark-950 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${r.percentage}%` }}></div>
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-primary-500">{r.percentage}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-xs font-bold text-gray-400">
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
                                <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm flex flex-col">
                                    <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-dark-900/30">
                                        <h3 className="text-md font-black text-gray-900 dark:text-white uppercase tracking-wider italic">Topshirmaganlar ({filteredNonSubmitters.length})</h3>
                                    </div>
                                    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[450px] custom-scrollbar">
                                        {filteredNonSubmitters.length === 0 ? (
                                            <p className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Topshirmaganlar yo'q, hamma topshirgan! 🎉</p>
                                        ) : (
                                            filteredNonSubmitters.map(s => (
                                                <div key={s._id} className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">{s.ism}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-dark-950 text-[9px] font-black uppercase text-gray-600 dark:text-gray-300">
                                                            {s.guruh?.nomi}
                                                        </span>
                                                        <a href={`tel:${s.telefon}`} className="text-[10px] font-black text-primary-500 uppercase tracking-widest italic font-mono">{s.telefon}</a>
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
                    <div className="bg-white dark:bg-dark-800 w-full max-w-4xl rounded-[2.5rem] shadow-3xl overflow-hidden border border-gray-100 dark:border-white/5 max-h-[90vh] flex flex-col animate-scale-up">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-900 text-white">
                            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">
                                {modalMode === 'create' ? '📚 Yangi Test Yaratish' : '📝 Testni Tahrirlash'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                <HiOutlineXCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Test Nomi</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.nomi}
                                        onChange={e => setForm({ ...form, nomi: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all"
                                        placeholder="Masalan: JavaScript Oraliq Nazorat"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Kurs tanlang</label>
                                    <select
                                        value={form.kurs}
                                        onChange={e => setForm({ ...form, kurs: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all appearance-none"
                                    >
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.nomi}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Guruhlarni belgilang (ko'p tanlov)</label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-white/5 max-h-[120px] overflow-y-auto">
                                        {groups.map(g => {
                                            const isSelected = form.guruhlar.includes(g._id);
                                            return (
                                                <button
                                                    type="button"
                                                    key={g._id}
                                                    onClick={() => handleGroupSelection(g._id)}
                                                    className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${isSelected ? 'bg-primary-500 text-white border-primary-500 shadow-md' : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-300'}`}
                                                >
                                                    {g.nomi}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Vaqt limiti (Daqiqada)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={form.vaqtLimiti}
                                        onChange={e => setForm({ ...form, vaqtLimiti: parseInt(e.target.value) || 0 })}
                                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Urinishlar soni</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={form.urinishlarSoni}
                                        onChange={e => setForm({ ...form, urinishlarSoni: parseInt(e.target.value) || 1 })}
                                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Boshlanish vaqti</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={form.boshlanishVaqti}
                                        onChange={e => setForm({ ...form, boshlanishVaqti: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider italic">Tugash vaqti</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={form.tugashVaqti}
                                        onChange={e => setForm({ ...form, tugashVaqti: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all"
                                    />
                                </div>
                            </div>

                            {/* SAVOLLAR RO'YXATI */}
                            <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-md font-black text-gray-900 dark:text-white uppercase tracking-wider italic">Test Savollari ({form.savollar.length})</h3>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="px-4 py-2 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 hover:bg-primary-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-1.5"
                                    >
                                        <HiOutlinePlus className="w-3.5 h-3.5" /> Savol Qo'shish
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {form.savollar.map((q, qIndex) => (
                                        <div key={qIndex} className="p-6 bg-gray-50 dark:bg-dark-900/50 rounded-[2rem] border border-gray-100 dark:border-white/5 relative group/q shadow-sm">
                                            
                                            {/* Savolni o'chirish */}
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIndex)}
                                                className="absolute top-4 right-4 p-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover/q:opacity-100"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                                {/* Savol matni */}
                                                <div className="md:col-span-5 space-y-2">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">{qIndex + 1}-Savol Matni</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={q.questionText}
                                                        onChange={e => handleQuestionChange(qIndex, e.target.value)}
                                                        className="w-full px-5 py-3 rounded-xl bg-white dark:bg-dark-800 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all shadow-sm"
                                                        placeholder="Savol matnini yozing..."
                                                    />
                                                </div>

                                                {/* Ball */}
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Ball</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        value={q.score}
                                                        onChange={e => handleScoreChange(qIndex, e.target.value)}
                                                        className="w-full px-5 py-3 rounded-xl bg-white dark:bg-dark-800 border border-transparent focus:border-primary-500 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all shadow-sm"
                                                    />
                                                </div>

                                                {/* 4 ta Variant */}
                                                <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {['A', 'B', 'C', 'D'].map((char, oIndex) => (
                                                        <div key={oIndex} className="space-y-1">
                                                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">{char}-Variant</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={q.options[oIndex]}
                                                                onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                className="w-full px-5 py-2.5 rounded-xl bg-white dark:bg-dark-800 border border-transparent focus:border-primary-500 outline-none text-xs font-bold text-gray-900 dark:text-white transition-all shadow-sm"
                                                                placeholder={`${char} javob varianti`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* To'g'ri javob */}
                                                <div className="md:col-span-6 flex items-center justify-between p-4 bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm mt-2">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider italic">To'g'ri Javob Varianti</span>
                                                    <div className="flex gap-2">
                                                        {['A', 'B', 'C', 'D'].map((char, index) => {
                                                            const isSelected = q.correctOption === index;
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={index}
                                                                    onClick={() => handleCorrectOptionChange(qIndex, index)}
                                                                    className={`w-9 h-9 rounded-full border text-xs font-black transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400'}`}
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
                            <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-500 hover:text-gray-700 dark:hover:text-white font-black text-[10px] uppercase tracking-wider transition-all italic"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-black text-[10px] uppercase tracking-wider shadow-lg shadow-primary-500/20 transition-all italic"
                                >
                                    {modalMode === 'create' ? 'Testni Yaratish' : 'O\'zgarishlarni Saqlash'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTests;
