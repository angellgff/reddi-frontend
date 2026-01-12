import { create } from "zustand";

interface FloatingButtonState {
  isVisible: boolean;
  text: string;
  icon?: React.ReactNode;
  action?: () => void;
  showButton: (
    text: string,
    icon?: React.ReactNode,
    action?: () => void
  ) => void;
  hideButton: () => void;
}

export const useFloatingButtonStore = create<FloatingButtonState>((set) => ({
  isVisible: false,
  text: "",
  icon: undefined,
  action: undefined,
  showButton: (text, icon, action) =>
    set({ isVisible: true, text, icon, action }),
  hideButton: () =>
    set({ isVisible: false, text: "", icon: undefined, action: undefined }),
}));
