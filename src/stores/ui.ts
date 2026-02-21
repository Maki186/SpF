import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const showAddTransaction = ref(false)
  const showAddCategory = ref(false)
  const addCategoryType = ref<'income' | 'expense' | null>(null)

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

  return {
    showAddTransaction,
    showAddCategory,
    addCategoryType,
    openAddTransaction,
    closeAddTransaction,
    openAddCategory,
    closeAddCategory,
  }
})
