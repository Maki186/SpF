<script setup lang="ts">
import { ref } from 'vue'
import { useFinance } from '@/composables/useFinance'
import { useUIStore } from '@/stores/ui'
import { CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_ICON_EMOJI } from '@/types'

const emit = defineEmits<{ close: []; added: [] }>()
const { addCategory, fetchCategories } = useFinance()

const uiStore = useUIStore()
const name = ref('')
const type = ref<'income' | 'expense'>(uiStore.addCategoryType || 'expense')
const icon = ref('receipt')
const color = ref('#6B7280')
const plannedAmount = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!name.value.trim()) {
    error.value = 'Zadejte název kategorie'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await addCategory({
      name: name.value.trim(),
      type: type.value,
      icon: icon.value,
      color: color.value,
      planned_amount: parseFloat(plannedAmount.value) || 0,
    })
    await fetchCategories()
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
        <h2>Vytvořit kategorii</h2>
        <button class="close-btn" @click="emit('close')" aria-label="Zavřít">×</button>
      </div>

      <form @submit.prevent="submit" class="modal-form">
        <div class="field">
          <label>Název kategorie</label>
          <input
            v-model="name"
            type="text"
            placeholder="Zadejte název kategorie"
            class="input"
          />
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
            <input
              v-model="color"
              type="color"
              class="color-picker"
            />
          </div>
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
  z-index: 300;
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

.radio-label input {
  accent-color: var(--accent-green);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.icon-btn {
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid transparent;
  font-size: 1.25rem;
  transition: all 0.2s;
}

.icon-btn.selected {
  border-color: var(--accent-green);
  background: color-mix(in srgb, var(--accent-green) 20%, var(--bg-card));
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
  box-shadow: 0 0 0 2px var(--bg-primary);
}

.color-picker {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: none;
}

.full {
  width: 100%;
  margin-top: 16px;
  padding: 14px;
}
</style>
