import { create } from "zustand";

interface UserActionState {
  data: { name: string; email: string };
  updateCurrentActor: (name: string, email: string) => void;
  getCurrentActor: () => { name: string; email: string };
}

export const useCurrentActor = create<UserActionState>((set, get) => ({
  data: { name: "", email: "" },

  updateCurrentActor: (name: string, email: string) =>
    set(() => {
      return {
        data: {
          name,
          email,
        },
      };
    }),

  getCurrentActor: () => {
    return get().data;
  },
}));
