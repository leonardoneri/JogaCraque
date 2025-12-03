/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string
    readonly GEMINI_API_KEY: string
    // Adicione mais variáveis de ambiente aqui conforme necessário
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
