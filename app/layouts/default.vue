<script lang="ts" setup>

const menuOpen = ref(false);
</script>

<template>
    <div class="layout">
        <header class="header">
            <div class="container">
                <NuxtLink to="/" class="logo">Sisantri</NuxtLink>

                <nav :class="['nav', { open: menuOpen }]" @click.outside="menuOpen = false"></nav>
            </div>
        </header>
        <main class="main">
            <NuxtPage />
        </main>
        <footer class="footer">
            <div class="container">
                <p>&copy; 2024 Sisantri. All rights reserved.</p>
            </div>
        </footer>
    </div>
</template>
