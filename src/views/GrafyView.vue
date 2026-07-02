<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useFinanceStore } from '@/stores/finance'
import { usePeriodDates } from '@/composables/useFinance'
import PeriodRangeModal from '@/components/PeriodRangeModal.vue'
import {
  parseLocalDate,
  MONTHS_CS,
  getDaysInWeek,
  getMonday,
  formatDayLabel,
  getYearLabels,
  getYearRangeDates,
  getFullYearDates,
  formatDateISO,
} from '@/lib/dates'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type ViewPeriod = 'year' | 'month' | 'week' | 'custom'

const store = useFinanceStore()
const viewPeriod = ref<ViewPeriod>('month')
const baseDate = ref(new Date())
const customDateFrom = ref('')
const customDateTo = ref('')
const showPeriodModal = ref(false)

function getInitialCustomDates() {
  const d = new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  return {
    from: formatDateISO(start),
    to: formatDateISO(d),
  }
}

const initCustom = getInitialCustomDates()
customDateFrom.value = initCustom.from
customDateTo.value = initCustom.to

const dateFrom = ref('')
const dateTo = ref('')

const periodLabels: Record<Exclude<ViewPeriod, 'custom'>, string> = {
  year: 'podle roku',
  month: 'podle měsíce',
  week: 'podle týdne',
}

async function loadData() {
  if (viewPeriod.value === 'custom') {
    dateFrom.value = customDateFrom.value
    dateTo.value = customDateTo.value
    await store.fetchTransactions(customDateFrom.value, customDateTo.value)
  } else if (viewPeriod.value === 'year') {
    const { from, to } = getYearRangeDates(baseDate.value.getFullYear())
    dateFrom.value = from
    dateTo.value = to
    await store.fetchTransactions(from, to)
  } else if (viewPeriod.value === 'month') {
    const { from, to } = getFullYearDates(baseDate.value.getFullYear())
    dateFrom.value = from
    dateTo.value = to
    await store.fetchTransactions(from, to)
  } else {
    const { from, to } = usePeriodDates('week', baseDate.value)
    dateFrom.value = from
    dateTo.value = to
    await store.fetchTransactions(from, to)
  }
}

function prevPeriod() {
  if (viewPeriod.value === 'custom') return
  const d = new Date(baseDate.value)
  if (viewPeriod.value === 'year' || viewPeriod.value === 'month') {
    d.setFullYear(d.getFullYear() - 1)
  } else {
    d.setDate(d.getDate() - 7)
  }
  baseDate.value = d
}

function nextPeriod() {
  if (viewPeriod.value === 'custom') return
  const d = new Date(baseDate.value)
  if (viewPeriod.value === 'year' || viewPeriod.value === 'month') {
    d.setFullYear(d.getFullYear() + 1)
  } else {
    d.setDate(d.getDate() + 7)
  }
  baseDate.value = d
}

const periodLabel = computed(() => {
  if (viewPeriod.value === 'custom') {
    const from = parseLocalDate(dateFrom.value)
    const to = parseLocalDate(dateTo.value)
    return `${from.getDate()}. ${from.getMonth() + 1}. – ${to.getDate()}. ${to.getMonth() + 1}.`
  }
  if (viewPeriod.value === 'year') {
    const years = getYearLabels(baseDate.value.getFullYear())
    return `${years[0]} – ${years[years.length - 1]}`
  }
  if (viewPeriod.value === 'month') {
    return String(baseDate.value.getFullYear())
  }
  const from = parseLocalDate(dateFrom.value)
  const to = parseLocalDate(dateTo.value)
  return `${from.getDate()}. ${from.getMonth() + 1}. – ${to.getDate()}. ${to.getMonth() + 1}.`
})

watch(baseDate, () => {
  if (viewPeriod.value !== 'custom') loadData()
})

async function selectPeriod(p: ViewPeriod) {
  if (p === 'custom') {
    showPeriodModal.value = true
  } else {
    viewPeriod.value = p
    await loadData()
  }
}

function onPeriodConfirm(from: string, to: string) {
  customDateFrom.value = from
  customDateTo.value = to
  viewPeriod.value = 'custom'
  loadData()
}

watch([customDateFrom, customDateTo], () => {
  if (viewPeriod.value === 'custom') loadData()
})

onMounted(loadData)

const chartData = computed(() => {
  const txs = store.transactions
  const buckets = new Map<string, { income: number; expense: number }>()

  for (const t of txs) {
    const d = parseLocalDate(t.date)
    let key: string
    if (viewPeriod.value === 'year') {
      key = String(d.getFullYear())
    } else if (viewPeriod.value === 'month') {
      key = MONTHS_CS[d.getMonth()]
    } else if (viewPeriod.value === 'week') {
      key = formatDayLabel(d)
    } else {
      key = formatDayLabel(d)
    }

    const b = buckets.get(key) ?? { income: 0, expense: 0 }
    if (t.type === 'income') b.income += Number(t.amount)
    else b.expense += Number(t.amount)
    buckets.set(key, b)
  }

  let keys: string[]
  if (viewPeriod.value === 'year') {
    keys = getYearLabels(baseDate.value.getFullYear())
  } else if (viewPeriod.value === 'month') {
    keys = [...MONTHS_CS]
  } else if (viewPeriod.value === 'week') {
    keys = getDaysInWeek(getMonday(parseLocalDate(dateFrom.value)))
  } else {
    keys = Array.from(buckets.keys())
  }

  return {
    labels: keys,
    income: keys.map((k) => buckets.get(k)?.income ?? 0),
    expense: keys.map((k) => buckets.get(k)?.expense ?? 0),
    profit: keys.map((k) => {
      const b = buckets.get(k) ?? { income: 0, expense: 0 }
      return Math.max(0, b.income - b.expense)
    }),
    loss: keys.map((k) => {
      const b = buckets.get(k) ?? { income: 0, expense: 0 }
      return Math.max(0, b.expense - b.income)
    }),
  }
})

