import { configureStore } from '@reduxjs/toolkit'
import daoReducer from './slices/daoSlice'
import tokenReducer from './slices/tokenSlice'
import exchangeReducer from './slices/exchangeSlice'
import membersReducer from './slices/membersSlice'
import treasuryReducer from './slices/treasurySlice'
import analyticsReducer from './slices/analyticsSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    dao: daoReducer,
    token: tokenReducer,
    exchange: exchangeReducer,
    members: membersReducer,
    treasury: treasuryReducer,
    analytics: analyticsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['dao/setProvider', 'dao/setContract', 'token/setContract'],
        ignoredPaths: ['dao.provider', 'dao.contract', 'token.contract'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch