# Frontend MeetFlow

React 19 + Vite 8. Consulte o [README principal — Deploy](../README.md#deploy) para variáveis, subpasta Apache, build e FileZilla, e o [relatório da auditoria](../AUDITORIA_DEPLOY.md).

```sh
npm install
npm run dev
# Depois de preencher .env.production:
npm run build
npm run preview
```

Caminho público: `/tecti/2026/gpec12/`. Abra o endereço com essa subpasta também no desenvolvimento/preview. As variáveis `VITE_API_URL` e `VITE_GOOGLE_CLIENT_ID` são públicas e resolvidas no build.
