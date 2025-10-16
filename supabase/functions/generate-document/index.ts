import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const googleApiKey = Deno.env.get('GOOGLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, prompt, data } = await req.json();
    
    if (!type || !prompt) {
      throw new Error('Document type and prompt are required');
    }

    console.log(`Generating ${type} document with prompt:`, prompt);

    let systemPrompt = '';
    let documentFormat = '';

    switch (type) {
      case 'excel':
      case 'spreadsheet':
        systemPrompt = 'You are an expert at creating structured data tables. Generate data in CSV format that can be converted to Excel. Include clear headers and properly formatted data.';
        documentFormat = 'CSV';
        break;
      case 'essay':
      case 'document':
        systemPrompt = 'You are an expert writer. Create well-structured, professional documents with clear sections, proper formatting, and compelling content.';
        documentFormat = 'Markdown';
        break;
      case 'report':
        systemPrompt = 'You are an expert at creating professional reports. Include executive summary, detailed sections, data analysis, and conclusions.';
        documentFormat = 'Markdown';
        break;
      default:
        systemPrompt = 'You are a document generation assistant. Create clear, well-structured content based on the user\'s requirements.';
        documentFormat = 'Markdown';
    }

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}\n\n${data ? `Additional Data: ${JSON.stringify(data)}` : ''}\n\nGenerate a ${type} in ${documentFormat} format. Be thorough and professional.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: fullPrompt }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error('Failed to generate document');
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text || '';

    if (!generatedText) {
      throw new Error('No content generated');
    }

    console.log('Document generated successfully, length:', generatedText.length);

    // Convert to appropriate format
    let content = generatedText;
    let mimeType = 'text/markdown';
    let extension = 'md';

    if (type === 'excel' || type === 'spreadsheet') {
      mimeType = 'text/csv';
      extension = 'csv';
    }

    // Convert to base64 for download
    const blob = new TextEncoder().encode(content);
    const base64 = btoa(String.fromCharCode(...blob));

    return new Response(
      JSON.stringify({
        success: true,
        content: content,
        download: {
          data: `data:${mimeType};base64,${base64}`,
          filename: `document_${Date.now()}.${extension}`,
          mimeType: mimeType
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error(`[${errorId}] Error generating document:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate document' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
