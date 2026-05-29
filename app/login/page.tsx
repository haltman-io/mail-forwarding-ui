import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 14%, rgba(48, 209, 88, 0.10), transparent 28%),
              radial-gradient(circle at 18% 22%, rgba(48, 209, 88, 0.05), transparent 20%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 18%)
            `,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(48,209,88,0.24)] to-transparent" />
        <div className="absolute left-1/2 top-20 h-52 w-52 -translate-x-1/2 rounded-full bg-[rgba(48,209,88,0.08)] blur-[120px]" />
      </div>

      <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 py-16 sm:px-6">
        <LoginForm className="w-full max-w-[400px]" />
      </div>
    </main>
  );
}
