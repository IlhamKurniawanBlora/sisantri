<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'id'
  },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
  ]
})

const { user, logout } = useAuth()
const toast = useToast()

const handleLogout = async () => {
  await logout()
  toast.add({
    title: 'Success',
    description: 'Logged out successfully',
    color: 'success'
  })
  navigateTo('/', { replace: true })
}

// Generate random particles
const particles = ref<Array<{
  id: number
  left: number
  delay: number
  duration: number
  size: number
}>>([])

onMounted(() => {
  particles.value = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 8,
    size: 2 + Math.random() * 4
  }))
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col relative overflow-hidden">
    <!-- Animated Particles Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Gradient Overlays -->
      <div class="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-primary-100/30 via-primary-50/10 to-transparent dark:from-primary-950/40 dark:via-primary-900/20 dark:to-transparent"></div>
      
      <!-- Floating Particles -->
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle absolute bottom-0 rounded-full opacity-0"
        :style="{
          left: `${particle.left}%`,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
        }"
      ></div>
      
      <!-- Additional Glow Effects -->
      <div class="absolute bottom-20 left-1/4 w-64 h-64 bg-primary-400/20 dark:bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-32 right-1/4 w-80 h-80 bg-green-400/15 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse-slower"></div>
    </div>

    <!-- Content -->
    <AppHeader class="relative z-10" />
    <main class="container mx-auto flex-1 px-4 py-6 relative z-10">
      <slot />
    </main>
    <AppFooter class="relative z-10" />
  </div>
</template>

<style scoped>
@keyframes float-up {
  0% {
    transform: translateY(0) translateX(0) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100vh) translateX(calc(var(--drift) * 30px)) scale(1);
    opacity: 0;
  }
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

@keyframes pulse-slower {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.15);
  }
}

.particle {
  --drift: calc(var(--random) - 0.5);
  animation: float-up linear infinite;
  background: radial-gradient(circle, 
    rgb(var(--color-primary-400)) 0%,
    rgb(var(--color-primary-500)) 40%,
    transparent 70%
  );
  box-shadow: 
    0 0 10px rgb(var(--color-primary-400) / 0.6),
    0 0 20px rgb(var(--color-primary-500) / 0.4),
    0 0 30px rgb(var(--color-primary-600) / 0.2);
}

:global(.dark) .particle {
  background: radial-gradient(circle, 
    rgb(var(--color-primary-400)) 0%,
    rgb(var(--color-primary-500)) 40%,
    transparent 70%
  );
  box-shadow: 
    0 0 15px rgb(var(--color-primary-400) / 0.8),
    0 0 25px rgb(var(--color-primary-500) / 0.6),
    0 0 35px rgb(var(--color-primary-600) / 0.4);
}

.particle:nth-child(3n) {
  --random: 0.2;
  background: radial-gradient(circle, 
    rgb(var(--color-green-400)) 0%,
    rgb(var(--color-green-500)) 40%,
    transparent 70%
  );
  box-shadow: 
    0 0 10px rgb(var(--color-green-400) / 0.6),
    0 0 20px rgb(var(--color-green-500) / 0.4);
}

.particle:nth-child(3n+1) {
  --random: 0.8;
  background: radial-gradient(circle, 
    rgb(var(--color-violet-400)) 0%,
    rgb(var(--color-violet-500)) 40%,
    transparent 70%
  );
  box-shadow: 
    0 0 10px rgb(var(--color-violet-400) / 0.6),
    0 0 20px rgb(var(--color-violet-500) / 0.4);
}

.particle:nth-child(5n) {
  --random: 0.5;
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animate-pulse-slower {
  animation: pulse-slower 6s ease-in-out infinite;
}
</style>