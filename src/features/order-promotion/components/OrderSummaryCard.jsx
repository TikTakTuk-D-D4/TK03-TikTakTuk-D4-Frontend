import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";

import {
  calculateOrderTotal,
  formatCurrency,
} from "../utils/orderUtils";

export default function OrderSummaryCard({
  price = 0,
  quantity = 0,
  promo = null,
  serviceFee = 0,
  onCheckout,
  isLoading = false,
}) {
  const { subtotal, discount, total } = calculateOrderTotal({
    price,
    quantity,
    promo,
    serviceFee,
  });

  return (
    <Card className="w-full border-line-soft bg-surface text-text shadow-soft">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-text">
          Ringkasan Pesanan
        </CardTitle>
      </CardHeader>

      <Divider />

      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Harga x {quantity}</span>
          <span className="font-medium text-text">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Biaya Layanan</span>
          <span className="font-medium text-text">
            {formatCurrency(serviceFee)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Diskon</span>
            <span className="font-medium text-ok">
              - {formatCurrency(discount)}
            </span>
          </div>
        )}

        {promo && (
          <div className="rounded-[10px] border border-line bg-primary/15 px-3 py-2 text-xs text-accent">
            Promo aktif: {promo.promoCode}
          </div>
        )}

        <Divider />

        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-text">Total</span>
          <span className="font-display text-xl font-bold text-text">
            {formatCurrency(total)}
          </span>
        </div>

        <Button
          size="lg"
          fullWidth
          onClick={onCheckout}
          disabled={isLoading || quantity <= 0}
          className="shadow-glow from-primary to-accent hover:from-surface-2 hover:to-surface-2"
        >
          {isLoading ? "Memproses..." : "Bayar Sekarang"}
        </Button>

        <p className="text-center text-xs text-muted">
          Konfirmasi tiket akan dikirim setelah pembayaran berhasil.
        </p>
      </CardContent>
    </Card>
  ); 
}
