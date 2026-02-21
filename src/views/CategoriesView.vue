<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinance } from '@/composables/useFinance'
import { useUIStore } from '@/stores/ui'
import { CATEGORY_ICON_EMOJI } from '@/types'

const { categories, fetchCategories } = useFinance()
const uiStore = useUIStore()

const filterType = ref<'all' | 'income' | 'expense'>('all')

const filteredCategories = computed(() => {
  if (filterType.value === 'all') return categories.value
  return categories.value.filter((c) => c.type === filterType.value)
})

onMounted(() => fetchCategories())
</script>

<template>
  <div class="categories-view">
    <h2 class="page-title">Správa kategorií</h2>

    <div class="filter-tabs">
      <button
        :class="['filter-tab', { active: filterType === 'all' }]"
        @click="filterType = 'all'"
      >
        Vše
      </button>
      <button
        :class="['filter-tab', { active: filterType === 'expense' }]"
        @click="filterType = 'expense'"
      >
        Výdaje
      </button>
      <button
        :class="['filter-tab', { active: filterType === 'income' }]"
        @click="filterType = 'income'"
      >
        Příjem
      </button>
    </div>

    <div class="category-list">
      <div
        v-for="cat in filteredCategories"
        :key="cat.id"
        class="category-item"
        @click="uiStore.openEditCategory(cat)"
      >
        <span class="cat-icon" :style="{ background: cat.color }">
          {{ CATEGORY_ICON_EMOJI[cat.icon] || cat.icon?.[0] || '•' }}
        </span>
        <div class="cat-info">
          <span class="cat-name">{{ cat.name }}</span>
          <span class="cat-type">{{ cat.type === 'expense' ? 'Výdaje' : 'Příjem' }}</span>
        </div>
        <span class="edit-hint">›</span>
      </div>
      <p v-if="!filteredCategories.length" class="empty-list">
        Žádné kategorie. Přidejte novou v okně přidání transakce.
      </p>
    </div>
  </div>
</template>

<style scoped>
.categories-view {
  padding-bottom: 20px;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-tab {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.filter-tab.active {
  background: var(--accent-green);
  color: var(--bg-primary);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.2s;
}

.category-item:hover {
  background: var(--bg-secondary);
}

.cat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.cat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-name {
  font-weight: 600;
  font-size: 1rem;
}

.cat-type {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.edit-hint {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.empty-list {
  text-align: center;
  color: var(--text-secondary);
  padding: 32px 16px;
}
</style>
