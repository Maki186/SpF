<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFinance } from '@/composables/useFinance'
import { useUIStore } from '@/stores/ui'
import { CATEGORY_ICON_EMOJI } from '@/types'

const emit = defineEmits<{ close: []; added: [] }>()
const { addTransaction, fetchCategories, fetchAccounts, categories, accounts } = useFinance()
const uiStore = useUIStore()

const type = ref<'income' | 'expense'>('expense')
const amount = ref('')
const categoryId = ref('')
const accountId = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const comment = ref('')
const error = ref('')
const loading = ref(false)

const filteredCategories = computed(() =>
  categories.value.filter((c: { type: string }) => c.type === type.value)
)

watch(type, () => {
  categoryId.value = ''
  fetchCategories(type.value)
})

async function init() {
  await Promise.all([
    fetchCategories(type.value),
    fetchAccounts(),
  ])
  if (accounts.value.length) accountId.value = accounts.value[0].id
}

init()

async function submit() {
  const num = parseFloat(amount.value.replace(/\s/g, '').replace(',', '.'))
  if (isNaN(num) || num <= 0) {
    error.value = 'Zadejte platnou částku'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await addTransaction({
      account_id: accountId.value || null,
      category_id: categoryId.value || null,
      amount: num,
      type: type.value,
      date: date.value,
      comment: comment.value || null,
      tags: [],
    })
    emit('added')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Přidat transakci</h2>
        <button class="close-btn" @click="emit('close')" aria-label="Zavřít">×</button>
      </div>

      <div class="type-tabs">
        <button
          :class="['tab', { active: type === 'expense' }]"
          @click="type = 'expense'"
        >
          VÝDAJE
        </button>
        <button
          :class="['tab', { active: type === 'income' }]"
          @click="type = 'income'"
        >
          PŘÍJEM
        </button>
      </div>

      <form @submit.prevent="submit" class="modal-form">
        <div class="amount-field">
          <input
            v-model="amount"
            type="text"
            inputmode="decimal"
            placeholder="0"
            class="amount-input"
          />
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
            <button
              type="button"
              class="cat-btn add-cat"
              @click="uiStore.openAddCategory(type)"
            >
              <span class="cat-icon">+</span>
              <span class="cat-name">Více</span>
            </button>
          </div>
        </div>

        <div class="field">
          <label>Datum</label>
          <div class="date-row">
            <button
              type="button"
              :class="['date-btn', { active: date === new Date().toISOString().split('T')[0] }]"
              @click="date = new Date().toISOString().split('T')[0]"
            >
              Dnes
            </button>
            <button
              type="button"
              :class="['date-btn', { active: date === new Date(Date.now()-864e5).toISOString().split('T')[0] }]"
              @click="date = new Date(Date.now()-864e5).toISOString().split('T')[0]"
            >
              Včera
            </button>
            <input v-model="date" type="date" class="date-input" />
          </div>
        </div>

        <div class="field">
          <label>Komentář</label>
          <input v-model="comment" type="text" placeholder="Volitelný komentář" class="input" />
        </div>

        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn-primary full">Přidat</button>
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
  z-index: 200;
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
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: all 0.2s;
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

.amount-input:focus {
  outline: none;
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
  transition: all 0.2s;
}

.cat-btn.selected {
  border-color: var(--cat-color, var(--accent-green));
  background: color-mix(in srgb, var(--cat-color, var(--accent-green)) 20%, transparent);
}

.cat-icon {
  font-size: 1.5rem;
}

.cat-name {
  font-size: 0.75rem;
  text-align: center;
}

.add-cat {
  border-style: dashed;
}

.date-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.date-btn {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.date-btn.active {
  background: var(--accent-green);
  color: var(--bg-primary);
}

.date-input {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
}

.full {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
}
</style>
