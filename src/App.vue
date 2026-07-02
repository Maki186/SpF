<template>
  <div v-if="authStore.loading" class="loading-screen">
    <div class="spinner"></div>
    <p>Načítání...</p>
  </div>
  <router-view v-else v-slot="{ Component }">
    <template v-if="Component">
      <Suspense>
        <component :is="Component" />
        <template #fallback>
          <div class="loading-screen">
            <div class="spinner"></div>
            <p>Načítání...</p>
          </div>
        </template>
      </Suspense>
    </template>
  </router-view>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.loading-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
