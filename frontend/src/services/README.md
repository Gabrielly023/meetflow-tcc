# Camada de serviços — backend real × localStorage

Esta pasta concentra **todo** o acesso a dados do app. As páginas e
componentes nunca falam com `localStorage` nem com `axios` direto: eles só
chamam funções daqui. Isso permite trocar o "backend falso" pelo backend real
**sem tocar nas telas**.

## Como funciona o interruptor

Em [`config.js`](./config.js) há um objeto de flags:

```js
export const USE_API = {
  usuarios: true,   // já usa o backend real
  eventos: false,
  playlists: false,
  galeria: false,
  chat: false,
};
```

Cada função "pública" dos serviços começa com um guard:

```js
export function listarEventos() {
  if (USE_API.eventos) return eventoApi.listarEventos(); // backend real
  /* ...código do localStorage (padrão de hoje)... */
}
```

Com a flag em `false`, roda o localStorage — **exatamente como hoje**. Com
`true`, roda a versão Axios (arquivos `*Api.js`).

## Arquivos

| Arquivo | Papel |
|---|---|
| `config.js` | flags `USE_API` + instância do Axios (com token JWT) |
| `adapters.js` | traduz JSON do backend ↔ formato do front |
| `eventoService.js` · `playlistService.js` · `galeriaService.js` | mock (localStorage) + guard |
| `eventoApi.js` · `musicaApi.js` · `galeriaApi.js` · `chatApi.js` | implementação real (Axios) |

## Passo a passo para ligar uma entidade (ex.: eventos)

1. A dupla do backend entrega as rotas de eventos (ver
   `../../CONTRATO_API_FRONTEND.md`).
2. Vire `USE_API.eventos = true` em `config.js`.
3. **Ajuste as páginas dessa entidade para `async/await`** (ver aviso abaixo).
4. Teste. Se algo do JSON não bater, ajuste só o `adapters.js`.

## ⚠️ O único custo real: síncrono → assíncrono

As funções do localStorage são **síncronas** (devolvem o dado na hora). As da
API são **assíncronas** (devolvem `Promise`). Então, ao virar uma flag, as
telas que usam aquela entidade precisam passar a esperar o resultado:

```jsx
// ANTES (mock síncrono)
const eventos = listarEventos();

// DEPOIS (API assíncrona)
const [eventos, setEventos] = useState([]);
useEffect(() => {
  listarEventos().then(setEventos);
}, []);
```

Por isso, **migre uma entidade de cada vez** e teste as páginas dela antes de
seguir para a próxima. Comece pelos **eventos** (destrava as demais).

> Dica: `buscarEventoPorId` é usado internamente por `galeriaService` e
> `playlistService`. Ao ligar `eventos`, prefira ligar/testar essas telas
> juntas para não misturar retorno síncrono com Promise.
