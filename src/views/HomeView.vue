<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useFinance, usePeriodDates } from '@/composables/useFinance'
import { useUIStore } from '@/stores/ui'
import DonutChart from '@/components/DonutChart.vue'
import PeriodRangeModal from '@/components/PeriodRangeModal.vue'
import { formatPeriodLabel, formatShortDate } from '@/lib/dates'
import { CATEGORY_ICON_EMOJI } from '@/types'
import type { Transaction } from '@/types'

type Period = 'day' | 'week' | 'month' | 'year' | 'custom'

const { transactions, fetchTransactions, deleteTransaction } = useFinance()
const uiStore = useUIStore()
const period = ref<Period>('week')
const baseDate = ref(new Date())
const customDateFrom = ref('')
const customDateTo = ref('')
const showPeriodModal = ref(false)
const expandedCategories = ref<Set<string>>(new Set())

const periodLabels: Record<Exclude<Period, 'custom'>, string> = {
  day: 'Den',
  week: 'Týden',
  month: 'Měsíc',
  year: 'Rok',
}

function getInitialCustomDates() {
  const d = new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d)
  return {
    from: start.toISOString().split('T')[0],
    to: end.toISOString().split('T')[0],
  }
}

const initCustom = getInitialCustomDates()
customDateFrom.value = initCustom.from
customDateTo.value = initCustom.to

const dateFrom = ref('')
const dateTo = ref('')

function updateDateRange() {
  if (period.value === 'custom') {
    dateFrom.value = customDateFrom.value
    dateTo.value = customDateTo.value
  } else {
    const { from, to } = usePeriodDates(period.value, baseDate.value)
    dateFrom.value = from
    dateTo.value = to
  }
  expandedCategories.value = new Set()
  fetchTransactions(dateFrom.value, dateTo.value)
}

watch([period, baseDate], () => {
  if (period.value !== 'custom') {
    updateDateRange()
  }
})

watch([customDateFrom, customDateTo], () => {
  if (period.value === 'custom') {
    updateDateRange()
  }
})

onMounted(() => {
  updateDateRange()
})

const type = ref<'income' | 'expense'>('expense')

const filteredTransactions = computed(() =>
  transactions.value.filter((t) => t.type === type.value)
)

const shouldGroupByCategory = computed(() => period.value !== 'day')

interface CategoryGroup {
  key: string
  name: string
  icon: string
  color: string
  total: number
  count: number
  transactions: Transaction[]
}

const groupedByCategory = computed<CategoryGroup[]>(() => {
  const map = new Map<string, CategoryGroup>()

  for (const t of filteredTransactions.value) {
    const key = t.category_id ?? '__none__'
    const existing = map.get(key)
    if (existing) {
      existing.total += Number(t.amount)
      existing.count += 1
      existing.transactions.push(t)
    } else {
      map.set(key, {
        key,
        name: t.category?.name ?? 'Bez kategorie',
        icon: t.category?.icon ?? '',
        color: t.category?.color ?? '#6B7280',
        total: Number(t.amount),
        count: 1,
        transactions: [t],
      })
    }
  }

  return Array.from(map.values())
    .map((g) => ({
      ...g,
      transactions: g.transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }))
    .sort((a, b) => b.total - a.total)
})

const chartData = computed(() =>
  groupedByCategory.value.map((g) => ({
    label: g.name,
    amount: g.total,
    color: g.color,
  }))
)

const total = computed(() =>
  filteredTransactions.value.reduce((sum, t) => sum + Number(t.amount), 0)
)

function prevPeriod() {
  if (period.value === 'custom') return
  const d = new Date(baseDate.value)
  if (period.value === 'day') d.setDate(d.getDate() - 1)
  else if (period.value === 'week') d.setDate(d.getDate() - 7)
  else if (period.value === 'month') d.setMonth(d.getMonth() - 1)
  else d.setFullYear(d.getFullYear() - 1)
  baseDate.value = d
}

