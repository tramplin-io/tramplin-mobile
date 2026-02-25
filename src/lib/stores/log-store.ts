import { create } from 'zustand'

type LogEntry = {
  type: 'log' | 'warn' | 'error'
  message: string
  timestamp: string
}

type LogStore = {
  logs: LogEntry[]
  addLog: (entry: LogEntry) => void
  clearLogs: () => void
}

export const useLogStore = create<LogStore>()(set => ({
  logs: [],
  addLog: entry => set(state => ({ logs: [...state.logs, entry].slice(-100) })),
  clearLogs: () => set({ logs: [] }),
}))
