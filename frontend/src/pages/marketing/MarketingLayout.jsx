import React, { useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { MarketingProvider, useMarketing } from '../../context/MarketingContext';
import {
    HiOutlineChartBar,
    HiOutlineUserGroup,
    HiOutlineShare,
    HiOutlineSpeakerphone,
    HiOutlineFilter,
    HiOutlineChatAlt2,
    HiOutlineCog
} from 'react-icons/hi';

import MarketingDashboard from './MarketingDashboard';
import LeadManagement from './LeadManagement';
import ReklamaManbalari from './ReklamaManbalari';
import MarketingKampaniyalari from './MarketingKampaniyalari';
import FunnelAnalytics from './FunnelAnalytics';
import BroadcastSystem from './BroadcastSystem';

const tabs = [
    { path: '', label: 'Dashboard', icon: HiOutlineChartBar },
    { path: 'leads', label: 'Leadlar', icon: HiOutlineUserGroup },
    { path: 'sources', label: 'Manbalar', icon: HiOutlineShare },
    { path: 'campaigns', label: 'Kampaniyalar', icon: HiOutlineSpeakerphone },
    { path: 'funnel', label: 'Voronka', icon: HiOutlineFilter },
    { path: 'broadcast', label: 'Broadcast', icon: HiOutlineChatAlt2 }
];

const MarketingLayoutContent = () => {
    const location = useLocation();
    const { fetchLeadsAndStats } = useMarketing();

    // Fetch initial marketing data
    useEffect(() => {
        fetchLeadsAndStats();
    }, []);

    // Get current tab based on path to show in mobile header
    const currentTabLabel = tabs.find(tab => {
        const fullTabPath = tab.path === '' ? '/marketing' : `/marketing/${tab.path}`;
        return location.pathname === fullTabPath || (tab.path !== '' && location.pathname.startsWith(fullTabPath));
    })?.label || 'Dashboard';

    return (
        <div className="space-y-6 md:space-y-8 pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-black text-primary-500 uppercase tracking-widest">
                        <span>O'quv Markazi</span>
                        <span>•</span>
                        <span>Marketing Moduli</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
                        Marketing <span className="text-primary-500">Tahlili</span>
                    </h1>
                </div>
                
                {/* Mobile Sub-Header Badge */}
                <div className="md:hidden self-start px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-extrabold uppercase tracking-wider">
                    {currentTabLabel}
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-3xl p-1.5 shadow-sm overflow-x-auto scrollbar-none">
                <nav className="flex space-x-1 min-w-max">
                    {tabs.map((tab) => {
                        const isMain = tab.path === '';
                        return (
                            <NavLink
                                key={tab.path}
                                to={tab.path === '' ? '/marketing' : `/marketing/${tab.path}`}
                                end={isMain}
                                className={({ isActive }) => `
                                    flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm transition-all duration-300
                                    ${isActive
                                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-800'
                                    }
                                `}
                            >
                                <tab.icon className="w-4 h-4 flex-shrink-0" />
                                <span>{tab.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Active page views */}
            <div className="min-h-[500px]">
                <Routes>
                    <Route index element={<MarketingDashboard />} />
                    <Route path="leads" element={<LeadManagement />} />
                    <Route path="sources" element={<ReklamaManbalari />} />
                    <Route path="campaigns" element={<MarketingKampaniyalari />} />
                    <Route path="funnel" element={<FunnelAnalytics />} />
                    <Route path="broadcast" element={<BroadcastSystem />} />
                    <Route path="*" element={<Navigate to="" replace />} />
                </Routes>
            </div>
        </div>
    );
};

const MarketingLayout = () => {
    return (
        <MarketingProvider>
            <MarketingLayoutContent />
        </MarketingProvider>
    );
};

export default MarketingLayout;
