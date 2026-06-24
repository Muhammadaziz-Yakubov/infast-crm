import React from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';

const BranchSelector = () => {
    const { user, branches, selectedBranchId, changeBranch } = useAuth();

    if (!user) return null;

    // Superadmin has a dropdown selector
    if (user.role === 'superadmin') {
        return (
            <div className="px-3 py-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-1">
                    Filial
                </label>
                <div className="relative flex items-center">
                    <HiOutlineOfficeBuilding className="absolute left-3 w-4 h-4 text-[#0066FF] pointer-events-none" />
                    <select
                        value={selectedBranchId}
                        onChange={(e) => changeBranch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-xs font-semibold text-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0066FF] transition-all cursor-pointer appearance-none"
                    >
                        <option value="">Barcha filiallar</option>
                        {branches.map((b) => (
                            <option key={b._id} value={b._id} disabled={!b.isActive}>
                                {b.name} {!b.isActive && "(Faol emas)"}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 pointer-events-none text-gray-400 dark:text-zinc-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    // Branch Admin has a static badge/indicator showing their branch
    if (user.role === 'admin') {
        const branchName = user.branchId && typeof user.branchId === 'object' ? user.branchId.name : 'Asosiy filial';
        return (
            <div className="px-3 py-1">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400">
                    <HiOutlineOfficeBuilding className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-semibold truncate">{branchName}</span>
                </div>
            </div>
        );
    }

    return null;
};

export default BranchSelector;
