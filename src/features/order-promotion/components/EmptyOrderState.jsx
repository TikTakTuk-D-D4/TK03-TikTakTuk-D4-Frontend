import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

const emptyCopyByRole = {
  CUSTOMER: {
    icon: "🎫",
    title: "Anda belum membuat pesanan",
    description: "Pesanan akan muncul setelah Anda membeli tiket dari halaman Cari Event.",
    cta: "Jelajahi Event",
    path: "/events",
  },
  ORGANIZER: {
    icon: "🧾",
    title: "Belum ada pesanan untuk event Anda",
    description: "Pesanan akan muncul ketika customer membeli tiket dari event yang Anda selenggarakan.",
  },
  ADMIN: {
    icon: "🧾",
    title: "Belum ada order di sistem",
    description: "Order akan muncul setelah customer berhasil membuat pesanan tiket.",
  },
};

export default function EmptyOrderState({ role = "CUSTOMER" }) {
  const navigate = useNavigate();
  const copy = emptyCopyByRole[role] || emptyCopyByRole.CUSTOMER;

  return (
    <Card className="border-line-soft bg-surface text-text shadow-soft">
      <CardContent className="p-8 text-center sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[18px] bg-primary text-2xl shadow-glow">
          {copy.icon}
        </div>
        <h3 className="mt-5 font-display text-2xl font-semibold text-text">
          {copy.title}
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted">
          {copy.description}
        </p>
        {copy.cta && copy.path ? (
          <div className="mt-6">
            <Button onClick={() => navigate(copy.path)}>{copy.cta}</Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
