import Header from "../Header";
import "./AuthLayout.css";

// Layout compartilhado das telas de login/cadastro:
// fundo escuro com blobs de luz nas cores da marca + conteúdo centralizado.
export default function AuthLayout({ children, links }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="auth-blob auth-blob-4" />
      </div>

      <div className="relative z-10">
        <Header links={links} />
        <main className="flex min-h-[calc(100vh-67px)] items-center justify-center px-6 py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
