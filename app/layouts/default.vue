<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'id' },
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
  particles.value = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 8,
    size: 3 + Math.random() * 6
  }))
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col relative overflow-hidden">
    <!-- Floating Particles Background -->
    <div class="particle-container">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          left: `${particle.left}%`,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
        }"
      ></div>
    </div>

    <!-- Gradient Overlays -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-green-100/20 via-green-50/10 to-transparent dark:from-green-950/30 dark:via-green-900/15 dark:to-transparent"></div>
      <div class="absolute bottom-20 left-1/4 w-96 h-96 bg-green-400/15 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-32 right-1/4 w-96 h-96 bg-green-400/10 dark:bg-green-500/8 rounded-full blur-3xl animate-pulse-slower"></div>
    </div>

    <!-- Fixed Header -->
    <AppHeader class="fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm" />    

    <!-- Content (diberi padding top agar tidak ketiban header) -->
    <main class="container mx-auto flex-1 px-4 py-6 relative z-10 pt-24">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter class="relative z-10 mt-auto" />
  </div>
</template>

<style scoped>
.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

@keyframes float-up {
  0% { transform: translateY(0) translateX(0) scale(0.3); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 0.7; }
  100% { transform: translateY(-110vh) translateX(calc(var(--drift) * 80px)) scale(1.2); opacity: 0; }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes pulse-slower {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.15); }
}

.particle {
  position: absolute;
  bottom: -20px;
  border-radius: 50%;
  animation: float-up linear infinite;
  background: radial-gradient(circle,
    rgba(34, 197, 94, 1) 0%,
    rgba(34, 197, 94, 0.9) 20%,
    rgba(34, 197, 94, 0.6) 40%,
    rgba(34, 197, 94, 0.3) 60%,
    transparent 100%
  );
  box-shadow:
    0 0 20px rgba(34, 197, 94, 0.9),
    0 0 40px rgba(34, 197, 94, 0.6),
    0 0 60px rgba(34, 197, 94, 0.3);
  filter: blur(1px);
}

:global(.dark) .particle {
  background: radial-gradient(circle,
    rgba(74, 222, 128, 1) 0%,
    rgba(74, 222, 128, 0.9) 20%,
    rgba(74, 222, 128, 0.6) 40%,
    rgba(74, 222, 128, 0.3) 60%,
    transparent 100%
  );
  box-shadow:
    0 0 25px rgba(74, 222, 128, 1),
    0 0 45px rgba(74, 222, 128, 0.7),
    0 0 65px rgba(74, 222, 128, 0.4);
}

.particle:nth-child(2n) { --drift: 0.6; }
.particle:nth-child(3n) { --drift: -0.4; }
.particle:nth-child(4n) { --drift: 0.3; }
.particle:nth-child(5n) { --drift: -0.6; filter: blur(1.5px); }
.particle:nth-child(7n) { filter: blur(0.5px); }

.animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
.animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
</style>
