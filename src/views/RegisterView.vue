<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isStrongEnoughPassword } from '@/lib/validation'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  success.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Hesla se neshodují'
    return
  }
  if (!isStrongEnoughPassword(password.value)) {
    error.value = 'Heslo musí mít alespoň 8 znaků'
    return
  }
  loading.value = true
  try {
    await authStore.signUp(email.value, password.value)
    success.value = 'Registrace úspěšná! Zkontrolujte email pro potvrzení.'
    setTimeout(() => router.push('/'), 2000)
  } catch (e: unknown) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Registrace</h1>
      <p class="subtitle">Vytvořte si účet</p>

      <form @submit.prevent="handleRegister" class="auth-form">
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
          <label for="password">Heslo (min. 8 znaků)</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            autocomplete="new-password"
          />
        </div>
        <div class="field">
          <label for="confirm">Potvrdit heslo</label>
          <input
            id="confirm"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            autocomplete="new-password"
          />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>
        <button type="submit" class="btn-primary full" :disabled="loading">
          {{ loading ? 'Registruji...' : 'Registrovat' }}
        </button>
      </form>

      <p class="switch-auth">
        Už máte účet?
        <router-link to="/login">Přihlásit se</router-link>
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

.success {
  color: var(--accent-green);
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
