import axios from 'axios';

const API_URL = '/api';

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
    delete: (id) => api.delete(`/groups/${id}`),
    telegramReport: (id) => api.post(`/groups/${id}/telegram-report`),
};

// O'quvchilar
export const studentAPI = {
    getAll: (params) => api.get('/students', { params }),
    getOne: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    getDebtors: () => api.get('/students/debtors/list'),
    getMyDashboard: () => api.get('/students/me/dashboard'),
    updateMe: (data) => api.put('/students/me/update', data),
};

// To'lovlar
export const paymentAPI = {
    getAll: (params) => api.get('/payments', { params }),
    create: (data) => api.post('/payments', data),
    getDashboard: () => api.get('/payments/dashboard'),
    exportDebtors: () => api.get('/payments/export/debtors', { responseType: 'blob' }),
};

// Davomat
export const attendanceAPI = {
    get: (groupId, date) => api.get(`/attendance/${groupId}/${date}`),
    save: (data) => api.post('/attendance', data),
};

// Vazifalar
export const taskAPI = {
    // Admin
    create: (formData) => api.post('/tasks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getSubmissions: (taskId) => api.get(`/tasks/${taskId}/submissions`),
    gradeSubmission: (id, score) => api.patch(`/tasks/submissions/${id}/grade`, { score }),

    // Student
    getMyTasks: () => api.get('/tasks/my'),
    submit: (formData) => api.post('/tasks/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;
