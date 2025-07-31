export default defineNuxtConfig({
    devtools: {enabled: false},
    modules: ["@pinia/nuxt", "nuxt-icon"],
    css: [
        "~/assets/scss/main.scss",
        "~/assets/plugins/global/plugins.bundle.css",
        "~/assets/css/style.bundle.css",
        "primevue/resources/themes/lara-light-blue/theme.css",
        "primevue/resources/primevue.min.css",
        "primeicons/primeicons.css",
        "~/assets/css/style.css",
    ],
    app: {
        head: {
            script: [
                {
                    // bootstrap script cdnjs
                    type: "text/javascript",
                    src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
                },
                {
                    // metronic plugins bundle cdnjs
                    type: "text/javascript",
                    src: "https://preview.keenthemes.com/metronic8/demo32/assets/plugins/global/plugins.bundle.js",
                },
                {
                    // metronic script bundle cdnjs
                    type: "text/javascript",
                    src: "https://preview.keenthemes.com/metronic8/demo32/assets/js/scripts.bundle.js",
                },
            ],
        },
    },
    runtimeConfig: {
        public: {
            backendUrl: process.env.NUXT_BACKEND_URL,
            frontendUrl: process.env.NUXT_FRONTEND_URL,
            oneSignalAppId: process.env.ONE_SIGNAL_APP_ID,
        },
    },
    build: {
        transpile: ['vue-toastification', "primevue", '@vuepic/vue-datepicker'],
    },
    imports: {
        dirs: ["./utils"],
    },
    ssr: false,
    plugins: [{src: '~/plugins/tagify-directive.js'}],
    // allow the ssr only on landing page
    routeRules: {
        "/": {ssr: true},
    }
});
