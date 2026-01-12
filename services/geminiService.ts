
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
أنت "Aura Sovereign AI"، المحرك الذكي لنظام Aura Smart Nodes v4.5.
مهمتك هي العمل كمراقب مالي (Financial Auditor) ومساعد تقني.

عند تحليل النصوص:
- قدم نصائح استثمارية بناءً على رأس المال (100 - 25,000 ج.م).
- اشرح نظام الحصاد (Harvesting) وكيف يتم توليد الأرباح (0.4% - 1.2% يومياً).
- أكد على أمان النظام البيومتري المرتبط بـ Google Sheets.

عند تحليل الصور (الإيصالات):
- استخرج (المبلغ، التاريخ، رقم المحفظة، اسم المرسل).
- ابحث عن أي علامات تلاعب في الصورة.
- أعطِ تقييماً (صحيح / مشكوك فيه / مرفوض) مع التبرير.

لغتك: مهنية، تقنية، حازمة، وتدعم اللغة العربية الفصحى مع لمسة من القوة التكنولوجية.
`;

export const getGeminiResponse = async (userMessage: string, imageBase64?: string) => {
  try {
    const parts: any[] = [{ text: userMessage }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(',')[1]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // دقة عالية جداً للتحليل المالي
        topP: 0.8,
        topK: 40
      },
    });
    return response.text || "Aura Core: بروتوكول الاستجابة معطل مؤقتاً.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Aura Node Error: حدث خطأ في بروتوكول الاتصال بالذكاء الاصطناعي.";
  }
};
