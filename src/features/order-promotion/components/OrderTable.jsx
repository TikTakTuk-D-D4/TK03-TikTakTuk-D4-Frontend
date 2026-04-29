import React from "react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

import {
  formatCurrency,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
} from "../utils/orderUtils";

function formatDateTime(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function OrderTable({
  orders = [],
  role = "CUSTOMER",
  isAdmin = false,
  onEdit,
  onDelete,
  emptyMessage = "Belum ada data order.",
}) {
  const showCustomerColumn = role !== "CUSTOMER";

  if (!orders.length) {
    return (
      <div className="rounded-[16px] border border-dashed border-line-soft bg-surface p-8 text-center text-muted shadow-soft">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-line-soft bg-surface text-text shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-[11px] uppercase tracking-[0.4px] text-muted">
              <th className="px-4 py-3 font-medium">Order ID</th>

              {showCustomerColumn && (
                <th className="px-4 py-3 font-medium">Pelanggan</th>
              )}

              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>

              {isAdmin && (
                <th className="px-4 py-3 text-right font-medium">Action</th>
              )}
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const statusVariant = getPaymentStatusVariant(order.paymentStatus);
              const statusLabel = getPaymentStatusLabel(order.paymentStatus);

              return (
                <tr
                  key={order.id}
                  className="border-b border-white/5 transition last:border-b-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4 font-mono text-xs text-accent">
                    {order.id}
                  </td>

                  {showCustomerColumn && (
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-[10px] bg-primary/20 text-[10px] font-semibold text-accent">
                          {getInitials(order.customerName)}
                        </div>
                        <span className="text-sm text-text">
                          {order.customerName || "-"}
                        </span>
                      </div>
                    </td>
                  )}

                  <td className="px-4 py-4 text-muted">
                    {formatDateTime(order.orderDate)}
                  </td>

                  <td className="px-4 py-4">
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                  </td>

                  <td className="px-4 py-4 text-right font-semibold text-text">
                    {formatCurrency(order.totalAmount)}
                  </td>

                  {isAdmin && (
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit?.(order)}
                          className="border border-line-soft bg-white/[0.03] text-muted hover:border-line hover:bg-white/[0.07] hover:text-text"
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => onDelete?.(order)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
