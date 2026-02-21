<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useFinance, usePeriodDates } from '@/composables/useFinance'
import DonutChart from '@/components/DonutChart.vue'
import { CATEGORY_ICON_EMOJI } from '@/types'

type Period = 'day' | 'week' | 'month' | 'year'

const { transactions, fetchTransactions } = useFinance()
const period = ref<Period>('week')
const baseDate = ref(new Date())

const periodLabels: Record<Period, string> = {
  day: 'Den',
  week: 'Týden',
  month: 'Měsíc',
  year: 'Rok',
}

const { from, to } = usePeriodDates(period.value, baseDate.value)

const dateFrom = ref(from)
const dateTo = ref(to)

watch([period, baseDate], () => {
  const { from: f, to: t } = usePeriodDates(period.value, baseDate.value)
  dateFrom.value = f
  dateTo.value = t
  fetchTransactions(f, t)
})

onMounted(() => fetchTransactions(dateFrom.value, dateTo.value))

const type = ref<'income' | 'expense'>('expense')

const filteredTransactions = computed(() =>
  transactions.value.filter((t: { type: string }) => t.type === type.value)
)

const chartData = computed(() => {
  const byCategory = new Map<string, { amount: number; color: string }>()
  for (const t of filteredTransactions.value) {
    const label = t.category?.name ?? 'Bez kategorie'
    const color = t.category?.color ?? '#6B7280'
    const current = byCategory.get(label) ?? { amount: 0, color }
    current.amount += Number(t.amount)
    byCategory.set(label, current)
  }
  return Array.from(byCategory.entries()).map(([label, { amount, color }]) => ({
    label,
    amount,
    color,
  }))
})

const total = computed(() =>
  filteredTransactions.value.reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0)
)

function prevPeriod() {
  const d = new Date(baseDate.value)
  if (period.value === 'day') d.setDate(d.getDate() - 1)
  else if (period.value === 'week') d.setDate(d.getDate() - 7)
  else if (period.value === 'month') d.setMonth(d.getMonth() - 1)
  else d.setFullYear(d.getFullYear() - 1)
  baseDate.value = d
}

function nextPeriod() {
  const d = new Date(baseDate.value)
  if (period.value === 'day') d.setDate(d.getDate() + 1)
  else if (period.value === 'week') d.setDate(d.getDate() + 7)
  else if (period.value === 'month') d.setMonth(d.getMonth() + 1)
  else d.setFullYear(d.getFullYear() + 1)
  baseDate.value = d
}

const periodLabel = computed(() => {
  const a = new Date(dateFrom.value)
  const b = new Date(dateTo.value)
  return `${a.getDate()}. ${a.getMonth() + 1}. – ${b.getDate()}. ${b.getMonth() + 1}.`
})

function formatDate(s: string) {
  const d = new Date(s)
  return `${d.getDate()}. ${d.getMonth() + 1}.`
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
      <button class="nav-arrow" @click="prevPeriod">‹</button>
      <div class="period-tabs">
        <button
          v-for="(label, key) in periodLabels"
          :key="key"
          :class="['period-tab', { active: period === key }]"
          @click="period = key as Period"
        >
          {{ label }}
        </button>
      </div>
      <button class="nav-arrow" @click="nextPeriod">›</button>
    </div>

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
      <div
        v-for="t in filteredTransactions"
        :key="t.id"
        class="transaction-item"
      >
        <span class="cat-icon" :style="{ background: t.category?.color || '#6B7280' }">
          {{ CATEGORY_ICON_EMOJI[t.category?.icon || ''] || (t.category?.icon?.[0] || '•') }}
        </span>
        <div class="tx-info">
          <span class="cat-name">{{ t.category?.name ?? 'Bez kategorie' }}</span>
          <span class="tx-date">{{ formatDate(t.date) }}</span>
        </div>
        <span class="tx-amount" :class="t.type">
          {{ t.type === 'expense' ? '-' : '+' }}{{ Number(t.amount).toLocaleString('cs-CZ') }} Kč
        </span>
      </div>
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

.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
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
}

.tx-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-name {
  font-weight: 500;
}

.tx-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.tx-amount {
  font-weight: 600;
  font-size: 1rem;
}

.tx-amount.expense {
  color: var(--accent-red);
}

.tx-amount.income {
  color: var(--accent-green);
}

.empty-list {
  text-align: center;
  color: var(--text-secondary);
  padding: 32px 16px;
}
</style>
