export type CustomerType = 'Member' | 'Consumer';

export interface OtherOption {
  value: number;
  label: string;
  id: string;
}

export interface BillingRecord {
  id: string; // Auto-populated: "000", "001", "002"
  customerName: string;
  billingNumber: string; // Meter Number
  address: string;
  lateral: string;
  customerType: CustomerType;
  previousReading: number;
  presentReading: number;
  consumed: number; // present - previous
  others: number[]; // Array of selected values (e.g. [-10, -100, 0])
  basePayable: number; // Standard charge based on consumption
  totalPayable: number; // Base + sum(others)
  createdAt: string; // ISO date string
}
