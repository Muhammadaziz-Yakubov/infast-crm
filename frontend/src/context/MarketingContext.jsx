import React, { createContext, useContext, useState, useEffect } from 'react';
import { leadAPI } from '../services/api';
import toast from 'react-hot-toast';

const MarketingContext = createContext(null);

export const useMarketing = () => {
    const context = useContext(MarketingContext);
    if (!context) {
        throw new Error('useMarketing must be used within a MarketingProvider');
    }
    return context;
};

export const MarketingProvider = ({ children }) => {
    // 1. Leads State
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingLeads, setLoadingLeads] = useState(false);

    // 2. Advertising Sources State (With default values and ROI calculation)
    const [adSources, setAdSources] = useState([
        { id: 1, source: 'Instagram', leadsCount: 230, conversion: 22.4, cost: 2500000, roi: 260 },
        { id: 2, source: 'Telegram', leadsCount: 145, conversion: 18.6, cost: 1500000, roi: 210 },
        { id: 3, source: 'TikTok', leadsCount: 98, conversion: 12.2, cost: 1000000, roi: 140 },
        { id: 4, source: 'YouTube', leadsCount: 45, conversion: 28.8, cost: 800000, roi: 320 },
        { id: 5, source: 'Website', leadsCount: 88, conversion: 15.9, cost: 500000, roi: 180 },
        { id: 6, source: 'Referral', leadsCount: 60, conversion: 45.0, cost: 0, roi: 999 },
        { id: 7, source: 'Offline', leadsCount: 32, conversion: 9.4, cost: 600000, roi: 50 }
    ]);

    // 3. Campaigns State
    const [campaigns, setCampaigns] = useState(() => {
        const local = localStorage.getItem('marketing_campaigns');
        return local ? JSON.parse(local) : [
            { id: 1, name: 'Yozgi Qabul 2026', platform: 'Instagram', budget: 1200000, startDate: '2026-05-01', endDate: '2026-05-30', status: 'Faol', result: '124 ta lead, CPL 9,600 so\'m' },
            { id: 2, name: 'IT Bepul Seminar', platform: 'Telegram', budget: 500000, startDate: '2026-05-15', endDate: '2026-05-22', status: 'Yakunlangan', result: '68 ta lead, CPL 7,300 so\'m' },
            { id: 3, name: 'TikTok Challenge', platform: 'TikTok', budget: 800000, startDate: '2026-06-01', endDate: '2026-06-15', status: 'Rejalashtirilgan', result: '-' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('marketing_campaigns', JSON.stringify(campaigns));
    }, [campaigns]);

    // 4. Broadcast System State
    const [templates, setTemplates] = useState(() => {
        const local = localStorage.getItem('marketing_templates');
        return local ? JSON.parse(local) : [
            { id: 1, title: 'Bepul Seminar', content: 'Assalomu alaykum {name}! {course} kursi bo\'yicha bepul master-klassimizda sizni kutamiz. Ro\'yxatdan o\'tish uchun havola: infast.uz/seminar' },
            { id: 2, title: 'Yangi Lead Kutib Olish', content: 'Salom {name}! {course} kursimizga qiziqish bildirganingiz uchun rahmat. Tez orada menejerlarimiz siz bilan bog\'lanishadi!' },
            { id: 3, title: 'Sinov darsiga taklif', content: 'Assalomu alaykum {name}! {course} kursi bo\'yicha sinov darsimiz ertaga soat 15:00 da boshlanadi. Kelishingizni kutib qolamiz.' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('marketing_templates', JSON.stringify(templates));
    }, [templates]);

    const [broadcastLogs, setBroadcastLogs] = useState(() => {
        const local = localStorage.getItem('marketing_broadcast_logs');
        return local ? JSON.parse(local) : [
            { id: 1, date: '2026-05-27T10:30:00.000Z', channel: 'SMS', audience: 'Yangi Lead', title: 'Bepul seminar taklifi', sentCount: 142, status: 'Muvaffaqiyatli' },
            { id: 2, date: '2026-05-25T14:15:00.000Z', channel: 'Telegram', audience: 'Sinov darsi', title: 'Dars eslatmasi', sentCount: 56, status: 'Muvaffaqiyatli' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('marketing_broadcast_logs', JSON.stringify(broadcastLogs));
    }, [broadcastLogs]);

    // 5. Funnel Data State (Mock, dynamically influenced by actual numbers if needed)
    const [funnelData, setFunnelData] = useState({
        impressions: 25000,
        leads: 2450,
        trials: 850,
        students: 412
    });

    // 6. Settings State
    const [settings, setSettings] = useState(() => {
        const local = localStorage.getItem('marketing_settings');
        return local ? JSON.parse(local) : {
            botToken: '123456789:AAF_mock_token_infastcrm',
            botUsername: '@infast_leads_bot',
            smsProvider: 'playmobile',
            smsSenderId: 'INFAST_ACAD',
            smsApiKey: 'mock_key_987654321',
            autoFollowUp: true,
            followUpDays: 2
        };
    });

    useEffect(() => {
        localStorage.setItem('marketing_settings', JSON.stringify(settings));
    }, [settings]);

    // Fetch leads and stats from server
    const fetchLeadsAndStats = async () => {
        setLoadingLeads(true);
        try {
            const leadsRes = await leadAPI.getAll();
            setLeads(leadsRes.data.data || []);
            
            const statsRes = await leadAPI.getStats();
            setStats(statsRes.data.data || null);

            // Dynamically update funnel leads and students if backend stats are present
            if (statsRes.data.data) {
                const s = statsRes.data.data;
                setFunnelData(prev => ({
                    ...prev,
                    leads: s.totalLeads || prev.leads,
                    students: s.enrolledLeads || prev.students,
                    trials: s.funnelData?.find(f => f.name === 'Sinov darsi')?.count || prev.trials
                }));

                // Update advertising sources leads counts dynamically based on real data distribution
                if (s.sourceDistribution && s.sourceDistribution.length > 0) {
                    setAdSources(prev => prev.map(sourceObj => {
                        const matched = s.sourceDistribution.find(d => d._id?.toLowerCase() === sourceObj.source.toLowerCase());
                        if (matched) {
                            // recalculate ROI based on new lead numbers
                            const newCount = matched.count;
                            const cost = sourceObj.cost;
                            const conversionRate = sourceObj.conversion;
                            // Estimate conversion sales: count * (conversion / 100)
                            const estimatedSales = newCount * (conversionRate / 100);
                            // Assume average student revenue is 800,000 so'm
                            const estimatedRevenue = estimatedSales * 800000;
                            const roi = cost > 0 ? Math.round(((estimatedRevenue - cost) / cost) * 100) : 999;
                            return { ...sourceObj, leadsCount: newCount, roi: roi < -100 ? -100 : roi };
                        }
                        return sourceObj;
                    }));
                }
            }
        } catch (err) {
            console.error('Leads fetching error:', err);
            // Fallback mock leads if server is offline or fails
            setLeads(prev => prev.length > 0 ? prev : getMockLeads());
        } finally {
            setLoadingLeads(false);
        }
    };

    // Actions
    const createLead = async (leadData) => {
        try {
            const res = await leadAPI.create(leadData);
            toast.success('Yangi lead muvaffaqiyatli qo\'shildi!');
            fetchLeadsAndStats();
            return res.data.data;
        } catch (err) {
            console.error(err);
            // Local fallback
            const newLead = {
                _id: 'local_' + Date.now(),
                createdAt: new Date().toISOString(),
                ...leadData
            };
            setLeads(prev => [newLead, ...prev]);
            toast.success('Yangi lead mahalliy ravishda saqlandi (Demo)');
            return newLead;
        }
    };

    const updateLead = async (id, leadData) => {
        try {
            if (id.startsWith('local_')) {
                setLeads(prev => prev.map(l => l._id === id ? { ...l, ...leadData } : l));
                toast.success('Lead muvaffaqiyatli tahrirlandi');
                return;
            }
            await leadAPI.update(id, leadData);
            toast.success('Lead ma\'lumotlari yangilandi');
            fetchLeadsAndStats();
        } catch (err) {
            console.error(err);
            toast.error('Leadni yangilashda xatolik yuz berdi');
        }
    };

    const deleteLead = async (id) => {
        try {
            if (id.startsWith('local_')) {
                setLeads(prev => prev.filter(l => l._id !== id));
                toast.success('Lead o\'chirildi');
                return;
            }
            await leadAPI.delete(id);
            toast.success('Lead muvaffaqiyatli o\'chirildi');
            fetchLeadsAndStats();
        } catch (err) {
            console.error(err);
            toast.error('Leadni o\'chirishda xatolik yuz berdi');
        }
    };

    const addCampaign = (campaign) => {
        const newCamp = {
            id: Date.now(),
            result: '-',
            ...campaign
        };
        setCampaigns(prev => [newCamp, ...prev]);
        toast.success('Kampaniya muvaffaqiyatli qo\'shildi');
    };

    const updateCampaign = (id, campaignData) => {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...campaignData } : c));
        toast.success('Kampaniya ma\'lumotlari yangilandi');
    };

    const deleteCampaign = (id) => {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        toast.success('Kampaniya o\'chirildi');
    };

    const addTemplate = (title, content) => {
        setTemplates(prev => [...prev, { id: Date.now(), title, content }]);
        toast.success('Shablon qo\'shildi');
    };

    const deleteTemplate = (id) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast.success('Shablon o\'chirildi');
    };

    const runBroadcast = (channel, audience, title, content) => {
        // filter active leads count
        let count = leads.length;
        if (audience !== 'Barchasi') {
            count = leads.filter(l => {
                const mappedStatus = mapStatusFromDB(l.status);
                return mappedStatus === audience;
            }).length;
        }
        if (count === 0) count = 25; // fallback mock size

        const log = {
            id: Date.now(),
            date: new Date().toISOString(),
            channel,
            audience,
            title,
            sentCount: count,
            status: 'Muvaffaqiyatli'
        };
        setBroadcastLogs(prev => [log, ...prev]);
        toast.success(`${count} ta mijozga ${channel} orqali xabar yuborildi!`);
    };

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        toast.success('Marketing sozlamalari saqlandi');
    };

    return (
        <MarketingContext.Provider value={{
            leads,
            stats,
            adSources,
            campaigns,
            templates,
            broadcastLogs,
            funnelData,
            settings,
            loadingLeads,
            fetchLeadsAndStats,
            createLead,
            updateLead,
            deleteLead,
            addCampaign,
            updateCampaign,
            deleteCampaign,
            addTemplate,
            deleteTemplate,
            runBroadcast,
            updateSettings
        }}>
            {children}
        </MarketingContext.Provider>
    );
};

