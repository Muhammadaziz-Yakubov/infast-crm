import React, { useState } from 'react';
import { useMarketing, mapStatusFromDB, mapStatusToDB } from '../../context/MarketingContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineSearch,
    HiOutlineFilter,
    HiOutlinePlus,
    HiOutlineViewGrid,
    HiOutlineViewList,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlinePhone,
    HiOutlineBookOpen,
    HiOutlineCalendar,
    HiOutlineChatAlt,
    HiOutlineX,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle
} from 'react-icons/hi';

const columns = [
    { key: 'Yangi', label: 'Yangi', color: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5' },
    { key: 'Aloqaga chiqilgan', label: 'Aloqaga chiqilgan', color: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5' },
    { key: 'Trial dars', label: 'Trial dars', color: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5' },
    { key: 'Kutilyapti', label: 'Kutilyapti', color: 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5' },
    { key: 'O‘quvchi bo‘ldi', label: 'O‘quvchi bo‘ldi', color: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' },
    { key: 'Bekor qilingan', label: 'Bekor qilingan', color: 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5' }
];

const coursesList = ['Frontend React', 'Python Backend', 'UX/UI Dizayn', 'English for Kids', 'SMM & Marketing'];
const sourcesList = ['Instagram', 'Telegram', 'YouTube', 'TikTok', 'Website', 'Referral', 'Offline'];

const LeadManagement = () => {
    const { leads, createLead, updateLead, deleteLead, loadingLeads } = useMarketing();
    
    // UI state
    const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    
    // Pagination state for List View
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modals state
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Form inputs state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        course: coursesList[0],
        source: sourcesList[0],
        status: 'Yangi',
        notes: ''
    });

    // 1. Filtering logic
    const filteredLeads = leads.filter(lead => {
        const mappedStatus = mapStatusFromDB(lead.status);
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              lead.phone.includes(searchTerm);
        const matchesSource = sourceFilter ? lead.source === sourceFilter : true;
        const matchesCourse = courseFilter ? lead.course === courseFilter : true;
        return matchesSearch && matchesSource && matchesCourse;
    });

    // 2. Pagination logic for table view
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const paginatedLeads = filteredLeads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Drag and Drop handlers for Kanban
    const handleDragStart = (e, id) => {
        e.dataTransfer.setData('text/plain', id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetStatus) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (id) {
            const dbStatusName = mapStatusToDB(targetStatus);
            await updateLead(id, { status: dbStatusName });
        }
    };

    // Save lead submission
    const handleSaveLead = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            alert('Ism va Telefon raqam kiritilishi shart!');
            return;
        }

        const dataToSave = {
            name: formData.name,
            phone: formData.phone,
            course: formData.course,
            source: formData.source,
            status: mapStatusToDB(formData.status),
            notes: formData.notes
        };

        if (selectedLead && !showAddModal) {
            // Edit mode
            await updateLead(selectedLead._id, dataToSave);
            setShowDetailModal(false);
        } else {
            // Add mode
            await createLead(dataToSave);
            setShowAddModal(false);
        }

        // Reset form
        setFormData({
            name: '',
            phone: '',
            course: coursesList[0],
            source: sourcesList[0],
            status: 'Yangi',
            notes: ''
        });
        setSelectedLead(null);
    };

    // Trigger details modal for edit
    const openDetailModal = (lead) => {
        setSelectedLead(lead);
        setFormData({
            name: lead.name,
            phone: lead.phone,
            course: lead.course,
            source: lead.source,
            status: mapStatusFromDB(lead.status),
            notes: lead.notes || ''
        });
        setShowDetailModal(true);
    };

    // Delete lead
    const handleDeleteClick = async (id) => {
        if (window.confirm('Haqiqatdan ham ushbu leadni o\'chirib tashlamoqchimisiz?')) {
            await deleteLead(id);
            setShowDetailModal(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar and Actions */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-3xl p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                    {/* Search */}
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Ism yoki telefon qidirish..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    {/* Source Filter */}
                    <div className="relative">
                        <select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Barcha manbalar</option>
                            {sourcesList.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <HiOutlineFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Course Filter */}
                    <div className="relative">
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Barcha kurslar</option>
                            {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <HiOutlineFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* View Switcher and Add Lead */}
                <div className="flex items-center justify-end gap-3">
                    <div className="flex bg-gray-50 dark:bg-dark-800 p-1 rounded-2xl">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-dark-700 text-primary-500 shadow-sm' : 'text-gray-400'}`}
                            title="Kanban ko'rinishi"
                        >
                            <HiOutlineViewGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-dark-700 text-primary-500 shadow-sm' : 'text-gray-400'}`}
                            title="Ro'yxat ko'rinishi"
                        >
                            <HiOutlineViewList className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setFormData({
                                name: '',
                                phone: '',
                                course: coursesList[0],
                                source: sourcesList[0],
                                status: 'Yangi',
                                notes: ''
                            });
                            setSelectedLead(null);
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        Yangi Lead
                    </button>
                </div>
            </div>

            {/* Kanban Board View */}
            {viewMode === 'kanban' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 overflow-x-auto pb-4 items-start select-none">
                    {columns.map((column) => {
                        const columnLeads = filteredLeads.filter(l => mapStatusFromDB(l.status) === column.key);
                        return (
                            <div
                                key={column.key}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, column.key)}
                                className="bg-gray-100/60 dark:bg-dark-900/60 border border-gray-200/50 dark:border-white/5 rounded-3xl p-4 min-h-[500px] flex flex-col flex-shrink-0 w-full xl:w-auto"
                            >
                                {/* Column Header */}
                                <div className={`flex items-center justify-between border-b pb-3 mb-4 ${column.color} rounded-2xl p-2`}>
                                    <h4 className="text-xs font-black uppercase tracking-wider truncate max-w-[80%]">{column.label}</h4>
                                    <span className="px-2 py-0.5 rounded-full bg-white dark:bg-dark-800 text-[10px] font-black shadow-sm">
                                        {columnLeads.length}
                                    </span>
                                </div>

                                {/* Column Content */}
                                <div className="space-y-3 flex-1 overflow-y-auto max-h-[550px] pr-1 custom-scrollbar">
                                    {columnLeads.length > 0 ? (
                                        columnLeads.map((lead) => (
                                            <div
                                                key={lead._id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, lead._id)}
                                                onClick={() => openDetailModal(lead)}
                                                className="bg-white dark:bg-dark-800 border border-gray-150 dark:border-white/5 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:border-primary-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                                            >
                                                <h5 className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">{lead.name}</h5>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase truncate">{lead.course}</p>
                                                
                                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                                                    <span className="px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-dark-750 text-[8px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                        {lead.source}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-gray-400">
                                                        {new Date(lead.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-gray-200 dark:border-white/5 rounded-2xl opacity-40">
                                            <span className="text-[10px] font-black uppercase text-gray-400">Bo'sh</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List/Table View */
                <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
                    <div className="overflow-x-auto">
                        {paginatedLeads.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-white/5">
                                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Ism-familiya</th>
                                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Telefon</th>
                                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Kurs</th>
                                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Manba</th>
                                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Sana</th>
                                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Holat</th>
                                        <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {paginatedLeads.map((lead) => {
                                        const mappedStatus = mapStatusFromDB(lead.status);
                                        const colData = columns.find(c => c.key === mappedStatus) || { color: 'bg-gray-100 text-gray-600' };
                                        return (
                                            <tr key={lead._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                                <td className="py-4 text-sm font-black text-gray-900 dark:text-white">{lead.name}</td>
                                                <td className="py-4 text-sm font-bold text-gray-500 dark:text-gray-400">{lead.phone}</td>
                                                <td className="py-4 text-sm font-bold text-gray-500 dark:text-gray-400">{lead.course}</td>
                                                <td className="py-4">
                                                    <span className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/5 text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">
                                                        {lead.source}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-xs font-bold text-gray-400">
                                                    {new Date(lead.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colData.color}`}>
                                                        {mappedStatus}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openDetailModal(lead)}
                                                            className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-800 text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                                                        >
                                                            <HiOutlinePencilAlt className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(lead._id)}
                                                            className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-800 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                        >
                                                            <HiOutlineTrash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-dark-850 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-3">
                                    <HiOutlineUserGroup className="w-8 h-8" />
                                </div>
                                <h4 className="text-sm font-black text-gray-700 dark:text-gray-300">Hech qanday lead topilmadi</h4>
                                <p className="text-xs text-gray-400 mt-1">Qidiruv kriteriyalarini o'zgartirib ko'ring.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                            <p className="text-xs font-bold text-gray-400 uppercase">
                                Jami {filteredLeads.length} tadan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredLeads.length)} ko'rsatilmoqda
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-gray-400 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
                                >
                                    <HiOutlineChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-xs font-black text-gray-700 dark:text-gray-300 px-3">{currentPage} / {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-gray-400 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
                                >
                                    <HiOutlineChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals & Forms */}
            <AnimatePresence>
                {/* 1. Add/Edit Lead Modal */}
                {(showAddModal || showDetailModal) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-dark-900 border border-gray-250 dark:border-white/5 rounded-[2.5rem] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-6 md:p-8 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {showAddModal ? 'Yangi Lead Qo\'shish' : 'Lead Ma\'lumotlari'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setShowDetailModal(false);
                                    }}
                                    className="p-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
                                >
                                    <HiOutlineX className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body / Form */}
                            <form onSubmit={handleSaveLead} className="p-6 md:p-8 space-y-4 overflow-y-auto flex-1">
                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Ism-familiya</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Mijoz ismi va familiyasi"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Telefon raqami</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="+998 90 123 45 67"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Course */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Kurs nomi</label>
                                        <select
                                            value={formData.course}
                                            onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Source */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reklama manbasi</label>
                                        <select
                                            value={formData.source}
                                            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            {sourcesList.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Statusi</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                                    >
                                        {columns.map(col => <option key={col.key} value={col.key}>{col.label}</option>)}
                                    </select>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Menejer izohi</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Mijoz bilan suhbat haqida izoh yozing..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                    />
                                </div>

                                {/* Actions Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                    {showDetailModal && selectedLead && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(selectedLead._id)}
                                            className="px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 font-extrabold text-[10px] uppercase tracking-wider transition-all"
                                        >
                                            Leadni O'chirish
                                        </button>
                                    )}
                                    <div className="flex items-center gap-3 ml-auto">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddModal(false);
                                                setShowDetailModal(false);
                                            }}
                                            className="px-5 py-2.5 rounded-2xl bg-gray-55 dark:bg-dark-800 text-gray-500 dark:text-gray-400 font-extrabold text-[10px] uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
                                        >
                                            Bekor Qilish
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 rounded-2xl bg-primary-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                                        >
                                            Saqlash
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeadManagement;
