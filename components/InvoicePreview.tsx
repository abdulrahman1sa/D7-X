import React, { useMemo } from 'react';
import QRCode from 'react-qr-code';
import { InvoiceData } from '../types';
import { generateZatcaBase64, formatCurrency } from '../utils/zatca';

interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  // Calculations
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalTax = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate), 0);
  const total = subtotal + totalTax - (data.discount || 0);

  // Generate QR Code Data (ZATCA TLV)
  const qrCodeData = useMemo(() => {
    // Format timestamp as needed by some readers, ideally ISO8601
    const dateTime = `${data.date}T${data.time}:00Z`; 
    return generateZatcaBase64(
      data.seller.name,
      data.seller.vatNumber,
      dateTime,
      total.toFixed(2),
      totalTax.toFixed(2)
    );
  }, [data.seller.name, data.seller.vatNumber, data.date, data.time, total, totalTax]);

  return (
    <div className="print-area bg-white p-8 w-full max-w-[210mm] min-h-[297mm] mx-auto shadow-lg text-black text-sm relative box-border print:shadow-none print:w-full print:max-w-none print:min-h-0 print:h-auto print:rounded-none">
      
      {/* Header Section */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
        <div className="w-1/3 text-right">
          {data.seller.logoUrl ? (
             <img src={data.seller.logoUrl} alt="Logo" className="h-24 object-contain mb-2" />
          ) : (
            <div className="h-24 w-24 bg-gray-100 flex items-center justify-center text-gray-400 mb-2 border">
              شعار الشركة
            </div>
          )}
          <h1 className="font-bold text-lg text-blue-900">{data.seller.name}</h1>
        </div>

        <div className="w-1/3 text-center pt-4">
           <h2 className="text-2xl font-bold mb-1">فاتورة ضريبية</h2>
           <p className="text-gray-500 uppercase tracking-widest text-xs">Tax Invoice</p>
        </div>
        
        <div className="w-1/3 text-left dir-ltr flex flex-col items-end">
           <div className="text-right">
            <p className="font-bold">رقم السجل التجاري: <span className="font-normal">{data.seller.crNumber}</span></p>
            <p className="font-bold">الرقم الضريبي: <span className="font-normal">{data.seller.vatNumber}</span></p>
            <p className="font-bold whitespace-pre-wrap text-xs mt-1 text-gray-600">{data.seller.address}</p>
            <p className="font-bold text-xs mt-1">{data.seller.contact}</p>
           </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Right Side: Customer */}
        <div className="border border-gray-300 rounded p-4">
          <h3 className="font-bold text-blue-900 mb-2 border-b pb-1">العميل / Bill To</h3>
          <div className="grid grid-cols-[100px_1fr] gap-y-1">
             <span className="text-gray-600">الاسم:</span>
             <span className="font-bold">{data.buyer.name}</span>
             
             <span className="text-gray-600">الرقم الضريبي:</span>
             <span>{data.buyer.vatNumber}</span>
             
             <span className="text-gray-600">العنوان:</span>
             <span>{data.buyer.address}</span>
          </div>
        </div>

        {/* Left Side: Invoice Details + QR */}
        <div className="flex gap-4">
           <div className="flex-1 border border-gray-300 rounded p-4">
             <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-right">
                <span className="text-gray-600">رقم الفاتورة:</span>
                <span className="font-bold dir-ltr text-right">{data.invoiceNumber}</span>
                
                <span className="text-gray-600">التاريخ:</span>
                <span className="dir-ltr text-right">{data.date}</span>

                <span className="text-gray-600">الوقت:</span>
                <span className="dir-ltr text-right">{data.time}</span>
             </div>
           </div>
           <div className="w-[120px] flex items-center justify-center">
              <QRCode value={qrCodeData} size={110} />
           </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300 text-center">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border border-gray-300 p-2 w-12">#</th>
              <th className="border border-gray-300 p-2 text-right">وصف الخدمة / المنتجات</th>
              <th className="border border-gray-300 p-2 w-20">الكمية</th>
              <th className="border border-gray-300 p-2 w-24">سعر الوحدة</th>
              <th className="border border-gray-300 p-2 w-20">نسبة الضريبة</th>
              <th className="border border-gray-300 p-2 w-24">الضريبة</th>
              <th className="border border-gray-300 p-2 w-28">الاجمالي</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => {
              const lineTotal = item.quantity * item.unitPrice;
              const lineTax = lineTotal * item.taxRate;
              const lineGross = lineTotal + lineTax;
              
              return (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2 text-right font-medium">{item.description}</td>
                  <td className="border border-gray-300 p-2">{item.quantity}</td>
                  <td className="border border-gray-300 p-2">{formatCurrency(item.unitPrice)}</td>
                  <td className="border border-gray-300 p-2">{(item.taxRate * 100).toFixed(0)}%</td>
                  <td className="border border-gray-300 p-2 text-gray-600">{formatCurrency(lineTax)}</td>
                  <td className="border border-gray-300 p-2 font-bold">{formatCurrency(lineGross)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end break-inside-avoid">
        <div className="w-1/2">
           <div className="border border-gray-300 rounded overflow-hidden">
             <div className="flex justify-between p-2 border-b border-gray-300 bg-gray-50 text-black">
               <span>صافي قيمة الأعمال (Subtotal)</span>
               <span className="font-bold">{formatCurrency(subtotal)} ريال</span>
             </div>
             {data.discount > 0 && (
                <div className="flex justify-between p-2 border-b border-gray-300 text-red-600">
                  <span>الخصومات (Discount)</span>
                  <span>- {formatCurrency(data.discount)} ريال</span>
                </div>
             )}
             <div className="flex justify-between p-2 border-b border-gray-300 bg-gray-50 text-black">
               <span>ضريبة القيمة المضافة (VAT 15%)</span>
               <span className="font-bold">{formatCurrency(totalTax)} ريال</span>
             </div>
             <div className="flex justify-between p-3 bg-blue-900 text-white text-lg">
               <span className="font-bold">اجمالي الفاتورة (Total)</span>
               <span className="font-bold">{formatCurrency(total)} ريال</span>
             </div>
           </div>
        </div>
      </div>
      
      {/* Footer / Notes */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-gray-500 text-xs flex justify-between break-inside-avoid">
        <div>
          {data.notes && <p className="mb-2"><strong>ملاحظات:</strong> {data.notes}</p>}
          <p>تم اصدار هذه الفاتورة الكترونياً وهي معتمدة من هيئة الزكاة والضريبة والجمارك.</p>
        </div>
        <div className="text-left">
           <p>Page 1 of 1</p>
        </div>
      </div>

    </div>
  );
};

export default InvoicePreview;