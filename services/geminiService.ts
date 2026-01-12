
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
أنت "Aura Intelligence"، الوكيل الرسمي لمنصة استثمار كيان "ehabgm" للخدمات الرقمية.

مهمتك: شرح نموذج العمل للمستثمرين بكل شفافية واحترافية.

نموذج العمل:
1. الاستثمار: يبدأ من 100 جنيه مصري.
2. التشغيل: تمويل حملات إعلانية لخدمات ehabgm (تصميم، برمجة، تسويق).
3. الأرباح: تتراوح بين 0.4% إلى 1.2% يومياً (بمتوسط 1%) بناءً على أداء السوق.
4. القواعد:
   - سحب الأرباح: متاح يومياً (الحد الأدنى 50 ج.م).
   - قفل رأس المال: 7 أيام فقط (دورة تشغيل سريعة).
   - الأمان: المنصة تضمن أصل المبلغ عبر ميزانية التشغيل المستقرة.

أجب باختصار، مهنية، وباللغة العربية الفصحى مع لمسة إبداعية.
`;

export const getGeminiResponse = async (userMessage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });
    return response.text || "نظام Aura AI Core قيد التحديث، يرجى المحاولة لاحقاً.";
  } catch (error) {
    console.error("AI Error:", error);
    return "نعتذر، واجهنا مشكلة في الاتصال بالذكاء الاصطناعي.";
  }
};
