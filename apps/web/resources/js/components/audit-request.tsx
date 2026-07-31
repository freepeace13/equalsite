import { createContext, ReactNode, useContext, useState } from "react";
import { AuditRequestModal } from "./audit-request-modal";

type AuditRequestContextValue = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

const AuditRequestContext = createContext<AuditRequestContextValue | undefined>(undefined);

export interface Props {
    children: ReactNode;
}

export function AuditRequestProvider({ children }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return (
        <AuditRequestContext.Provider value={{
            isOpen,
            open,
            close
        }}>
            {children}
            <AuditRequestModal
                open={isOpen}
                onOpenChange={setIsOpen}
            />
        </AuditRequestContext.Provider>
    );
}

export function useAuditRequestForm() {
    const context = useContext(AuditRequestContext);
    if (!context) {
        throw new Error('Make sure you wrapped your componnt with AuditRequestProvider.');
    }
    return context;
}
