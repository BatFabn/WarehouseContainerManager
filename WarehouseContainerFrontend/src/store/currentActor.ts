import { create } from "zustand";

interface UserActionState {
  data: string;
  updateCurrentActor: (actor: string) => void;
  getCurrentActor: () => string;
}

export const useCurrentActor = create<UserActionState>((set, get) => ({
  data: "",

  updateCurrentActor: (actor: string) =>
    set(() => {
      return {
        data: actor,
      };
    }),

  getCurrentActor: () => {
    return get().data;
  },
}));
