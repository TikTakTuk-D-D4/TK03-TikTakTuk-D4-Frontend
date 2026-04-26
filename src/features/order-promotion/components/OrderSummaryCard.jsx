import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/layout/Card";
import { Button } from "../../../components/ui/layout/Button";
import { Divider } from "../../../components/ui/layout/Divider";

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
    <Card className="w-full rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text">
          Ringkasan Pesanan
        </CardTitle>
      </CardHeader>

      <Divider />

      <CardContent className="space-y-4 pt-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Harga x {quantity}
          </span>
          <span className="font-medium text-text">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Service Fee */}
        {serviceFee > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Biaya Layanan</span>
            <span className="font-medium text-text">
              {formatCurrency(serviceFee)}
            </span>
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Diskon</span>
            <span className="font-medium text-green-600">
              - {formatCurrency(discount)}
            </span>
          </div>
        )}

        <Divider />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-text">
            Total
          </span>
          <span className="text-base font-bold text-text">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Button */}
        <Button
          size="lg"
          fullWidth
          onClick={onCheckout}
          disabled={isLoading || quantity <= 0}
        >
          {isLoading ? "Memproses..." : "Bayar Sekarang"}
        </Button>
      </CardContent>
    </Card>
  );
}