function nextPeriod() {
  if (period.value === 'custom') return
  const d = new Date(baseDate.value)
  if (period.value === 'day') d.setDate(d.getDate() + 1)
  else if (period.value === 'week') d.setDate(d.getDate() + 7)
  else if (period.value === 'month') d.setMonth(d.getMonth() + 1)
  else d.setFullYear(d.getFullYear() + 1)
  baseDate.value = d
}

function selectPeriod(p: Period) {
  if (p === 'custom') {
    showPeriodModal.value = true
  } else {
    period.value = p
  }
}

function onPeriodConfirm(from: string, to: string) {
  customDateFrom.value = from
  customDateTo.value = to
  period.value = 'custom'
  updateDateRange()
}

const periodLabel = computed(() =>
  formatPeriodLabel(period.value, dateFrom.value, dateTo.value)
)

function toggleCategory(key: string) {
  const next = new Set(expandedCategories.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedCategories.value = next
}

function categoryIcon(icon: string) {
  return CATEGORY_ICON_EMOJI[icon] || icon?.[0] || '•'
}

const deletingId = ref<string | null>(null)
async function confirmDelete(t: { id: string }) {
  if (deletingId.value === t.id) {
    await deleteTransaction(t.id)
    deletingId.value = null
  } else {
    deletingId.value = t.id
    setTimeout(() => { deletingId.value = null }, 3000)
  }
}
</script>

<template>
  <div class="home-view">
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

    <div class="period-row">
      <button class="nav-arrow" :disabled="period === 'custom'" @click="prevPeriod">‹</button>
      <div class="period-tabs">
        <button
          v-for="(label, key) in periodLabels"
          :key="key"
          :class="['period-tab', { active: period === key }]"
          @click="selectPeriod(key as Exclude<Period, 'custom'>)"
        >
          {{ label }}
        </button>
        <button
          :class="['period-tab', { active: period === 'custom' }]"
          @click="selectPeriod('custom')"
        >
          Doba
        </button>
      </div>
      <button class="nav-arrow" :disabled="period === 'custom'" @click="nextPeriod">›</button>
    </div>

    <PeriodRangeModal
      :model-value="showPeriodModal"
      :date-from="customDateFrom"
      :date-to="customDateTo"
      @update:model-value="showPeriodModal = $event"
      @confirm="onPeriodConfirm"
    />

    <p class="date-range">{{ periodLabel }}</p>

    <div class="chart-section">
      <DonutChart
        v-if="chartData.length"
        :data="chartData"
        :total="total"
      />
      <div v-else class="empty-chart">
        <p>Žádná data</p>
        <p class="hint">Přidejte transakci tlačítkem +</p>
      </div>
    </div>

    <div class="transaction-list">
      <!-- Den: jednotlivé transakce s poznámkou -->
      <template v-if="!shouldGroupByCategory">
        <div
          v-for="t in filteredTransactions"
          :key="t.id"
          class="transaction-item"
        >
          <span class="cat-icon" :style="{ background: t.category?.color || '#6B7280' }">
            {{ categoryIcon(t.category?.icon || '') }}
          </span>
          <div class="tx-info">
            <span class="cat-name">{{ t.category?.name ?? 'Bez kategorie' }}</span>
            <span v-if="t.comment" class="tx-comment">{{ t.comment }}</span>
            <span class="tx-date">{{ formatShortDate(t.date) }}</span>
          </div>
          <span class="tx-amount" :class="t.type">
            {{ t.type === 'expense' ? '-' : '+' }}{{ Number(t.amount).toLocaleString('cs-CZ') }} Kč
          </span>
          <div class="tx-actions">
            <button class="action-btn" title="Upravit" @click="uiStore.openEditTransaction(t)">✎</button>
            <button
              :class="['action-btn', 'delete-btn', { confirm: deletingId === t.id }]"
              :title="deletingId === t.id ? 'Klikněte znovu pro smazání' : 'Smazat'"
              @click="confirmDelete(t)"
            >
              {{ deletingId === t.id ? '!' : '🗑' }}
            </button>
          </div>
        </div>
      </template>

      <!-- Týden / měsíc / rok / doba: seskupení podle kategorie -->
      <template v-else>
        <div
          v-for="group in groupedByCategory"
          :key="group.key"
          class="category-group"
        >
          <button
            class="category-header"
            :class="{ expanded: expandedCategories.has(group.key) }"
            @click="toggleCategory(group.key)"
          >
            <span class="cat-icon" :style="{ background: group.color }">
              {{ categoryIcon(group.icon) }}
            </span>
            <div class="tx-info">
              <span class="cat-name">{{ group.name }}</span>
              <span class="tx-meta">{{ group.count }}× platba</span>
            </div>
            <span class="tx-amount" :class="type">
              {{ type === 'expense' ? '-' : '+' }}{{ group.total.toLocaleString('cs-CZ') }} Kč
            </span>
            <span class="expand-icon">{{ expandedCategories.has(group.key) ? '▾' : '▸' }}</span>
          </button>

          <div v-if="expandedCategories.has(group.key)" class="category-details">
            <div
              v-for="t in group.transactions"
              :key="t.id"
              class="transaction-item nested"
            >
              <div class="tx-info">
                <span class="tx-date">{{ formatShortDate(t.date) }}</span>
                <span v-if="t.comment" class="tx-comment">{{ t.comment }}</span>
              </div>
              <span class="tx-amount" :class="t.type">
                {{ t.type === 'expense' ? '-' : '+' }}{{ Number(t.amount).toLocaleString('cs-CZ') }} Kč
              </span>
              <div class="tx-actions">
                <button class="action-btn" title="Upravit" @click="uiStore.openEditTransaction(t)">✎</button>
                <button
                  :class="['action-btn', 'delete-btn', { confirm: deletingId === t.id }]"
                  :title="deletingId === t.id ? 'Klikněte znovu pro smazání' : 'Smazat'"
                  @click="confirmDelete(t)"
                >
                  {{ deletingId === t.id ? '!' : '🗑' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <p v-if="!filteredTransactions.length" class="empty-list">
        Žádné transakce v tomto období
      </p>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  padding-bottom: 20px;
}

.type-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  padding: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.2s;
}

.tab.active {
  color: var(--accent-green);
  border-bottom: 2px solid var(--accent-green);
}

.period-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.nav-arrow {
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 4px;
}

.nav-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.period-tabs {
  flex: 1;
  display: flex;
  gap: 4px;
  overflow-x: auto;
}

.period-tab {
  padding: 6px 12px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  border-radius: 8px;
  white-space: nowrap;
}

.period-tab.active {
  background: var(--accent-green);
  color: var(--bg-primary);
}

.date-range {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.chart-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
}

.empty-chart {
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.hint {
  font-size: 0.85rem;
  margin-top: 4px;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-group {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  color: var(--text-primary);
  transition: background 0.2s;
}

.category-header:hover {
  background: var(--bg-secondary);
}

.category-header.expanded {
  border-bottom: 1px solid var(--border);
}

.category-details {
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.transaction-item.nested {
  border: none;
  border-radius: 0;
  background: var(--bg-secondary);
  padding: 12px 16px 12px 72px;
  border-bottom: 1px solid var(--border);
}

.transaction-item.nested:last-child {
  border-bottom: none;
}

.cat-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.tx-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cat-name {
  font-weight: 500;
}

.tx-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.tx-comment {
  font-size: 0.85rem;
  color: var(--text-primary);
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-comment.muted {
  color: var(--text-secondary);
  opacity: 0.6;
  font-style: italic;
}

.tx-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.tx-amount {
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}

.tx-amount.expense {
  color: var(--accent-red);
}

.tx-amount.income {
  color: var(--accent-green);
}

.expand-icon {
  font-size: 0.9rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.tx-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  color: var(--accent-green);
  background: var(--bg-card);
}

.action-btn.delete-btn:hover {
  color: var(--accent-red);
}

.action-btn.delete-btn.confirm {
  background: var(--accent-red);
  color: white;
}

.empty-list {
  text-align: center;
  color: var(--text-secondary);
  padding: 32px 16px;
}
</style>
