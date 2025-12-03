import React, { useState, useEffect } from 'react';
import { InvoiceData, LineItem } from '../types';
import { Plus, Trash2, Upload, X, Loader2 } from 'lucide-react';

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onImageUpload: (file: File) => void;
  isAnalyzing: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ data, onChange, onImageUpload, isAnalyzing }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup URL object when component unmounts or preview changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSellerChange = (field: string, value: string) => {
    onChange({ ...data, seller: { ...data.seller, [field]: value } });
  };

  const handleBuyerChange = (field: string, value: string) => {
    onChange({ ...data, buyer: { ...data.buyer, [field]: value } });
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    const newItems = data.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: 'خدمة جديدة',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0.15
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(i => i.id !== id) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
  };

  const inputClass = "block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white placeholder-gray-400";

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-8 text-gray-900">
      
      {/* AI Upload Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
           ✨ تعبئة تلقائية بالذكاء الاصطناعي
        </h3>
        <p className="text-sm text-blue-600 mb-3">
          ارفع صورة لفاتورة قديمة وسيتم استخراج البيانات وتعبئتها تلقائياً.
        </p>
        
        {previewUrl ? (
          <div className="relative mb-3 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
            <img 
              src={previewUrl} 
              alt="Invoice Preview" 
              className="w-full h-auto max-h-64 object-contain mx-auto"
            />
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <Loader2 className="animate-spin mb-2" size={32} />
                <span className="text-sm font-medium">جاري التحليل...</span>
              </div>
            )}

            {!isAnalyzing && (
              <button 
                onClick={clearPreview}
                className="absolute top-2 right-2 bg-white/80 text-gray-700 p-1.5 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm"
                title="حذف الصورة"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <label className={`flex items-center gap-2 bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded cursor-pointer hover:bg-blue-50 transition ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={18} />
              <span>{isAnalyzing ? 'جاري التحليل...' : 'رفع صورة فاتورة'}</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isAnalyzing} />
            </label>
          </div>
        )}
      </div>

      {/* Invoice Details */}
      <section>
        <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-700">بيانات الفاتورة</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">رقم الفاتورة</label>
            <input type="text" value={data.invoiceNumber} onChange={(e) => onChange({...data, invoiceNumber: e.target.value})} className={`mt-1 ${inputClass}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">نوع الفاتورة</label>
            <input type="text" value={data.type} onChange={(e) => onChange({...data, type: e.target.value})} className={`mt-1 ${inputClass}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">التاريخ (ميلادي)</label>
            <input type="date" value={data.date} onChange={(e) => onChange({...data, date: e.target.value})} className={`mt-1 ${inputClass}`} />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">الوقت</label>
            <input type="time" value={data.time} onChange={(e) => onChange({...data, time: e.target.value})} className={`mt-1 ${inputClass}`} />
          </div>
        </div>
      </section>

      {/* Seller Details */}
      <section>
        <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-700">المورد (البائع)</h3>
        <div className="grid grid-cols-1 gap-4">
          <input type="text" placeholder="اسم المنشأة" value={data.seller.name} onChange={(e) => handleSellerChange('name', e.target.value)} className={inputClass} />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="الرقم الضريبي (15 رقم)" value={data.seller.vatNumber} onChange={(e) => handleSellerChange('vatNumber', e.target.value)} className={inputClass} />
            <input type="text" placeholder="رقم السجل التجاري" value={data.seller.crNumber} onChange={(e) => handleSellerChange('crNumber', e.target.value)} className={inputClass} />
          </div>
          <textarea placeholder="العنوان" value={data.seller.address} onChange={(e) => handleSellerChange('address', e.target.value)} className={`${inputClass} h-20`} />
          <input type="text" placeholder="رابط الشعار (URL)" value={data.seller.logoUrl || ''} onChange={(e) => handleSellerChange('logoUrl', e.target.value)} className={`${inputClass} text-left dir-ltr`} />
        </div>
      </section>

      {/* Buyer Details */}
      <section>
        <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-700">العميل (المشتري)</h3>
        <div className="grid grid-cols-1 gap-4">
          <input type="text" placeholder="اسم العميل / الشركة" value={data.buyer.name} onChange={(e) => handleBuyerChange('name', e.target.value)} className={inputClass} />
          <input type="text" placeholder="الرقم الضريبي (اختياري)" value={data.buyer.vatNumber} onChange={(e) => handleBuyerChange('vatNumber', e.target.value)} className={inputClass} />
          <textarea placeholder="العنوان" value={data.buyer.address} onChange={(e) => handleBuyerChange('address', e.target.value)} className={`${inputClass} h-16`} />
        </div>
      </section>

      {/* Line Items */}
      <section>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-bold text-gray-700">المنتجات / الخدمات</h3>
          <button onClick={addItem} className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            <Plus size={16} /> إضافة
          </button>
        </div>
        
        <div className="space-y-3">
          {data.items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_80px_100px_40px] gap-2 items-start border p-2 rounded bg-gray-50">
               <div>
                  <label className="text-xs text-gray-500">الوصف</label>
                  <input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className={`${inputClass} p-1`} />
               </div>
               <div>
                  <label className="text-xs text-gray-500">الكمية</label>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} className={`${inputClass} p-1 text-center`} />
               </div>
               <div>
                  <label className="text-xs text-gray-500">السعر</label>
                  <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))} className={`${inputClass} p-1 text-center`} />
               </div>
               <div className="flex items-end justify-center pb-1">
                 <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 mt-5">
                   <Trash2 size={18} />
                 </button>
               </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-700">اخرى</h3>
        <div className="grid grid-cols-1 gap-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">خصم (ريال)</label>
            <input type="number" value={data.discount} onChange={(e) => onChange({...data, discount: Number(e.target.value)})} className={`mt-1 ${inputClass}`} />
           </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">ملاحظات</label>
            <textarea value={data.notes} onChange={(e) => onChange({...data, notes: e.target.value})} className={`mt-1 ${inputClass}`} />
           </div>
        </div>
      </section>

    </div>
  );
};

export default InvoiceForm;