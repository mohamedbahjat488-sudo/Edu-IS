import { GoogleGenAI, GenerateContentResponse, Part, Modality, Type } from "@google/genai";
import { Solution, QuizQuestion } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function fileToGenerativePart(file: File): Promise<Part> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as data URL."));
      }
      resolve({
        inlineData: {
          data: reader.result.split(',')[1],
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
  });
}

const getProblemSolvingPrompt = (problemText: string, dialect: 'formal' | 'egyptian') => {
    const dialectInstruction = dialect === 'egyptian' 
    ? 'يجب أن يكون ردك باللهجة المصرية العامية، بشكل بسيط وواضح كأنك تشرح لزميلك.' 
    : 'يجب أن يكون ردك باللغة العربية الفصحى الواضحة والبسيطة.';

    return `
أنت "المساعد المحاسبي الذكي"، خبير محاسبة تم تدريبك بشكل مكثف على محتويات "الكتاب الشامل في المحاسبة". معرفتك دقيقة وعميقة، ولديك قدرة فائقة على تحليل الصور المعقدة للمسائل المحاسبية، بما في ذلك المكتوبة بخط اليد. مهمتك هي تقديم حلول واضحة ومفصلة للمسائل المحاسبية، مع التركيز على شرح "لماذا" و"كيف".
${dialectInstruction}

المسألة المحاسبية من الطالب:
---
${problemText}
---

قدم حلاً مكونًا من أربع خطوات: تحليل المسألة، التطبيق العملي، النتيجة النهائية، وشرح وتفسير.
`;
}


export const solveAccountingProblem = async (problemText: string, imageFile?: File, dialect: 'formal' | 'egyptian' = 'formal'): Promise<Solution> => {
  try {
    const model = 'gemini-2.5-pro';
    
    const parts: Part[] = [{ text: getProblemSolvingPrompt(problemText, dialect) }];

    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.unshift(imagePart);
    }

    const result: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: [{ parts }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    analysis: { type: Type.STRING },
                    application: { type: Type.STRING },
                    result: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                },
                required: ['analysis', 'application', 'result', 'explanation']
            }
        }
    });
    
    const text = result.text.trim();
    const jsonString = text.startsWith('```json') ? text.slice(7, -3).trim() : text;
    
    const parsedResult = JSON.parse(jsonString);

    return {
        analysis: parsedResult.analysis || '',
        application: parsedResult.application || '',
        result: parsedResult.result || '',
        explanation: parsedResult.explanation || '',
    };
  } catch (error) {
    console.error("Error solving accounting problem:", error);
    throw new Error("Failed to get solution from Gemini API.");
  }
};

export const generateCourseLesson = async (topic: string, lang: 'ar' | 'en'): Promise<string> => {
    try {
        const dialectInstruction = lang === 'ar' 
            ? 'اشرح الدرس باللهجة المصرية العامية بطريقة مبسطة وممتعة ومناسبة لطالب جامعي.'
            : 'Explain the lesson in clear, simple, and engaging English suitable for a university student.';

        const prompt = `
            أنت مدرس محاسبة خبير، تستمد معرفتك من "الكتاب الشامل في المحاسبة". مهمتك هي شرح الموضوع التالي: "${topic}".
            ${dialectInstruction}
            اجعل الشرح مفصلاً، واستخدم أمثلة عملية بسيطة لتوضيح النقاط الصعبة. قم بتنظيم الشرح في فقرات واضحة.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return result.text;
    } catch (error) {
        console.error("Error generating course lesson:", error);
        throw new Error("Failed to generate lesson from Gemini API.");
    }
};

export const generateQuiz = async (topic: string, lang: 'ar' | 'en'): Promise<QuizQuestion[]> => {
    try {
        const dialectInstruction = lang === 'ar' ? 'صياغة الأسئلة والإجابات والشرح يجب أن تكون باللغة العربية (مع لمسة عامية مصرية بسيطة ومفهومة إن أمكن).' : 'Formulate questions, answers, and explanations in English.';

        const prompt = `
            أنت خبير في وضع الامتحانات المحاسبية، وتعتمد في معلوماتك على "الكتاب الشامل في المحاسبة". قم بتوليد 5 أسئلة حول الموضوع التالي: "${topic}".
            ${dialectInstruction}
            يجب أن تكون الأسئلة مزيجًا من الاختيار من متعدد (MCQ) والصواب والخطأ (TF).
            لكل سؤال، قدم شرحًا موجزًا ومفيدًا للإجابة الصحيحة.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctAnswerIndex: { type: Type.INTEGER },
                                    explanation: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['mcq', 'tf'] }
                                },
                                required: ['id', 'question', 'options', 'correctAnswerIndex', 'explanation', 'type']
                            }
                        }
                    },
                    required: ['questions']
                }
            }
        });

        const text = result.text.trim();
        const jsonString = text.startsWith('```json') ? text.slice(7, -3).trim() : text;
        const parsedResult = JSON.parse(jsonString);

        return parsedResult.questions || [];

    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz from Gemini API.");
    }
}

