/**
 * Generates a TLV (Tag-Length-Value) encoded string specifically for ZATCA (Fatoora) QR Codes.
 * 
 * Tags:
 * 1. Seller Name
 * 2. VAT Registration Number
 * 3. Timestamp (YYYY-MM-DDTHH:mm:ssZ)
 * 4. Invoice Total (with VAT)
 * 5. VAT Total
 */
export const generateZatcaBase64 = (
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  invoiceTotal: string,
  vatTotal: string
): string => {
  const getBytes = (tag: number, value: string): Uint8Array => {
    const encoder = new TextEncoder();
    const valBytes = encoder.encode(value);
    const length = valBytes.length;
    
    const result = new Uint8Array(2 + length);
    result[0] = tag;
    result[1] = length;
    result.set(valBytes, 2);
    return result;
  };

  const tag1 = getBytes(1, sellerName);
  const tag2 = getBytes(2, vatNumber);
  const tag3 = getBytes(3, timestamp);
  const tag4 = getBytes(4, invoiceTotal);
  const tag5 = getBytes(5, vatTotal);

  // Concatenate all tags
  const totalLength = tag1.length + tag2.length + tag3.length + tag4.length + tag5.length;
  const allBytes = new Uint8Array(totalLength);
  
  let offset = 0;
  allBytes.set(tag1, offset); offset += tag1.length;
  allBytes.set(tag2, offset); offset += tag2.length;
  allBytes.set(tag3, offset); offset += tag3.length;
  allBytes.set(tag4, offset); offset += tag4.length;
  allBytes.set(tag5, offset); offset += tag5.length;

  // Convert Uint8Array to Base64 string
  let binary = '';
  const len = allBytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(allBytes[i]);
  }
  return btoa(binary);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};