import LoginForm from "@/components/admin/login-form";

export const metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-ink">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-xl tracking-[0.08em] mb-2">
            CHOCOLATE <span className="text-gold">COM PIMENTA</span>
          </p>
          <p className="text-mist text-sm">Painel administrativo</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
