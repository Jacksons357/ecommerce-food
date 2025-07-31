import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

// Hook simplificado sem dark mode - mantém compatibilidade
export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
    }, []);

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        updateAppearance(savedAppearance || 'light');
    }, [updateAppearance]);

    return { appearance, updateAppearance } as const;
}

// Função de inicialização simplificada
export function initializeTheme() {
    // Sempre aplica o tema claro
    document.documentElement.classList.remove('dark');
}
