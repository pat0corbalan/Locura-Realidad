"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message || "No se pudo iniciar sesión.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.18),transparent_55%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/90 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
            <LockKeyhole className="h-8 w-8" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-400">Locura & Realidad</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Acceso administrativo</h1>
          <p className="mt-2 text-sm text-zinc-400">Ingresá tus credenciales para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="usuario" className="text-sm font-medium text-zinc-200">Usuario</label>
            <input
              id="usuario"
              name="usuario"
              autoComplete="username"
              required
              maxLength={120}
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              placeholder="Tu usuario"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-zinc-200">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={200}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              placeholder="Tu contraseña"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !usuario.trim() || !password}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-7 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <LockKeyhole className="h-3.5 w-3.5" />
          Área privada · Acceso exclusivo para administradores
        </p>
      </section>
    </main>
  );
}
