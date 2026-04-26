import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";
import { Badge } from "../../../components/ui/Badge";

import { PAYMENT_STATUS_OPTIONS } from "../constants/orderConstants";

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
    if (order) setPaymentStatus(order.paymentStatus || "");
  }, [order]);

  if (!isOpen || !order) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose?.();
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-lg border-line bg-surface text-text shadow-glow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.5em] text-accent">
                Admin Action
              </p>

              <CardTitle className="mt-2 font-display text-lg font-semibold text-text">
                Update Order
              </CardTitle>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xl leading-none text-muted transition hover:text-text"
            >
              ×
            </button>
          </div>
        </CardHeader>

        <Divider />

        <CardContent className="space-y-5 pt-4">
          <div className="rounded-[14px] border border-line-soft bg-surface-2 p-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.5em] text-muted">
                Order ID
              </p>

              <p className="mt-1 font-mono text-xs text-accent">
                {order.id || "-"}
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted">Customer</p>
                <p className="mt-1 text-sm font-medium text-text">
                  {order.customerName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Event</p>
                <p className="mt-1 text-sm font-medium text-text">
                  {order.eventTitle || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Total Amount</p>
                <p className="mt-1 text-sm font-semibold text-text">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Status Saat Ini</p>
                <div className="mt-2">
                  <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              Payment Status
            </label>

            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="h-11 w-full rounded-[10px] border border-line-soft bg-white/[0.02] px-3 text-sm text-text outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-surface text-text"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Divider />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="border border-line-soft bg-white/[0.03] hover:border-line hover:bg-white/[0.07]"
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
