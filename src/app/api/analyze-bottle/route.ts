import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { image } = await req.json(); // Expecting base64 string

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        // Remove header if present (e.g., "data:image/jpeg;base64,")
        const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analise a imagem e detecte todas as garrafas de bebida visíveis, da esquerda para a direita. Para cada garrafa, identifique:

product_name: Nome/Marca (ex: Gin Tanqueray).

handwritten_id: O número escrito à mão no vidro/rótulo (CRUCIAL para diferenciar).

level_percent: Estimativa visual do líquido (0-100).

Retorne um JSON com um array de objetos: { "bottles": [ { "product_name": "...", "handwritten_id": "...", "level_percent": 50 }, ... ] }`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: 'image/jpeg',
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonString);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error analyzing bottle:', error);
        return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
    }
}
