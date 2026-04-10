import { createContext, useContext } from 'react'
import { useDataStore } from '../hooks/useDataStore.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const store = useDataStore()
  return <DataContext.Provider value={store}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
