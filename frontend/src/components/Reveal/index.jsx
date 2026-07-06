import { useEffect, useRef, useState } from "react";

// Revela o conteúdo com um leve fade/subida quando ele entra na tela (scroll).
export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            setVisivel(true);
            observador.unobserve(entrada.target);
          }
        });
      },
      // ignora a faixa de baixo da tela: só dispara quando o elemento
      // realmente entra na área visível (evita animar na hora do load)
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visivel ? "reveal-visivel" : ""} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