const showChart = computed(() =>
  viewPeriod.value !== 'custom' || chartData.value.labels.length > 0
)

const chartMinWidth = computed(() => {
  const count = chartData.value.labels.length || 1
  const perLabel = viewPeriod.value === 'month' ? 56 : 64
  return Math.max(count * perLabel, 280)
})

const chartDataset = computed(() => [
  { label: 'Příjem', data: chartData.value.income, backgroundColor: '#22C55E' },
  { label: 'Výdaje', data: chartData.value.expense, backgroundColor: '#EAB308' },
  { label: 'Zisk', data: chartData.value.profit, backgroundColor: '#60A5FA' },
  { label: 'Ztráta', data: chartData.value.loss, backgroundColor: '#F87171' },
])

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: false, grid: { display: false } },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.1)' },
      ticks: { callback: (v: number | string) => String(v) + ' Kč' },
    },
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, pointStyle: 'circle' },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { raw: unknown; dataset?: { label?: string } }) => {
          const val = Number(ctx.raw)
          if (val === 0) return undefined
          return `${ctx.dataset?.label ?? ''}: ${val} Kč`
        },
      },
    },
  },
} as const

const totalIncome = computed(() => chartData.value.income.reduce((a, b) => a + b, 0))
const totalExpense = computed(() => chartData.value.expense.reduce((a, b) => a + b, 0))
const balance = computed(() => totalIncome.value - totalExpense.value)
</script>

<template>
  <div class="grafy-view">
    <h2 class="page-title">Grafy</h2>

    <div class="period-filters">
      <button
        v-for="(label, key) in periodLabels"
        :key="key"
        :class="['filter-btn', { active: viewPeriod === key }]"
        @click="selectPeriod(key as Exclude<ViewPeriod, 'custom'>)"
      >
        {{ label }}
      </button>
      <button
        :class="['filter-btn', { active: viewPeriod === 'custom' }]"
        @click="selectPeriod('custom')"
      >
        Doba
      </button>
    </div>

    <PeriodRangeModal
      :model-value="showPeriodModal"
      :date-from="customDateFrom"
      :date-to="customDateTo"
      @update:model-value="showPeriodModal = $event"
      @confirm="onPeriodConfirm"
    />

    <div v-if="viewPeriod !== 'custom'" class="period-nav">
      <button class="nav-arrow" @click="prevPeriod">‹</button>
      <span class="period-label">{{ periodLabel }}</span>
      <button class="nav-arrow" @click="nextPeriod">›</button>
    </div>
    <p v-else class="period-label custom">{{ periodLabel }}</p>

    <div class="balance-cards">
      <div class="balance-card income">
        <span class="label">Příjem</span>
        <span class="value">{{ totalIncome.toLocaleString('cs-CZ') }} Kč</span>
      </div>
      <div class="balance-card expense">
        <span class="label">Výdaje</span>
        <span class="value">{{ totalExpense.toLocaleString('cs-CZ') }} Kč</span>
      </div>
      <div :class="['balance-card', balance >= 0 ? 'profit' : 'loss']">
        <span class="label">{{ balance >= 0 ? 'Zisk' : 'Ztráta' }}</span>
        <span class="value">
          {{ (balance >= 0 ? balance : -balance).toLocaleString('cs-CZ') }} Kč
        </span>
      </div>
    </div>

    <div class="chart-wrapper">
      <div v-if="showChart" class="chart-scroll">
        <div class="chart-inner" :style="{ minWidth: chartMinWidth + 'px' }">
          <Bar
            :data="{ labels: chartData.labels, datasets: chartDataset }"
            :options="options"
          />
        </div>
      </div>
      <div v-else class="empty-chart">
        <p>Žádná data pro zobrazení</p>
        <p class="hint">Přidejte transakce na hlavní obrazovce</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grafy-view {
  padding-bottom: 20px;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.period-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--accent-green);
  color: var(--bg-primary);
}

.period-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.nav-arrow {
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 4px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.nav-arrow:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}

.period-label {
  font-size: 1rem;
  font-weight: 600;
  min-width: 140px;
  text-align: center;
}

.period-label.custom {
  text-align: center;
  margin-bottom: 20px;
  color: var(--text-secondary);
  font-weight: 500;
}

.balance-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.balance-card {
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--border);
}

.balance-card .label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.balance-card .value {
  font-weight: 700;
  font-size: 1rem;
}

.balance-card.income .value { color: var(--accent-green); }
.balance-card.expense .value { color: var(--accent-gold); }
.balance-card.profit .value { color: var(--accent-blue); }
.balance-card.loss .value { color: var(--accent-red); }

.chart-wrapper {
  height: 320px;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--border);
}

.chart-scroll {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.chart-inner {
  height: 100%;
}

.empty-chart {
  height: 100%;
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
</style>
