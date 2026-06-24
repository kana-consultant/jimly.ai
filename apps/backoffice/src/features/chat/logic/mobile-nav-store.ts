import { create } from 'zustand';

interface MobileNavState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

export const useMobileNavStore = create<MobileNavState>((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
  close: () => set({ open: false }),
}));