export const generateSummary = async (topic: string, lang: 'ar' | 'en'): Promise<string> => {
    try {
        const dialectInstruction = lang === 'ar'
            ? 'الملخص يجب أن يكون باللهجة المصرية العامية بشكل كامل. استخدم أسلوب بسيط ومباشر ومناسب لطالب جامعي بيذاكر ليلة الامتحان.'
            : 'The summary must be in clear and simple English, suitable for a university student preparing for an exam.';
        
        const prompt = `
            أنت خبير ومدرس محاسبة متخصص في تبسيط المفاهيم المعقدة، ومعرفتك مبنية على "الكتاب الشامل في المحاسبة".
            مهمتك هي كتابة ملخص طويل، ومفصل، وشامل للموضوع التالي: "${topic}".
            ${dialectInstruction}
            يجب أن يغطي الملخص كل الجوانب الرئيسية للموضوع بشكل كامل.
            قم بتنظيم الملخص باستخدام عناوين فرعية واضحة ونقاط (bullet points) لتسهيل القراءة والمذاكرة.
            اجعل الملخص طويلاً بما يكفي ليكون مرجعاً كاملاً للطالب، بحيث يمكنه الاعتماد عليه فقط للمراجعة النهائية.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        
        return result.text;

    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Failed to generate summary from Gemini API.");
    }
};

export const explainFormula = async (formulaName: string, lang: 'ar' | 'en'): Promise<string> => {
    try {
        const dialectInstruction = lang === 'ar'
            ? 'الشرح يجب أن يكون باللهجة المصرية العامية، بسيط ومباشر وواضح جداً.'
            : 'The explanation must be in simple, clear, and direct English.';
        
        const prompt = `
            أنت "المساعد المحاسبي الذكي"، خبير محاسبة تم تدريبك على "الكتاب الشامل في المحاسبة".
            مهمتك هي شرح القانون أو المعادلة المحاسبية التالية: "${formulaName}".
            ${dialectInstruction}
            الشرح يجب أن يتضمن:
            1.  المعادلة نفسها مكتوبة بوضوح في بداية الشرح.
            2.  شرح بسيط ومبسط لكل عنصر في المعادلة (مثلاً: الأصول هي إيه، الخصوم هي إيه).
            3.  مثال عملي بالأرقام يوضح كيفية تطبيق المعادلة خطوة بخطوة.
            4.  أهمية هذه المعادلة واستخدامها في الواقع العملي للمحاسب.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        
        return result.text;

    } catch (error) {
        console.error("Error explaining formula:", error);
        throw new Error("Failed to explain formula from Gemini API.");
    }
};


export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A clear voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech from Gemini API.");
    }
};

export const generateDailyChallenge = async (lang: 'ar' | 'en'): Promise<{question: string, idealAnswer: string}> => {
    try {
        const langInstruction = lang === 'ar' 
            ? 'السؤال والإجابة يجب أن يكونا باللغة العربية.'
            : 'The question and answer must be in English.';
            
        const prompt = `
            أنت خبير في تدريس المحاسبة. قم بإنشاء "تحدي يومي" فريد وممتع لطالب جامعي.
            يجب أن يكون التحدي عبارة عن مسألة قصيرة أو سؤال مفاهيمي يمكن الإجابة عليه في بضع جمل.
            ${langInstruction}
            قدم السؤال وإجابة مثالية موجزة لأغراض التقييم.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING, description: "The daily challenge question for the student." },
                        idealAnswer: { type: Type.STRING, description: "The ideal, correct answer to the question for evaluation." },
                    },
                    required: ['question', 'idealAnswer']
                }
            }
        });

        const text = result.text.trim();
        const jsonString = text.startsWith('```json') ? text.slice(7, -3).trim() : text;
        const parsedResult = JSON.parse(jsonString);

        return parsedResult;
    } catch (error) {
        console.error("Error generating daily challenge:", error);
        throw new Error("Failed to generate daily challenge from Gemini API.");
    }
};

export const evaluateChallengeAnswer = async (challenge: string, userAnswer: string, lang: 'ar' | 'en'): Promise<{isCorrect: boolean, feedback: string}> => {
    try {
        const langInstruction = lang === 'ar' 
            ? 'قدم تقييمًا وملاحظات بناءة وموجزة باللهجة المصرية العامية.'
            : 'Provide constructive and concise feedback in English.';

        const prompt = `
            أنت مدرس محاسبة خبير. تم تقديم التحدي التالي للطالب:
            ---
            التحدي: "${challenge}"
            ---
            إجابة الطالب: "${userAnswer}"
            ---
            مهمتك هي تقييم إجابة الطالب. هل هي صحيحة بشكل عام؟
            ${langInstruction}
            كن مشجعاً في ملاحظاتك.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isCorrect: { type: Type.BOOLEAN, description: "Whether the student's answer is generally correct." },
                        feedback: { type: Type.STRING, description: "Concise and helpful feedback for the student." },
                    },
                    required: ['isCorrect', 'feedback']
                }
            }
        });

        const text = result.text.trim();
        const jsonString = text.startsWith('```json') ? text.slice(7, -3).trim() : text;
        const parsedResult = JSON.parse(jsonString);

        return parsedResult;
    } catch (error) {
        console.error("Error evaluating challenge answer:", error);
        throw new Error("Failed to evaluate answer from Gemini API.");
    }
};
