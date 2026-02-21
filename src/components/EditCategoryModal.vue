<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFinance } from '@/composables/useFinance'
import { CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_ICON_EMOJI } from '@/types'
import type { Category } from '@/types'

const props = defineProps<{ category: Category | null }>()
const emit = defineEmits<{ close: []; updated: []; deleted: [] }>()

const { updateCategory, deleteCategory, fetchCategories } = useFinance()

const name = ref('')
const type = ref<'income' | 'expense'>('expense')
const icon = ref('receipt')
const color = ref('#6B7280')
const plannedAmount = ref('')
const error = ref('')
const loading = ref(false)
const showDeleteConfirm = ref(false)

watch(() => props.category, (cat) => {
  if (cat) {
    name.value = cat.name
    type.value = cat.type
    icon.value = cat.icon
    color.value = cat.color
    plannedAmount.value = cat.planned_amount ? String(cat.planned_amount) : ''
    showDeleteConfirm.value = false
  }
}, { immediate: true })

async function submit() {
  if (!props.category) return
  if (!name.value.trim()) {
    error.value = 'Zadejte název kategorie'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await updateCategory(props.category.id, {
      name: name.value.trim(),
      type: type.value,
      icon: icon.value,
      color: color.value,
      planned_amount: parseFloat(plannedAmount.value) || 0,
    })
    await fetchCategories()
    emit('updated')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!props.category) return
  loading.value = true
  try {
    await deleteCategory(props.category.id)
    await fetchCategories()
    emit('deleted')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="category" class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Upravit kategorii</h2>
        <button class="close-btn" @click="emit('close')" aria-label="Zavřít">×</button>
      </div>

      <form @submit.prevent="submit" class="modal-form">
        <div class="field">
          <label>Název kategorie</label>
          <input v-model="name" type="text" placeholder="Zadejte název kategorie" class="input" />
        </div>

        <div class="field">
          <label>Typ</label>
          <div class="radio-group">
            <label class="radio-label">
              <input v-model="type" type="radio" value="expense" />
              <span>Výdaje</span>
            </label>
            <label class="radio-label">
              <input v-model="type" type="radio" value="income" />
              <span>Příjem</span>
            </label>
          </div>
        </div>

        <div class="field">
          <label>Plánované výdaje (CZK za měsíc)</label>
          <input
            v-model="plannedAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Volitelné"
            class="input"
          />
        </div>

        <div class="field">
          <label>Ikona</label>
          <div class="icon-grid">
            <button
              v-for="iconName of CATEGORY_ICONS"
              :key="iconName"
              type="button"
              :class="['icon-btn', { selected: icon === iconName }]"
              @click="icon = iconName"
            >
              {{ CATEGORY_ICON_EMOJI[iconName] || '•' }}
            </button>
          </div>
        </div>

        <div class="field">
          <label>Barva</label>
          <div class="color-grid">
            <button
              v-for="c in CATEGORY_COLORS"
              :key="c"
              type="button"
              :class="['color-btn', { selected: color === c }]"
              :style="{ background: c }"
              @click="color = c"
            />
            <input v-model="color" type="color" class="color-picker" />
          </div>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="modal-actions">
          <button type="submit" class="btn-primary full">Uložit</button>
          <div v-if="!showDeleteConfirm" class="delete-row">
            <button
              type="button"
              class="btn-delete"
              @click="showDeleteConfirm = true"
            >
              Smazat kategorii
            </button>
          </div>
          <div v-else class="delete-confirm-row">
            <span class="delete-confirm-text">Opravdu smazat?</span>
            <div class="delete-buttons">
              <button type="button" class="btn-secondary" @click="showDeleteConfirm = false">
                Ne
              </button>
              <button type="button" class="btn-delete-confirm" @click="handleDelete">
                Ano, smazat
              </button>
            </div>
          </div>
        </div>
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
  z-index: 400;
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

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-primary);
}

.radio-group {
  display: flex;
  gap: 24px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-primary);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  max-height: 160px;
  overflow-y: auto;
}

.icon-btn {
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid transparent;
  font-size: 1.1rem;
}

.icon-btn.selected {
  border-color: var(--accent-green);
}

.color-grid {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.color-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
}

.color-btn.selected {
  border-color: white;
}

.color-picker {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: none;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.delete-row {
  margin-top: 8px;
}

.btn-delete {
  color: var(--accent-red);
  font-size: 0.9rem;
  padding: 8px 0;
}

.delete-confirm-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.delete-confirm-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.delete-buttons {
  display: flex;
  gap: 12px;
}

.btn-delete-confirm {
  color: var(--accent-red);
  font-weight: 600;
}
</style>
