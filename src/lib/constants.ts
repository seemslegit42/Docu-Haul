
export const DOCUMENT_TYPES = {
  NVIS: 'NVIS',
  BILL_OF_SALE: 'BillOfSale',
} as const;

export const SMART_DOCS_OPTIONS = [
  { value: DOCUMENT_TYPES.NVIS, label: "NVIS Certificate" },
  { value: DOCUMENT_TYPES.BILL_OF_SALE, label: "Bill of Sale" },
];

export const COMPLIANCE_CHECK_DOC_TYPES = [
  { value: "VIN Label", label: "VIN Label" },
  { value: "NVIS Certificate", label: "NVIS Certificate" },
  { value: "Bill of Sale", label: "Bill of Sale" },
  { value: "Other Vehicle Document", label: "Other Related Document" },
];
