import { Toaster as ToasterAtom } from '@equalsite/ui';
import { useAppearance } from '@/hooks/use-appearance';
import { useFlashToast } from '@/hooks/use-flash-toast';

export function Toaster() {
    const { appearance } = useAppearance();

    useFlashToast();

    return <ToasterAtom theme={appearance} />;
}
