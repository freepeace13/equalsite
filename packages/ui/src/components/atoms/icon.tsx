import type { LucideIcon } from 'lucide-react';

export interface IconWrapperProps {
    iconNode?: LucideIcon | null;
    className?: string;
}

export function Icon({ iconNode: IconComponent, className }: IconWrapperProps) {
    if (!IconComponent) {
        return null;
    }

    return <IconComponent className={className} />;
}
