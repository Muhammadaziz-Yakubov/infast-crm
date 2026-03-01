import { useState, useEffect, useCallback } from 'react';

export const useFetch = (apiFunc, params = null, immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = useCallback(async (overrideParams) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFunc(overrideParams || params);
            setData(res.data);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Xatolik yuz berdi';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunc, params]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, []);

    return { data, loading, error, execute, setData };
};

export default useFetch;
