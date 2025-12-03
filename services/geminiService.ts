import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseInvoiceImage = async (base64Image: string, mimeType: string): Promise<Partial<InvoiceData> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Extract the invoice data from this image. Extract seller details (name, vat number, address, CR), invoice number, date, and line items. If a value is missing, leave it null or empty string. For the date, try to format as YYYY-MM-DD."
          }
        ]
      },
      config: {
        thinkingConfig: {
          thinkingBudget: 32768
        },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            invoiceNumber: { type: Type.STRING },
            date: { type: Type.STRING },
            time: { type: Type.STRING },
            sellerName: { type: Type.STRING },
            sellerVat: { type: Type.STRING },
            sellerCr: { type: Type.STRING },
            sellerAddress: { type: Type.STRING },
            buyerName: { type: Type.STRING },
            buyerVat: { type: Type.STRING },
            buyerAddress: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unitPrice: { type: Type.NUMBER },
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text);
    
    // Map response to our internal structure
    return {
      invoiceNumber: data.invoiceNumber || "",
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || "12:00",
      seller: {
        name: data.sellerName || "",
        vatNumber: data.sellerVat || "",
        crNumber: data.sellerCr || "",
        address: data.sellerAddress || "",
        contact: ""
      },
      buyer: {
        name: data.buyerName || "",
        vatNumber: data.buyerVat || "",
        crNumber: "",
        address: data.buyerAddress || "",
        contact: ""
      },
      items: (data.items || []).map((item: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        description: item.description || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        taxRate: 0.15
      }))
    };

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return null;
  }
};