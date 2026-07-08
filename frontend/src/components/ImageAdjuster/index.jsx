import { useRef, useState } from "react";

// Modal para AJUSTAR uma imagem antes de concluir: dá pra dar zoom e arrastar
// para escolher o enquadramento. A prévia mostra exatamente a área que será
// recortada (o "que você vê é o que sai"). Recorta via canvas, sem libs.
//
// Props:
//  - src: data URL da imagem escolhida (precisa ser local/data: para o canvas
//    não ser "tainted"; imagens de URL externa não são ajustáveis por CORS).
//  - aspect: proporção largura/altura do recorte (1 = quadrado).
//  - round: se true, mostra a área de recorte como círculo (avatar).
//  - outputWidth: largura final do recorte em pixels.
//  - onCancel(): fecha sem aplicar.
//  - onConfirm(dataUrl): devolve a imagem recortada.
export default function ImageAdjuster({
  src,
  aspect = 1,
  round = false,
  outputWidth = 512,
  onCancel,
  onConfirm,
}) {
  // Tamanho do "visor" na tela (a proporção casa com o recorte final).
  const vw = round ? 280 : 360;
  const vh = round ? 280 : Math.round(vw / aspect);

  const imgRef = useRef(null);
  const arraste = useRef(null); // { x, y } última posição do ponteiro
  const [nat, setNat] = useState(null); // { w, h } tamanho natural da imagem
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Escala que faz a imagem "cobrir" o visor no zoom 1.
  const escalaBase = nat ? Math.max(vw / nat.w, vh / nat.h) : 1;
  const s = escalaBase * zoom;
  const dw = nat ? nat.w * s : 0;
  const dh = nat ? nat.h * s : 0;

  // Mantém a imagem sempre cobrindo o visor (sem "buracos" nas bordas).
  function limitar(x, y, escala = s) {
    const largura = nat.w * escala;
    const altura = nat.h * escala;
    return {
      x: Math.min(0, Math.max(vw - largura, x)),
      y: Math.min(0, Math.max(vh - altura, y)),
    };
  }

  function aoCarregar(e) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setNat({ w, h });
    const base = Math.max(vw / w, vh / h);
    const dwi = w * base;
    const dhi = h * base;
    // começa centralizado
    setOffset({ x: (vw - dwi) / 2, y: (vh - dhi) / 2 });
    setZoom(1);
  }

  function aoMudarZoom(e) {
    const novoZoom = Number(e.target.value);
    const novaEscala = escalaBase * novoZoom;
    setOffset((o) => limitar(o.x, o.y, novaEscala));
    setZoom(novoZoom);
  }

  function aoPressionar(e) {
    if (!nat) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arraste.current = { x: e.clientX, y: e.clientY };
  }

  function aoMover(e) {
    if (!arraste.current) return;
    const dx = e.clientX - arraste.current.x;
    const dy = e.clientY - arraste.current.y;
    arraste.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => limitar(o.x + dx, o.y + dy));
  }

  function aoSoltar(e) {
    arraste.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ponteiro já liberado: ignora
    }
  }

  function concluir() {
    if (!nat || !imgRef.current) return;
    const ow = outputWidth;
    const oh = round ? outputWidth : Math.round(outputWidth / aspect);

    // Região da imagem original que está aparecendo no visor.
    const sx = -offset.x / s;
    const sy = -offset.y / s;
    const sw = vw / s;
    const sh = vh / s;

    const canvas = document.createElement("canvas");
    canvas.width = ow;
    canvas.height = oh;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, ow, oh);
    onConfirm(canvas.toDataURL("image/jpeg", 0.9));
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40">
        <h2 className="text-lg font-semibold text-white">Ajustar imagem</h2>
        <p className="mt-1 text-sm text-slate-400">
          Arraste para reposicionar e use o controle para dar zoom.
        </p>

        {/* Visor */}
        <div className="mt-5 flex justify-center">
          <div
            onPointerDown={aoPressionar}
            onPointerMove={aoMover}
            onPointerUp={aoSoltar}
            onPointerCancel={aoSoltar}
            style={{ width: vw, height: vh, touchAction: "none" }}
            className={`relative cursor-grab overflow-hidden bg-slate-950 active:cursor-grabbing ${
              round ? "rounded-full" : "rounded-2xl"
            } ring-2 ring-fuchsia-500/40`}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Ajuste"
              onLoad={aoCarregar}
              draggable={false}
              style={{
                position: "absolute",
                left: offset.x,
                top: offset.y,
                width: dw || "auto",
                height: dh || "auto",
                maxWidth: "none",
                userSelect: "none",
              }}
            />
            {/* moldura tênue por cima, só visual */}
            <div
              className={`pointer-events-none absolute inset-0 ${
                round ? "rounded-full" : "rounded-2xl"
              } ring-1 ring-inset ring-white/10`}
            />
          </div>
        </div>

        {/* Zoom */}
        <div className="mt-5 flex items-center gap-3">
          <span className="text-slate-400" aria-hidden>−</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={aoMudarZoom}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-fuchsia-500"
            aria-label="Zoom da imagem"
          />
          <span className="text-slate-400" aria-hidden>+</span>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={concluir}
            className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
