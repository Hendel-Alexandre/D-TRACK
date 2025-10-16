import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, fileType, fileName } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log(`Transcribing ${fileName || 'audio file'} of type ${fileType || 'unknown'}`);

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Check file size
    if (binaryAudio.length > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 100MB limit' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: fileType || 'audio/webm' });
    formData.append('file', blob, fileName || 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json'); // Get timestamps
    formData.append('timestamp_granularities[]', 'segment'); // Segment-level timestamps

    // Send to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error('Failed to transcribe media');
    }

    const result = await response.json();
    console.log('Transcription complete with', result.segments?.length || 0, 'segments');

    return new Response(
      JSON.stringify({ 
        text: result.text,
        segments: result.segments,
        duration: result.duration 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error(`[${errorId}] Error transcribing media:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to transcribe media' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
