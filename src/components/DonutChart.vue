<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  data: { label: string; amount: number; color: string }[]
  total: number
}>()

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      data: props.data.map((d) => d.amount),
      backgroundColor: props.data.map((d) => d.color),
      borderWidth: 0,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { raw: unknown; label?: string }) =>
          `${ctx.label}: ${Number(ctx.raw)} Kč`,
      },
    },
  },
}
</script>

<template>
  <div class="chart-container">
    <Doughnut :data="chartData" :options="options" />
    <div class="chart-center">
      <span class="total">{{ total.toLocaleString('cs-CZ') }}</span>
      <span class="unit">Kč</span>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 240px;
  width: 240px;
  margin: 0 auto;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.total {
  font-size: 1.5rem;
  font-weight: 700;
  display: block;
}

.unit {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
</style>
