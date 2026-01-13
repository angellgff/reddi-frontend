import { create } from "zustand";

interface StoreSearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useStoreSearchStore = create<StoreSearchState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
