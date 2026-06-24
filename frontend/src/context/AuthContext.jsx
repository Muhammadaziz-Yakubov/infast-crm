import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, branchAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(localStorage.getItem('selectedBranchId') || '');

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user && user.role === 'superadmin') {
            fetchBranches();
        }
    }, [user]);

    const fetchBranches = async () => {
        try {
            const res = await branchAPI.getAll();
            setBranches(res.data.data || []);
        } catch (err) {
            console.error('Error fetching branches:', err);
        }
    };

    const changeBranch = (branchId) => {
        if (!branchId) {
            localStorage.removeItem('selectedBranchId');
            setSelectedBranchId('');
        } else {
            localStorage.setItem('selectedBranchId', branchId);
            setSelectedBranchId(branchId);
        }
        window.location.reload();
    };

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await authAPI.getMe();
                setUser(res.data.data);
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('selectedBranchId');
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        const res = await authAPI.login({ username, password });
        const { token, user: userData } = res.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        if (userData.branchId) {
            localStorage.setItem('selectedBranchId', typeof userData.branchId === 'object' ? userData.branchId._id : userData.branchId);
        }
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedBranchId');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, branches, selectedBranchId, changeBranch }}>
            {children}
        </AuthContext.Provider>
    );
};
