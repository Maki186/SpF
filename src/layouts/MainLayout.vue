<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useRouter } from 'vue-router'
import AddTransactionModal from '@/components/AddTransactionModal.vue'
import AddCategoryModal from '@/components/AddCategoryModal.vue'

const authStore = useAuthStore()
const uiStore = useUIStore()
const router = useRouter()

function logout() {
  authStore.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="main-layout">
    <header class="main-header">
      <button class="menu-btn" aria-label="Menu">☰</button>
      <h1 class="header-title">Správa financí</h1>
      <button class="logout-btn" @click="logout" aria-label="Odhlásit">⏻</button>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <nav class="bottom-nav">
      <router-link to="/" class="nav-item" active-class="active">
        <span class="nav-icon">📊</span>
        <span>Přehled</span>
      </router-link>
      <router-link to="/grafy" class="nav-item" active-class="active">
        <span class="nav-icon">📈</span>
        <span>Grafy</span>
      </router-link>
    </nav>

    <button class="fab" @click="uiStore.openAddTransaction()" aria-label="Přidat transakci">
      +
    </button>

    <AddTransactionModal
      v-if="uiStore.showAddTransaction"
      @close="uiStore.closeAddTransaction()"
      @added="uiStore.closeAddTransaction()"
    />
    <AddCategoryModal
      v-if="uiStore.showAddCategory"
      @close="uiStore.closeAddCategory()"
      @added="uiStore.closeAddCategory()"
    />
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  padding-bottom: 80px;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.menu-btn, .logout-btn {
  color: var(--text-secondary);
  font-size: 1.25rem;
  padding: 8px;
}

.menu-btn:hover, .logout-btn:hover {
  color: var(--text-primary);
}

.header-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.main-content {
  padding: 16px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  padding: 8px 0 24px;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.2s;
}

.nav-item:hover, .nav-item.active {
  color: var(--accent-green);
}

.nav-icon {
  font-size: 1.5rem;
}
</style>
