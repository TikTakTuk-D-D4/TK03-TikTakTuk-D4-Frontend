export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED"
};

export const PAYMENT_STATUS_OPTIONS = [
  { label: "Pending", value: PAYMENT_STATUS.PENDING },
  { label: "Lunas", value: PAYMENT_STATUS.PAID },
  { label: "Dibatalkan", value: PAYMENT_STATUS.CANCELLED },
];

export const ORDER_FILTER_OPTIONS = [
  { label: "Semua Status", value: "ALL" },
  { label: "Pending", value: PAYMENT_STATUS.PENDING },
  { label: "Lunas", value: PAYMENT_STATUS.PAID },
  { label: "Dibatalkan", value: PAYMENT_STATUS.CANCELLED},
];

export const MAX_TICKETS_PER_TRANSACTION = 10;
export const DEFAULT_SERVICE_FEE = 0; 

export const SEATING_TYPE = {
  RESERVED: "RESERVED",
  FREE: "FREE",
};

export const ORDER_SORT = {
  NEWEST: "NEWEST",
  OLDEST: "OLDEST",
  HIGHEST_TOTAL: "HIGHEST_TOTAL",
  LOWEST_TOTAL: "LOWEST_TOTAL",
}
