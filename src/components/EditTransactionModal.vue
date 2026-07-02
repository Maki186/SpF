<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFinance } from '@/composables/useFinance'
import { useUIStore } from '@/stores/ui'
import { CATEGORY_ICON_EMOJI } from '@/types'
import type { Transaction } from '@/types'
import { parsePositiveAmount } from '@/lib/validation'

const props = defineProps<{ transaction: Transaction | null }>()
const emit = defineEmits<{ close: []; updated: [] }>()

const { updateTransaction, fetchCategories, fetchAccounts, categories, accounts } = useFinance()
const uiStore = useUIStore()

const type = ref<'income' | 'expense'>('expense')
const amount = ref('')
const categoryId = ref('')
const accountId = ref('')
const date = ref('')
const comment = ref('')
const error = ref('')
const loading = ref(false)

const filteredCategories = computed(() =>
  categories.value.filter((c: { type: string }) => c.type === type.value)
)

watch(() => props.transaction, (tx) => {
  if (tx) {
    type.value = tx.type
    amount.value = String(tx.amount)
    categoryId.value = tx.category_id || ''
    accountId.value = tx.account_id || ''
    date.value = tx.date
    comment.value = tx.comment || ''
    fetchCategories(tx.type)
    fetchAccounts()
  }
}, { immediate: true })

watch(type, () => {
  categoryId.value = ''
  fetchCategories(type.value)
})

async function submit() {
  if (!props.transaction) return
  const num = parsePositiveAmount(amount.value)
  if (num === null) {
    error.value = 'Zadejte platnou kladnou částku'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await updateTransaction(props.transaction.id, {
      amount: num,
      type: type.value,
      category_id: categoryId.value || null,
      account_id: accountId.value || null,
      date: date.value,
      comment: comment.value || null,
    })
    emit('updated')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="transaction" class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Upravit transakci</h2>
        <button class="close-btn" @click="emit('close')" aria-label="Zavřít">×</button>
      </div>

      <form @submit.prevent="submit" class="modal-form">
        <div class="type-tabs">
          <button :class="['tab', { active: type === 'expense' }]" type="button" @click="type = 'expense'">
            VÝDAJE
          </button>
          <button :class="['tab', { active: type === 'income' }]" type="button" @click="type = 'income'">
            PŘÍJEM
          </button>
        </div>

        <div class="amount-field">
          <input v-model="amount" type="text" inputmode="decimal" placeholder="0" class="amount-input" />
          <span class="currency">CZK</span>
        </div>

        <div class="field">
          <label>Účet</label>
          <select v-model="accountId" class="select">
            <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </div>

        <div class="field">
          <label>Kategorie</label>
          <div class="category-grid">
            <button
              v-for="c in filteredCategories"
              :key="c.id"
              type="button"
              :class="['cat-btn', { selected: categoryId === c.id }]"
              :style="{ '--cat-color': c.color }"
              @click="categoryId = c.id"
            >
              <span class="cat-icon">{{ CATEGORY_ICON_EMOJI[c.icon] || c.icon?.[0] || '•' }}</span>
              <span class="cat-name">{{ c.name }}</span>
            </button>
            <button type="button" class="cat-btn add-cat" @click="uiStore.openAddCategory(type)">
              <span class="cat-icon">+</span>
              <span class="cat-name">Více</span>
            </button>
          </div>
        </div>

        <div class="field">
          <label>Datum</label>
          <input v-model="date" type="date" class="input" />
        </div>

        <div class="field">
          <label>Komentář</label>
          <input v-model="comment" type="text" placeholder="Volitelný komentář" class="input" />
        </div>

        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn-primary full">Uložit</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 350;
}

.modal {
  background: var(--bg-secondary);
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 1.25rem;
}

.close-btn {
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 4px;
}

.type-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  padding: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-radius: 8px;
}

.tab.active {
  color: var(--accent-green);
  border-bottom: 2px solid var(--accent-green);
}

.amount-field {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
}

.amount-input {
  flex: 1;
  font-size: 2rem;
  font-weight: 600;
  background: none;
  border: none;
  color: var(--text-primary);
}

.currency {
  color: var(--text-secondary);
  font-size: 1rem;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.select, .input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-primary);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.cat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 2px solid transparent;
  color: var(--text-primary);
}

.cat-btn.selected {
  border-color: var(--cat-color, var(--accent-green));
}

.add-cat {
  border-style: dashed;
}

.full {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
}
</style>
