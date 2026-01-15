import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { PlanPagos } from "../interfaces/PlanPagos";


interface AuthPaysState {
    pays: PlanPagos[];
    lastSync: number | null;

    setPays: (pays: PlanPagos[]) => void;
    updatePays: (updated: PlanPagos[]) => void;
    clearPays: () => void;
}

export const useAuthPaysStore = create<AuthPaysState>()(
    persist(
        (set, get) => ({
            pays: [],
            lastSync: null,

            setPays: (pays) =>
                set({
                    pays,
                    lastSync: Date.now(),
                }),

            updatePays: (updatedDocuments) => {
                const updatedMap = new Map(
                    updatedDocuments.map((d) => [d.numerodocumento, d])
                );

                const newPays = get().pays.map((item) => {
                    const updated = updatedMap.get(item.numerodocumento);
                    return updated ? { ...item, ...updated } : item;
                });

                set({ pays: newPays });
            },

            clearPays: () => set({ pays: [], lastSync: null }),
        }),
        {
            name: "auth-pays-storage",
            storage: createJSONStorage(() => AsyncStorage),
            version: 1,
        }
    )
);
