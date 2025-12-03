import React, { useState, useEffect } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { InvoiceData } from './types';
import { Printer, FilePlus } from 'lucide-react';
import { parseInvoiceImage } from './services/geminiService';

const LOCAL_STORAGE_KEY = 'saudi-invoicer-data';

const getDefaultData = (): InvoiceData => {
  const now = new Date();
  return {
    invoiceNumber: '00100234',
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    type: 'فاتورة ضريبية',
    discount: 0,
    notes: '',
    seller: {
      name: 'مؤسسة الحلول التقنية',
      address: 'الرياض، المملكة العربية السعودية',
      vatNumber: '300123456700003',
      crNumber: '1010101010',
      contact: '0555555555',
      logoUrl: 'https://picsum.photos/200/200'
    },
    buyer: {
      name: 'شركة العملاء المميزين',
      address: 'جدة، حي الروضة',
      vatNumber: '300987654300003',
      crNumber: '',
      contact: ''
    },
    items: [
      {
        id: '1',
        description: 'تصميم واجهة مستخدم UX/UI',
        quantity: 1,
        unitPrice: 5000,
        taxRate: 0.15
      },
      {
        id: '2',
        description: 'استضافة خادم سحابي (لمدة سنة)',
        quantity: 1,
        unitPrice: 1200,
        taxRate: 0.15
      }
    ]
  };
};

const App: React.FC = () => {
  // Initialize state from localStorage with error handling and data integrity check
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => {
    if (typeof window === 'undefined') return getDefaultData();

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return getDefaultData();

      const parsed = JSON.parse(saved);
      const defaults = getDefaultData();

      // Merge parsed data with defaults to ensure all fields exist (Data Integrity)
      // This protects against crashes if the saved data structure is old or incomplete
      return {
        ...defaults,
        ...parsed,
        seller: { ...defaults.seller, ...(parsed.seller || {}) },
        buyer: { ...defaults.buyer, ...(parsed.buyer || {}) },
        items: Array.isArray(parsed.items) ? parsed.items : defaults.items
      };
    } catch (e) {
      console.error("Failed to load or parse invoice data from localStorage:", e);
      // Fallback to default data if corrupted
      return getDefaultData();
    }
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Save to localStorage whenever data changes with error handling
  useEffect(() => {
    try {
      const serializedData = JSON.stringify(invoiceData);
      localStorage.setItem(LOCAL_STORAGE_KEY, serializedData);
    } catch (e) {
      console.error("Failed to save invoice data to localStorage:", e);
    }
  }, [invoiceData]);

  const handlePrint = () => {
    if (window.confirm('Are you sure you want to print this invoice?')) {
      window.print();
    }
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من إنشاء فاتورة جديدة؟ سيتم مسح البيانات الحالية.')) {
      const newData = getDefaultData();
      setInvoiceData(newData);
      // LocalStorage will be updated by the useEffect
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const base64Data = (e.target.result as string).split(',')[1];
        const mimeType = file.type;
        
        const extractedData = await parseInvoiceImage(base64Data, mimeType);
        
        if (extractedData) {
          // Merge extracted data with current state safely
          setInvoiceData(prev => ({
            ...prev,
            ...extractedData,
            seller: { ...prev.seller, ...(extractedData.seller || {}) },
            buyer: { ...prev.buyer, ...(extractedData.buyer || {}) },
            items: extractedData.items && extractedData.items.length > 0 ? extractedData.items : prev.items
          }));
        } else {
          alert('تعذر استخراج البيانات من الصورة. يرجى المحاولة مرة أخرى بصورة أوضح.');
        }
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header - Hidden on Print */}
      <header className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">SI</div>
            <h1 className="text-xl font-bold text-gray-900">منشئ الفواتير الذكي</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition shadow-sm font-medium"
              title="إنشاء فاتورة جديدة (مسح البيانات)"
            >
              <FilePlus size={20} />
              <span className="hidden sm:inline">جديد</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm font-medium"
            >
              <Printer size={20} />
              <span>طباعة / حفظ PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0 print:w-full print:max-w-none">
        <div className="flex flex-col lg:flex-row gap-8 print:block">
          
          {/* Editor Column - Hidden on Print */}
          <div className="w-full lg:w-5/12 xl:w-4/12 print:hidden h-fit">
            <InvoiceForm 
              data={invoiceData} 
              onChange={setInvoiceData} 
              onImageUpload={handleImageUpload}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Preview Column - Full Width on Print */}
          {/* We rely on normal document flow (display:block) for printing. 
              Since siblings are hidden, this will naturally be the only element. */}
          <div id="invoice-print-container" className="w-full lg:w-7/12 xl:w-8/12 flex justify-center print:block print:w-full print:m-0">
             <InvoicePreview data={invoiceData} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;