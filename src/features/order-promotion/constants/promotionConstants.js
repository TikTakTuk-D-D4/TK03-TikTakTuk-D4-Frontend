export const DISCOUNT_TYPE = {
  PERCENTAGE: "PERCENTAGE",
  NOMINAL: "NOMINAL",
};

export const DISCOUNT_TYPE_OPTIONS = [
  { label: "Persentase", value: DISCOUNT_TYPE.PERCENTAGE },
  { label: "Nominal", value: DISCOUNT_TYPE.NOMINAL },
];

export const PROMOTION_STATUS = {
  ACTIVE: "ACTIVE",
  SCHEDULED: "SCHEDULED",
  EXPIRED: "EXPIRED",
  EXHAUSTED: "EXHAUSTED",
  UNKNOWN: "UNKNOWN",
};

export const PROMOTION_STATUS_OPTIONS = [
  { label: "Semua Status", value: "ALL" },
  { label: "Aktif", value: PROMOTION_STATUS.ACTIVE },
  { label: "Terjadwal", value: PROMOTION_STATUS.SCHEDULED },
  { label: "Berakhir", value: PROMOTION_STATUS.EXPIRED },
  { label: "Habis", value: PROMOTION_STATUS.EXHAUSTED },
];

export const PROMOTION_FILTER_OPTIONS = [
  { label: "Semua Tipe", value: "ALL" },
  ...DISCOUNT_TYPE_OPTIONS,
];

export const PROMOTION_SORT = {
  CODE_ASC: "CODE_ASC",
  CODE_DESC: "CODE_DESC",
  START_DATE_ASC: "START_DATE_ASC",
  START_DATE_DESC: "START_DATE_DESC",
  END_DATE_ASC: "END_DATE_ASC",
  END_DATE_DESC: "END_DATE_DESC",
};
