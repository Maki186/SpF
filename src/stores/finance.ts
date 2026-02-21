import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Transaction, Category, Account } from '@/types'

export const useFinanceStore = defineStore('finance', () => {
  const authStore = useAuthStore()
  const transactions = ref<Transaction[]>([])
  const categories = ref<Category[]>([])
  const accounts = ref<Account[]>([])
  const loading = ref(false)

  const userId = computed(() => authStore.user?.id)

  async function fetchTransactions(dateFrom?: string, dateTo?: string) {
    if (!userId.value) return
    loading.value = true
    let query = supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId.value)
      .order('date', { ascending: false })

    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)

    const { data, error } = await query
    if (error) throw error
    transactions.value = data ?? []
    loading.value = false
  }

  async function fetchCategories(type?: 'income' | 'expense') {
    if (!userId.value) return
    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId.value)

    if (type) query = query.eq('type', type)
    query = query.order('name')

    const { data, error } = await query
    if (error) throw error
    categories.value = data ?? []
  }

  async function fetchAccounts() {
    if (!userId.value) return
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId.value)

    if (error) throw error
    accounts.value = data ?? []
  }

  async function addTransaction(t: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!userId.value) return
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId.value,
        account_id: t.account_id || null,
        category_id: t.category_id || null,
        amount: t.amount,
        type: t.type,
        date: t.date,
        comment: t.comment || null,
        tags: t.tags ?? [],
      })
      .select('*, category:categories(*)')
      .single()

    if (error) throw error
    if (data) transactions.value.unshift(data)
    return data
  }

  async function addCategory(c: Omit<Category, 'id' | 'user_id' | 'created_at'>) {
    if (!userId.value) return
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId.value,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        planned_amount: c.planned_amount ?? 0,
      })
      .select()
      .single()

    if (error) throw error
    if (data) categories.value.push(data)
    return data
  }

  return {
    transactions,
    categories,
    accounts,
    loading,
    fetchTransactions,
    fetchCategories,
    fetchAccounts,
    addTransaction,
    addCategory,
  }
})
