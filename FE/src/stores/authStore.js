// Persist ke sessionStorage — hilang saat tab ditutup (BRD decision)
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      clear: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'payme-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export default useAuthStore