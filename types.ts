export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g., 0.15 for 15%
}

export interface CompanyInfo {
  name: string;
  address: string;
  vatNumber: string; // 15 digits
  crNumber: string; // Commercial Registration
  contact: string;
  logoUrl?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  time: string;
  type: string;
  seller: CompanyInfo;
  buyer: CompanyInfo;
  items: LineItem[];
  discount: number;
  notes: string;
}

export enum Currency {
  SAR = 'SAR'
}