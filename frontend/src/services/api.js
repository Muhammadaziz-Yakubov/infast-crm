import axios from 'axios';

// Vite environment variables to support cloud deployments (like Vercel to Render)
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - token qo'shish
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - 401 xatolik
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updatePassword: (data) => api.put('/auth/update-password', data),
};

// Kurslar
export const courseAPI = {
    getAll: () => api.get('/courses'),
    getOne: (id) => api.get(`/courses/${id}`),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
};

// Guruhlar
export const groupAPI = {
    getAll: () => api.get('/groups'),
    getOne: (id) => api.get(`/groups/${id}`),
    create: (data) => api.post('/groups', data),
    update: (id, data) => api.put(`/groups/${id}`, data),
    updateProgress: (id, data) => api.put(`/groups/${id}/progress`, data),
    delete: (id) => api.delete(`/groups/${id}`),
};

// O'quvchilar
export const studentAPI = {
    getAll: (params) => api.get('/students', { params }),
    getOne: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    bulkDelete: (ids) => api.post('/students/bulk-delete', { ids }),
    getDebtors: () => api.get('/students/debtors/list'),
    getMyDashboard: () => api.get('/students/me/dashboard'),
    updateMe: (data) => api.put('/students/me/update', data),
    updateProfileImage: (formData) => api.put('/students/me/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getClassmates: () => api.get('/students/classmates'),
    getPublicProfile: (id) => api.get(`/students/public-profile/${id}`),
    getLeaderboard: () => api.get('/students/leaderboard'),
    resetPaymentsStatus: () => api.put('/students/reset-payments-status'),
    sendDebtSMS: (id) => api.post(`/students/${id}/send-debt-sms`),
    toggleBlock: (id) => api.put(`/students/${id}/toggle-block`),
};

// To'lovlar
export const paymentAPI = {
    getAll: (params) => api.get('/payments', { params }),
    create: (data) => api.post('/payments', data),
    bulkCreate: (data) => api.post('/payments/bulk', data),
    delete: (id) => api.delete(`/payments/${id}`),
    deleteAll: (params) => api.delete('/payments/all', { params }),
    getDashboard: () => api.get('/payments/dashboard'),
    exportDebtors: () => api.get('/payments/export/debtors', { responseType: 'blob' }),
};

// Davomat
export const attendanceAPI = {
    get: (groupId, date) => api.get(`/attendance/${groupId}/${date}`),
    save: (data) => api.post('/attendance', data),
    scan: () => api.post('/attendance/scan'),
    sendReport: (groupId, date) => api.post(`/attendance/report/${groupId}/${date}`),
};

// Vazifalar
export const taskAPI = {
    // Admin
    create: (formData) => api.post('/tasks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getSubmissions: (taskId) => api.get(`/tasks/${taskId}/submissions`),
    gradeSubmission: (id, score) => api.patch(`/tasks/submissions/${id}/grade`, { score }),
    complete: (id) => api.patch(`/tasks/${id}/complete`),
    reopen: (id) => api.patch(`/tasks/${id}/reopen`),
    delete: (id) => api.delete(`/tasks/${id}`),

    // Student
    getMyTasks: () => api.get('/tasks/my'),
    submit: (formData) => api.post('/tasks/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Market
export const marketAPI = {
    getProducts: () => api.get('/market/products'),
    createProduct: (data) => api.post('/market/products', data),
    updateProduct: (id, data) => api.put(`/market/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/market/products/${id}`),
    buyProduct: (productId) => api.post('/market/buy', { productId }),
    getCoinLogs: () => api.get('/market/logs'),
    getOrders: () => api.get('/market/orders'),
};

export const coinAPI = {
    manualUpdate: (data) => api.post('/coins/update', data),
    getGlobalLogs: () => api.get('/coins/logs'),
};

export const wheelAPI = {
    spin: () => api.post('/wheels/spin'),
    getLogs: () => api.get('/wheels/logs'),
};

export const leadAPI = {
    getAll: (params) => api.get('/leads', { params }),
    getStats: () => api.get('/leads/stats'),
    create: (data) => api.post('/leads', data),
    update: (id, data) => api.put(`/leads/${id}`, data),
    delete: (id) => api.delete(`/leads/${id}`),
    publicCreate: (data) => api.post('/leads/public', data),
};

export const noteAPI = {
    getAll: () => api.get('/notes'),
    getOne: (id) => api.get(`/notes/${id}`),
    create: (data) => api.post('/notes', data),
    toggleLike: (id) => api.post(`/notes/${id}/like`),
    togglePin: (id) => api.patch(`/notes/${id}/pin`),
    delete: (id) => api.delete(`/notes/${id}`),
};

// Curriculum
export const curriculumAPI = {
    getCourses: () => api.get('/curriculum/courses'),
    getGroupCurriculum: (groupId) => api.get(`/curriculum/group/${groupId}`),
    getGroupAllLessons: (groupId) => api.get(`/curriculum/group/${groupId}/all`),
    markCompleted: (groupId) => api.post(`/curriculum/group/${groupId}/complete`),
    undoCompleted: (groupId) => api.post(`/curriculum/group/${groupId}/undo`),
    setProgress: (groupId, darsProgress) => api.put(`/curriculum/group/${groupId}/set-progress`, { darsProgress }),
};

// Events
export const eventAPI = {
    getAll: (params) => api.get('/events', { params }),
    getOne: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
    register: (id) => api.post(`/events/${id}/register`),
    getUpcoming: () => api.get('/events/upcoming'),
    saveAttendance: (id, attendanceData) => api.post(`/events/${id}/attendance/save`, { attendanceData }),
    getAnalytics: (id) => api.get(`/events/${id}/analytics`),
};

export const battleAPI = {
    create: (data) => api.post('/battles/create', data),
    join: (data) => api.post('/battles/join', data),
    getRandom: (betAmount) => api.get('/battles/random', { params: { betAmount } }),
    submitScore: (data) => api.post('/battles/submit', data),
    getMyBattles: () => api.get('/battles/my'),
    getOne: (id) => api.get(`/battles/${id}`),
};

export const challengeAPI = {
    getAll: () => api.get('/challenges'),
    getOne: (id) => api.get(`/challenges/${id}`),
    create: (data) => api.post('/challenges', data),
    join: (id) => api.post(`/challenges/${id}/join`),
    submit: (id, formData) => api.post(`/challenges/${id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getSubmissions: (id, dayNumber) => api.get(`/challenges/${id}/submissions`, { params: { dayNumber } }),
    delete: (id) => api.delete(`/challenges/${id}`),
};


export default api;
