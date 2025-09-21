export default defineNuxtConfig({
  ssr: true,
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_KEY || '',
    },
    // Server-only key (service role) for server-side operations
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || ''
  },

  devtools: {
    enabled: true,
  },

  compatibilityDate: '2025-07-15',

  modules: ['@nuxt/ui', '@nuxt/image', '@nuxtjs/seo'],

  css: [
    '~/assets/css/main.css',
  ],

  // SEO default config
  seo: {
    siteName: 'Sisantri',
    siteUrl: 'https://sisantri.com',
    description: 'Platform informasi santri modern dengan berita, blog, dan artikel Islami.',
    keywords: ['santri', 'islam', 'blog', 'artikel', 'sisantri'],
    twitterCard: 'summary_large_image',
    twitterSite: '@sisantri',
    twitterCreator: '@sisantri',
    themeColor: '#16a34a',
    language: 'id'
  },

  app: {
    head: {
      title: 'Sisantri',
      meta: [
        { name: 'description', content: 'Platform informasi santri modern dengan berita, blog, dan artikel Islami.' },
        { name: 'keywords', content: 'santri, islam, blog, artikel, sisantri' },
        { name: 'author', content: 'Sisantri Team' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ]
    }
  }
  
})
