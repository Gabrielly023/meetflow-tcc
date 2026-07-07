import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

// Player global persistente do site.
// O <iframe> do Spotify é montado dentro da SideBar (que agora é um layout
// único, não recriado ao navegar). Assim a música continua tocando enquanto
// o usuário anda pelo site. Usamos a "Spotify iFrame API" para tocar com 1 clique.

const PlayerContext = createContext(null);

// Hook para as páginas dispararem/controlarem o player.
// eslint-disable-next-line react-refresh/only-export-components
export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
  const [aberto, setAberto] = useState(false);
  const [origem, setOrigem] = useState(null); // nome do evento de onde veio
  const apiRef = useRef(null); // a IFrameAPI, quando o script carrega
  const hostElRef = useRef(null); // div (na sidebar) que hospeda o player
  const controllerRef = useRef(null); // controller da iFrame API (quando pronto)
  const prontoRef = useRef(false);
  const criandoRef = useRef(false);
  const pendenteRef = useRef(null); // URI aguardando o controller ficar pronto

  // Carrega e toca uma URI. O play() logo após o loadUri às vezes chega antes
  // de o embed terminar de carregar, então tentamos algumas vezes.
  const reproduzir = useCallback((uri) => {
    const c = controllerRef.current;
    if (!c) return;
    c.loadUri(uri);
    const tentar = () => {
      try {
        c.play();
      } catch {
        // ainda carregando; as próximas tentativas resolvem
      }
    };
    tentar();
    window.setTimeout(tentar, 350);
    window.setTimeout(tentar, 900);
  }, []);

  // Cria o controller quando já temos a API E o elemento host disponíveis.
  const tentarCriar = useCallback(() => {
    if (controllerRef.current || criandoRef.current) return;
    const IFrameAPI = apiRef.current;
    const host = hostElRef.current;
    if (!IFrameAPI || !host) return;
    criandoRef.current = true;

    // O Spotify SUBSTITUI o elemento passado por um <iframe> dele. Por isso
    // usamos um filho "solto" (que o React não conhece), evitando que o React
    // tente reconciliar/remover o iframe ao re-renderizar a sidebar.
    const inner = document.createElement("div");
    host.appendChild(inner);

    IFrameAPI.createController(
      inner,
      { width: 300, height: 440, uri: pendenteRef.current || "" },
      (controller) => {
        controllerRef.current = controller;
        prontoRef.current = true;
        if (pendenteRef.current) {
          reproduzir(pendenteRef.current);
          pendenteRef.current = null;
        }
      },
    );
  }, [reproduzir]);

  // Callback ref usada pela SideBar para registrar/desregistrar o host do player.
  const registrarHost = useCallback(
    (el) => {
      hostElRef.current = el;
      if (el) {
        tentarCriar();
      } else {
        // A sidebar saiu (rota sem layout): o iframe foi removido junto.
        // Zera para recriar quando a sidebar voltar.
        controllerRef.current = null;
        prontoRef.current = false;
        criandoRef.current = false;
      }
    },
    [tentarCriar],
  );

  // Carrega o script da iFrame API uma vez.
  useEffect(() => {
    if (window.SpotifyIframeApi) {
      apiRef.current = window.SpotifyIframeApi;
      tentarCriar();
      return;
    }
    const anterior = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      window.SpotifyIframeApi = IFrameAPI;
      apiRef.current = IFrameAPI;
      if (typeof anterior === "function") anterior(IFrameAPI);
      tentarCriar();
    };
    if (!document.getElementById("spotify-iframe-api")) {
      const s = document.createElement("script");
      s.id = "spotify-iframe-api";
      s.src = "https://open.spotify.com/embed/iframe-api/v1";
      s.async = true;
      document.body.appendChild(s);
    }
  }, [tentarCriar]);

  // Toca uma URI do Spotify (ex.: "spotify:playlist:ID" ou "spotify:track:ID").
  // `nomeEvento` (opcional) aparece no player como "de qual evento" veio.
  const tocar = useCallback(
    (uri, nomeEvento) => {
      if (!uri) return;
      setOrigem(nomeEvento || null);
      setAberto(true);
      if (prontoRef.current && controllerRef.current) {
        reproduzir(uri);
      } else {
        pendenteRef.current = uri;
      }
    },
    [reproduzir],
  );

  const fechar = useCallback(() => {
    setAberto(false);
    if (controllerRef.current) {
      try {
        controllerRef.current.pause();
      } catch {
        // alguns estados do player não permitem pause; tudo bem
      }
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{ tocar, fechar, aberto, origem, registrarHost }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
