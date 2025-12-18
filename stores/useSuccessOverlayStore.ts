import { create } from 'zustand';

interface SuccessOverlayState {
    visible: boolean;
    title?: string;
    subtitle?: string;
    show: (data?: { title?: string; subtitle?: string }) => void;
    hide: () => void;
}

export const useSuccessOverlayStore = create<SuccessOverlayState>((set) => ({
    visible: false,
    title: 'Operación exitosa',
    subtitle: undefined,

    show: (data) =>
        set({
            visible: true,
            title: data?.title ?? 'Operación exitosa',
            subtitle: data?.subtitle,
        }),

    hide: () => set({ visible: false }),
}));