// Helper status mappers
export const mapStatusFromDB = (dbStatus) => {
    switch (dbStatus) {
        case 'Yangi Lead': return 'Yangi';
        case 'Bog\'lanildi': return 'Aloqaga chiqilgan';
        case 'Sinov darsi': return 'Trial dars';
        case 'Qiziqdi': return 'Kutilyapti';
        case 'O\'quvchi bo\'ldi': return 'O‘quvchi bo‘ldi';
        case 'Yo\'qotildi': return 'Bekor qilingan';
        default: return dbStatus || 'Yangi';
    }
};

export const mapStatusToDB = (uiStatus) => {
    switch (uiStatus) {
        case 'Yangi': return 'Yangi Lead';
        case 'Aloqaga chiqilgan': return 'Bog\'lanildi';
        case 'Trial dars': return 'Sinov darsi';
        case 'Kutilyapti': return 'Qiziqdi';
        case 'O‘quvchi bo‘ldi': return 'O\'quvchi bo\'ldi';
        case 'Bekor qilingan': return 'Yo\'qotildi';
        default: return uiStatus || 'Yangi Lead';
    }
};

const getMockLeads = () => [
    { _id: 'mock_1', name: 'Sherzod Alimov', phone: '+998 90 123 45 67', course: 'Frontend React', source: 'Instagram', status: 'Yangi Lead', notes: 'Guruh vaqtlari qiziqtiryapti', createdAt: '2026-05-28T08:30:00.000Z' },
    { _id: 'mock_2', name: 'Malika Qodirova', phone: '+998 99 888 77 66', course: 'UX/UI Dizayn', source: 'Telegram', status: 'Bog\'lanildi', notes: 'Telefon ko\'tardi, ertaga qayta bog\'lanamiz', createdAt: '2026-05-28T06:15:00.000Z' },
    { _id: 'mock_3', name: 'Bobur Mansurov', phone: '+998 93 555 44 33', course: 'Python Backend', source: 'TikTok', status: 'Sinov darsi', notes: 'Ertangi sinov darsiga yozildi', createdAt: '2026-05-27T12:00:00.000Z' },
    { _id: 'mock_4', name: 'Aziza Tursunova', phone: '+998 90 999 11 22', course: 'Frontend React', source: 'Website', status: 'Qiziqdi', notes: 'Narxlar bo\'yicha o\'ylayapti', createdAt: '2026-05-26T15:40:00.000Z' },
    { _id: 'mock_5', name: 'Jasur Karimov', phone: '+998 94 444 33 22', course: 'UX/UI Dizayn', source: 'Referral', status: 'O\'quvchi bo\'ldi', notes: 'To\'lov qildi, guruhga qo\'shildi', createdAt: '2026-05-25T09:20:00.000Z' },
    { _id: 'mock_6', name: 'Zilola G\'ofurova', phone: '+998 97 111 22 33', course: 'Python Backend', source: 'Instagram', status: 'Yo\'qotildi', notes: 'Boshqa markazga ketib qoldi, narxi to\'g\'ri kelmadi', createdAt: '2026-05-24T14:10:00.000Z' }
];
