import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeTab: 'dashboard',
    sidebarOpen: true,
    theme: 'light',
    notifications: [],
    modals: {
      createProposal: false,
      voteModal: false,
      transferTokens: false,
    },
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false
    },
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        ...action.payload,
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  setActiveTab,
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions

export default uiSlice.reducer