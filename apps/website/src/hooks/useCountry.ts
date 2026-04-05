"use client";

import { useState, useEffect } from 'react';

export function useCountry() {
    const [country, setCountry] = useState<string>('US');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCountry = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                if (!response.ok) {
                    throw new Error('Failed to fetch country');
                }
                const data = await response.json();
                if (data.country_code) {
                    setCountry(data.country_code);
                }
            } catch (error) {
                console.error('Error fetching country:', error);
                // Fallback to US is already set in initial state
            } finally {
                setLoading(false);
            }
        };

        fetchCountry();
    }, []);

    return { country, loading };
}
