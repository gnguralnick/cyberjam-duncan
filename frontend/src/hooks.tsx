import { useState, useCallback } from 'react';

export function useBackendFetch<T>(path: string, options: RequestInit = {}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<T | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + path, options);
            const json = await response.json() as T;
            setData(json);
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    }, [path, options]);

    return { loading, error, data, fetchData };
}