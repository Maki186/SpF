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

  async function updateCategory(id: string, c: Partial<Pick<Category, 'name' | 'type' | 'icon' | 'color' | 'planned_amount'>>) {
    if (!userId.value) return
    const { data, error } = await supabase
      .from('categories')
      .update(c)
      .eq('id', id)
      .eq('user_id', userId.value)
      .select()
      .single()

    if (error) throw error
    if (data) {
      const i = categories.value.findIndex((x) => x.id === id)
      if (i >= 0) categories.value[i] = data
    }
    return data
  }

  async function deleteCategory(id: string) {
    if (!userId.value) return
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId.value)
    if (error) throw error
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  async function updateTransaction(id: string, t: Partial<Pick<Transaction, 'amount' | 'category_id' | 'account_id' | 'date' | 'comment' | 'type'>>) {
    if (!userId.value) return
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...t, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId.value)
      .select('*, category:categories(*)')
      .single()

    if (error) throw error
    if (data) {
      const i = transactions.value.findIndex((x) => x.id === id)
      if (i >= 0) transactions.value[i] = data
    }
    return data
  }

  async function deleteTransaction(id: string) {
    if (!userId.value) return
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId.value)
    if (error) throw error
    transactions.value = transactions.value.filter((t) => t.id !== id)
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
    updateCategory,
    deleteCategory,
    updateTransaction,
    deleteTransaction,
  }
})
