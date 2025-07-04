import { configureStore } from '@reduxjs/toolkit'
import daoReducer from './slices/daoSlice'
import tokenReducer from './slices/tokenSlice'
import exchangeReducer from './slices/exchangeSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    dao: daoReducer,
    token: tokenReducer,
    exchange: exchangeReducer,
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