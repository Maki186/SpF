<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  dateFrom: string
  dateTo: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [from: string, to: string] }>()

const from = ref(props.dateFrom)
const to = ref(props.dateTo)

watch(() => props.modelValue, (visible) => {
  if (visible) {
    from.value = props.dateFrom
    to.value = props.dateTo
  }
})

watch([() => props.dateFrom, () => props.dateTo], ([f, t]) => {
  from.value = f as string
  to.value = t as string
})

function handleOk() {
  if (from.value > to.value) {
    const tmp = from.value
    from.value = to.value
    to.value = tmp
  }
  emit('confirm', from.value, to.value)
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="emit('update:modelValue', false)">
    <div class="modal">
      <div class="modal-header">
        <h2>Výběr období</h2>
        <button class="close-btn" @click="handleCancel" aria-label="Zavřít">×</button>
      </div>

      <div class="modal-form">
        <div class="field">
          <label>Od data</label>
          <input v-model="from" type="date" class="input" />
        </div>
        <div class="field">
          <label>Do data</label>
          <input v-model="to" type="date" class="input" />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="handleCancel">
            Zrušit
          </button>
          <button type="button" class="btn-primary" @click="handleOk">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 250;
}

.modal {
  background: var(--bg-secondary);
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  padding: 24px;
  margin: 16px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 1.2rem;
}

.close-btn {
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 4px;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 6px;
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

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions .btn-secondary,
.modal-actions .btn-primary {
  flex: 1;
}
</style>
