export default defineNuxtConfig({
  ssr: true,

  runtimeConfig: {
    // Private keys (only accessible on server)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
    // Bisa kamu gunakan untuk verifikasi atau background job server-side
    // Contoh: dalam server/api routes

    // Public keys (accessible on client)
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_KEY || '', // gunakan konsisten nama ini
    },
  },

  devtools: {
    enabled: true,
  },

  compatibilityDate: '2025-07-15',

  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxtjs/seo',
  ],

  css: ['~/assets/css/main.css'],

  seo: {
    siteName: 'SiDawam',
    siteUrl: 'https://sidawam.vercel.app',
    description:
      'Platform informasi santri modern dengan berita, blog, dan artikel Islami.',
    keywords: ['santri', 'islam', 'blog', 'artikel', 'SiDawam'],
    twitterCard: 'summary_large_image',
    twitterSite: '@SiDawam',
    twitterCreator: '@SiDawam',
    themeColor: '#16a34a',
    language: 'id',
    ogTitle: 'SiDawam - Platform Informasi Santri Modern',
    ogDescription:
      'Berita, blog, dan artikel Islami terkini untuk para santri dan masyarakat.',
    ogImage: '/og-image.png', // letakkan di /public/og-image.png
  },

  app: {
    head: {
      title: 'SiDawam',
      meta: [
        {
          name: 'description',
          content:
            'Platform informasi santri modern dengan berita, blog, dan artikel Islami.',
        },
        {
          name: 'keywords',
          content: 'santri, islam, blog, artikel, SiDawam',
        },
        { name: 'author', content: 'SiDawam Team' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon.png',
        },
      ],
    },
  },
})
