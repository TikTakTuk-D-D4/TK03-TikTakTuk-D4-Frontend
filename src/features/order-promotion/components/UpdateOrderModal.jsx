import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/layout/Card";
import { Button } from "../../../components/ui/layout/Button";
import { Divider } from "../../../components/ui/layout/Divider";
import { Badge } from "../../../components/ui/layout/Badge";

import {
  PAYMENT_STATUS_OPTIONS,
} from "../constants/orderConstants";

import {
  getPaymentStatusLabel,
  getPaymentStatusVariant,
  formatCurrency,
} from "../utils/orderUtils";

export default function UpdateOrderModal({
  isOpen,
  order,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.paymentStatus || "");
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const handleSubmit = () => {
    if (!paymentStatus) return;

    onSubmit?.({
      ...order,
      paymentStatus,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-lg rounded-2xl bg-surface shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text">
            Update Order
          </CardTitle>
        </CardHeader>

        <Divider />

        <CardContent className="space-y-5 pt-4">
          <div className="rounded-2xl bg-gray-50 p-4 space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Order ID
              </p>
              <p className="text-sm font-semibold text-text">
                {order.id || "-"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Customer
                </p>
                <p className="text-sm text-text">
                  {order.customerName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Event
                </p>
                <p className="text-sm text-text">
                  {order.eventTitle || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Total Amount
                </p>
                <p className="text-sm font-semibold text-text">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Status Saat Ini
                </p>
                <div className="mt-1">
                  <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Payment Status
            </label>

            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-text outline-none transition focus:border-blue-500"
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Divider />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !paymentStatus}
            >
              {isLoading ? "Menyimpan..." : "Update"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
