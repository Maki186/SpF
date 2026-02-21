import { storeToRefs } from 'pinia'
import { useFinanceStore } from '@/stores/finance'

export function useFinance() {
  const store = useFinanceStore()
  const { transactions, categories, accounts, loading } = storeToRefs(store)
  return {
    transactions,
    categories,
    accounts,
    loading,
    fetchTransactions: store.fetchTransactions,
    fetchCategories: store.fetchCategories,
    fetchAccounts: store.fetchAccounts,
    addTransaction: store.addTransaction,
    addCategory: store.addCategory,
  }
}

export function usePeriodDates(period: 'day' | 'week' | 'month' | 'year', baseDate: Date) {
  let from: Date
  let to: Date

  const d = new Date(baseDate)
  d.setHours(0, 0, 0, 0)

  switch (period) {
    case 'day':
      from = new Date(d)
      to = new Date(d)
      to.setHours(23, 59, 59, 999)
      break
    case 'week':
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      from = new Date(d.setDate(diff))
      from.setHours(0, 0, 0, 0)
      to = new Date(from)
      to.setDate(to.getDate() + 6)
      to.setHours(23, 59, 59, 999)
      break
    case 'month':
      from = new Date(d.getFullYear(), d.getMonth(), 1)
      to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
      break
    case 'year':
      from = new Date(d.getFullYear(), 0, 1)
      to = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999)
      break
    default:
      from = new Date(d)
      to = new Date(d)
  }

  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  }
}
