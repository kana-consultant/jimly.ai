import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';

interface MobileNavState {
  open: boolean;
}

const store = new Store<MobileNavState>({ open: false });

const actions = {
  toggle: () => store.setState((state) => ({ open: !state.open })),
  close: () => store.setState((state) => ({ ...state, open: false })),
};

export function useMobileNavStore<T>(selector: (state: MobileNavState & typeof actions) => T): T {
  return useStore(store, (state) => selector({ ...state, ...actions }));
}
