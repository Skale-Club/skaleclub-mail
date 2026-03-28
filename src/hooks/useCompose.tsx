import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ComposeOptions {
    replyToId?: string;
    forwardId?: string;
    draftId?: string;
    replyAll?: boolean;
}

interface ComposeContextType {
    isOpen: boolean;
    options: ComposeOptions;
    openCompose: (opts?: ComposeOptions) => void;
    closeCompose: () => void;
}

const ComposeContext = createContext<ComposeContextType | undefined>(undefined);

export function ComposeProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ComposeOptions>({});

    const openCompose = (opts: ComposeOptions = {}) => {
        setOptions(opts);
        setIsOpen(true);
    };

    const closeCompose = () => {
        setIsOpen(false);
        setOptions({});
    };

    return (
        <ComposeContext.Provider value={{ isOpen, options, openCompose, closeCompose }}>
            {children}
        </ComposeContext.Provider>
    );
}

export function useCompose() {
    const context = useContext(ComposeContext);
    if (context === undefined) {
        throw new Error('useCompose must be used within a ComposeProvider');
    }
    return context;
}
