import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Transaction, Category } from '@/types'

export const useUIStore = defineStore('ui', () => {
  const showAddTransaction = ref(false)
  const showAddCategory = ref(false)
  const addCategoryType = ref<'income' | 'expense' | null>(null)

  const editTransaction = ref<Transaction | null>(null)
  const editCategory = ref<Category | null>(null)

  const showEditTransaction = computed(() => !!editTransaction.value)
  const showEditCategory = computed(() => !!editCategory.value)

  function openAddTransaction() {
    showAddTransaction.value = true
  }

  function closeAddTransaction() {
    showAddTransaction.value = false
  }

  function openAddCategory(type?: 'income' | 'expense') {
    addCategoryType.value = type ?? null
    showAddCategory.value = true
  }

  function closeAddCategory() {
    showAddCategory.value = false
    addCategoryType.value = null
  }

  function openEditTransaction(tx: Transaction) {
    editTransaction.value = tx
  }

  function closeEditTransaction() {
    editTransaction.value = null
  }

  function openEditCategory(cat: Category) {
    editCategory.value = cat
  }

  function closeEditCategory() {
    editCategory.value = null
  }

  return {
    showAddTransaction,
    showAddCategory,
    addCategoryType,
    editTransaction,
    editCategory,
    showEditTransaction,
    showEditCategory,
    openAddTransaction,
    closeAddTransaction,
    openAddCategory,
    closeAddCategory,
    openEditTransaction,
    closeEditTransaction,
    openEditCategory,
    closeEditCategory,
  }
})
