<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.signIn(email.value, password.value)
    router.push('/')
  } catch (e: unknown) {
    error.value = (e as Error).message === 'Invalid login credentials'
      ? 'Nesprávný email nebo heslo'
      : (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Správa financí</h1>
      <p class="subtitle">Přihlaste se ke svému účtu</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder=" vase@email.cz"
            autocomplete="email"
          />
        </div>
        <div class="field">
          <label for="password">Heslo</label>
          <div class="password-input-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🫣' : '👁' }}
            </button>
          </div>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn-primary full" :disabled="loading">
          {{ loading ? 'Přihlašuji...' : 'Přihlásit se' }}
        </button>
      </form>

      <p class="switch-auth">
        Nemáte účet?
        <router-link to="/register">Registrovat se</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.auth-card {
  background: var(--bg-card);
  padding: 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--border);
}

h1 {
  font-size: 1.75rem;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--accent-green), var(--accent-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 28px;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.field input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 1rem;
}

.password-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrap input {
  padding-right: 48px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  font-size: 1.1rem;
  color: var(--text-secondary);
  padding: 4px;
  line-height: 1;
}

.toggle-password:hover {
  color: var(--text-primary);
}

.field input:focus {
  outline: none;
  border-color: var(--accent-green);
}

.full {
  width: 100%;
  margin-top: 8px;
}

.error {
  color: var(--accent-red);
  font-size: 0.9rem;
}

.switch-auth {
  margin-top: 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.switch-auth a {
  color: var(--accent-green);
  text-decoration: none;
  margin-left: 4px;
}

.switch-auth a:hover {
  text-decoration: underline;
}
</style>
