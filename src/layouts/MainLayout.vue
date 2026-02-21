<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useRouter } from 'vue-router'
import AddTransactionModal from '@/components/AddTransactionModal.vue'
import AddCategoryModal from '@/components/AddCategoryModal.vue'
import EditTransactionModal from '@/components/EditTransactionModal.vue'
import EditCategoryModal from '@/components/EditCategoryModal.vue'

const authStore = useAuthStore()
const uiStore = useUIStore()
const router = useRouter()
const menuOpen = ref(false)

function logout() {
  authStore.signOut()
  router.push('/login')
  menuOpen.value = false
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <div class="main-layout">
    <header class="main-header">
      <button class="menu-btn" aria-label="Menu" @click="menuOpen = true">☰</button>
      <h1 class="header-title">Správa financí</h1>
      <button class="logout-btn" @click="logout" aria-label="Odhlásit">⏻</button>
    </header>

    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu" />
    <aside :class="['menu-drawer', { open: menuOpen }]">
      <div class="menu-header">
        <h2>Menu</h2>
        <button class="close-menu" @click="closeMenu" aria-label="Zavřít">×</button>
      </div>
      <nav class="menu-nav">
        <router-link to="/" class="menu-item" @click="closeMenu">
          <span>📊</span> Přehled
        </router-link>
        <router-link to="/grafy" class="menu-item" @click="closeMenu">
          <span>📈</span> Grafy
        </router-link>
        <router-link to="/kategorie" class="menu-item" @click="closeMenu">
          <span>📁</span> Správa kategorií
        </router-link>
      </nav>
    </aside>

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
    <EditTransactionModal
      v-if="uiStore.editTransaction"
      :transaction="uiStore.editTransaction"
      @close="uiStore.closeEditTransaction()"
      @updated="uiStore.closeEditTransaction()"
    />
    <EditCategoryModal
      v-if="uiStore.editCategory"
      :category="uiStore.editCategory"
      @close="uiStore.closeEditCategory()"
      @updated="uiStore.closeEditCategory()"
      @deleted="uiStore.closeEditCategory()"
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

.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
}

.menu-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  max-width: 85vw;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  z-index: 151;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  padding: 20px;
}

.menu-drawer.open {
  transform: translateX(0);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.menu-header h2 {
  font-size: 1.25rem;
}

.close-menu {
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 4px;
}

.menu-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  color: var(--text-primary);
  text-decoration: none;
  transition: background 0.2s;
}

.menu-item:hover {
  background: var(--bg-card);
}

.menu-item span {
  font-size: 1.25rem;
}
</style>
