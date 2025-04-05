import { create } from "zustand";

interface UserActionState {
  data: Record<string, string[]>;
  updateUserActionState: (email: string, message: string) => void;
  getUserActionState: (email: string) => string[] | undefined;
}

export const useUserActionState = create<UserActionState>((set, get) => ({
  data: {},

  updateUserActionState: (email: string, message: string) =>
    set((state) => {
      return {
        data: {
          ...state.data,
          [email]: [...(state.data[email] || []), message],
        },
      };
    }),

  getUserActionState: (email: string) => {
    return get().data[email] || undefined;
  },
}));
