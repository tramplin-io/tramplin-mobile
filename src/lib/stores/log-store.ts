import { create } from 'zustand'

export type LogEntry = {
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
  addLog: entry =>
    set(state => {
      const last = state.logs[state.logs.length - 1]
      if (last && last.type === entry.type && last.message === entry.message) return state
      return { logs: [...state.logs, entry].slice(-100) }
    }),
  clearLogs: () => set({ logs: [] }),
}))
