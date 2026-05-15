import React from "react";
import { useNavigate } from "react-router-dom";
import { ReceiptText, Ticket } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

const emptyCopyByRole = {
  CUSTOMER: {
    icon: Ticket,
    title: "Anda belum membuat pesanan",
    description: "Pesanan akan muncul setelah Anda membeli tiket dari halaman Cari Event.",
    cta: "Jelajahi Event",
    path: "/events",
  },
  ORGANIZER: {
    icon: ReceiptText,
    title: "Belum ada pesanan untuk event Anda",
    description: "Pesanan akan muncul ketika customer membeli tiket dari event yang Anda selenggarakan.",
  },
  ADMIN: {
    icon: ReceiptText,
    title: "Belum ada order di sistem",
    description: "Order akan muncul setelah customer berhasil membuat pesanan tiket.",
  },
};

export default function EmptyOrderState({ role = "CUSTOMER" }) {
  const navigate = useNavigate();
  const copy = emptyCopyByRole[role] || emptyCopyByRole.CUSTOMER;
  const Icon = copy.icon;

  return (
    <Card className="border-line-soft bg-surface text-text shadow-soft">
      <CardContent className="p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-primary shadow-glow">
          <span className="block leading-none text-2xl translate-y-0">
            <Icon size={28} strokeWidth={2.2} />
          </span>
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
