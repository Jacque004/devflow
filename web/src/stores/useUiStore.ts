import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

type UiState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

function applyThemeToDocument(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        applyThemeToDocument(theme)
      },
    }),
    {
      name: 'devflow-ui',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyThemeToDocument(state.theme)
      },
    },
  ),
)
