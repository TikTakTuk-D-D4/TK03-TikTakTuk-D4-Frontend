import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, Building2, UserRound } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";

const ROLES = [
  {
    id: "admin",
    label: "Admin",
    helper: "Akses penuh untuk semua modul dan manajemen data.",
    icon: ShieldCheck,
  },
  {
    id: "organizer",
    label: "Organizer",
    helper: "Kelola event sendiri dan kategori tiket sesuai event milikmu.",
    icon: Building2,
  },
  {
    id: "customer",
    label: "Customer",
    helper: "Akses pembacaan data publik dan area customer.",
    icon: UserRound,
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { user, switchRole } = useAuth();
  const [role, setRole] = useState("admin");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    switchRole(role);
    navigate("/dashboard", { replace: true });
  };

  return (
    <section className="min-h-screen grid place-items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-210 rounded-[22px] border border-edge bg-card shadow-card overflow-hidden animate-pop-in">
        <div className="p-6 sm:p-8 lg:p-10 border-b border-edge bg-brand-gradient text-bg">
          <p className="uppercase tracking-[0.16em] text-[11px] font-semibold opacity-90 mb-2">
            TikTakTuk Demo Access
          </p>
          <h1 className="font-display text-[42px] sm:text-5xl leading-[1.03] tracking-tight mb-2.5">
            Login
          </h1>
          <p className="text-sm sm:text-[17px] text-bg/90 max-w-140">
            Pilih role demo untuk masuk ke sistem dan menguji behavior akses modul.
          </p>
        </div>

        <form className="p-6 sm:p-8 lg:p-10" onSubmit={handleSubmit}>
          <div className="grid gap-3">
            {ROLES.map((item) => {
              const Icon = item.icon;
              const active = role === item.id;

              return (
                <label
                  key={item.id}
                  className={[
                    "flex items-start gap-3 rounded-xl border p-4 transition cursor-pointer",
                    active
                      ? "border-primary bg-primary-soft/55 shadow-glow"
                      : "border-edge hover:border-edge-glow hover:bg-bg-soft/55",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="role"
                    value={item.id}
                    className="mt-1 accent-primary"
                    checked={active}
                    onChange={(event) => setRole(event.target.value)}
                  />

                  <div className="h-9 w-9 rounded-lg bg-bg-soft border border-edge grid place-items-center text-primary-hover shrink-0">
                    <Icon size={17} />
                  </div>

                  <div>
                    <p className="font-semibold text-ink">{item.label}</p>
                    <p className="text-sm text-ink-dim mt-0.5">{item.helper}</p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-7 pt-5 border-t border-edge flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Link className="text-sm text-primary hover:text-primary-hover font-medium" to="/ticket-categories">
              Lihat Kategori Tiket (Public)
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link className="text-sm text-ink-dim hover:text-ink" to="/register">
                Register
              </Link>
              <Button type="submit" variant="primary" className="w-full sm:w-auto">
                Masuk Sebagai {ROLES.find((item) => item.id === role)?.label}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
