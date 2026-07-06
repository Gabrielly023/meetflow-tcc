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
      { threshold: 0.15 },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visivel ? "reveal-visivel" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
