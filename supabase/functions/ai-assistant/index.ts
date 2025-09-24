import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  console.log('AI Assistant function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { action, data } = await req.json();
    console.log('AI Assistant request:', { action, data });

    switch (action) {
      case 'parse_natural_language':
        return await parseNaturalLanguage(data, supabase);
      case 'generate_progress_nudge':
        return await generateProgressNudge(data, supabase);
      case 'suggest_next_task':
        return await suggestNextTask(data, supabase);
      case 'analyze_productivity':
        return await analyzeProductivity(data, supabase);
      case 'darvis_chat':
        return await handleDarvisChat(data, supabase);
      default:
        throw new Error('Unknown action');
    }
  } catch (error: any) {
    console.error('Error in AI Assistant function:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function parseNaturalLanguage(data: any, supabase: any) {
  const { text, userId } = data;
  
  console.log('Parsing natural language:', text);
  
  const prompt = `
    You are an AI assistant that converts natural language into structured task data. 
    Parse the following text and extract task information in JSON format.
    
    Text: "${text}"
    
    Return a JSON object with these fields (use null if not specified):
    - title: string (required, extracted task title)
    - description: string (optional, additional details)
    - due_date: string (YYYY-MM-DD format, extract from text like "tomorrow", "next week", "Friday", etc.)
    - priority: "Low" | "Medium" | "High" (infer from urgency words)
    - reminder_enabled: boolean (true if text mentions reminders)
    - reminder_days_before: number (days before due date to remind)
    - reminder_hours_before: number (hours before due date to remind)
    
    Examples:
    "Call client tomorrow at 3pm" -> {"title": "Call client", "description": "Call at 3pm", "due_date": "2025-09-17", "priority": "Medium", "reminder_enabled": true, "reminder_days_before": 0, "reminder_hours_before": 2}
    "Finish project report by Friday urgent" -> {"title": "Finish project report", "description": null, "due_date": "2025-09-20", "priority": "High", "reminder_enabled": false, "reminder_days_before": 0, "reminder_hours_before": 0}
    
    Current date is ${new Date().toISOString().split('T')[0]}. Calculate relative dates accordingly.
    
    Respond only with valid JSON, no other text.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  const result = await response.json();
  console.log('OpenAI response:', result);
  
  const parsedTask = JSON.parse(result.choices[0].message.content);
  console.log('Parsed task:', parsedTask);
  
  // Create the task in the database
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      ...parsedTask,
      user_id: userId,
      status: 'Todo'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return new Response(JSON.stringify({ 
    success: true, 
    task,
    message: `Task "${parsedTask.title}" created successfully!`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateProgressNudge(data: any, supabase: any) {
  const { userId } = data;
  
  console.log('Generating progress nudge for user:', userId);
  
  // Get user's recent tasks and projects
  const [tasksResult, projectsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'Active')
  ]);

  const tasks = tasksResult.data || [];
  const projects = projectsResult.data || [];
  
  const completedTasks = tasks.filter((t: any) => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const overdueTasks = tasks.filter((t: any) => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completed'
  ).length;
  
  const prompt = `
    You are a motivational AI assistant for a productivity app. Generate an encouraging and actionable message based on this user's data:
    
    - Total tasks: ${totalTasks}
    - Completed tasks: ${completedTasks}
    - Overdue tasks: ${overdueTasks}
    - Active projects: ${projects.length}
    
    Create a short, encouraging message (1-2 sentences) that:
    1. Acknowledges their progress if they're doing well
    2. Gently motivates them if they need improvement
    3. Suggests a specific next action
    4. Keep it positive and professional
    
    Examples:
    - "Great job completing 8 out of 10 tasks! Focus on tackling those 2 overdue items today."
    - "You're 75% through your current project - keep the momentum going!"
    - "Ready for a fresh start? Let's tackle that overdue task and get back on track."
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  const result = await response.json();
  const nudge = result.choices[0].message.content;
  
  return new Response(JSON.stringify({ 
    success: true, 
    nudge,
    stats: {
      completedTasks,
      totalTasks,
      overdueTasks,
      activeProjects: projects.length
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function suggestNextTask(data: any, supabase: any) {
  const { userId } = data;
  
  console.log('Suggesting next task for user:', userId);
  
  // Get user's pending tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'Completed')
    .order('created_at', { ascending: false });

  if (!tasks || tasks.length === 0) {
    return new Response(JSON.stringify({ 
      success: true, 
      suggestion: "You're all caught up! Consider creating a new task to keep the momentum going.",
      suggestedTask: null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const prompt = `
    You are an AI productivity assistant. Based on these pending tasks, suggest which one to work on next and why.
    
    Tasks:
    ${tasks.map((t: any) => `- ${t.title} (Priority: ${t.priority}, Due: ${t.due_date || 'No due date'})`).join('\n')}
    
    Analyze the tasks and suggest the best next task to work on based on:
    1. Due dates (prioritize overdue and urgent)
    2. Priority levels
    3. Task dependencies (if apparent)
    4. Good productivity practices
    
    Respond with a JSON object:
    {
      "suggestedTaskId": "task_id_here",
      "reason": "Clear explanation why this task should be next (1-2 sentences)"
    }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  const result = await response.json();
  const suggestion = JSON.parse(result.choices[0].message.content);
  
  const suggestedTask = tasks.find((t: any) => t.id === suggestion.suggestedTaskId);
  
  return new Response(JSON.stringify({ 
    success: true, 
    suggestion: suggestion.reason,
    suggestedTask: suggestedTask
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeProductivity(data: any, supabase: any) {
  const { userId, timeRange = '7' } = data;
  
  console.log('Analyzing productivity for user:', userId);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange));
  
  // Get tasks and timesheets data
  const [tasksResult, timesheetsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString()),
    supabase
      .from('timesheets')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
  ]);

  const tasks = tasksResult.data || [];
  const timesheets = timesheetsResult.data || [];
  
  const completedTasks = tasks.filter((t: any) => t.status === 'Completed').length;
  const totalHours = timesheets.reduce((sum: number, ts: any) => sum + parseFloat(ts.hours || 0), 0);
  
  const prompt = `
    Analyze this user's productivity over the last ${timeRange} days and provide insights:
    
    Data:
    - Tasks created: ${tasks.length}
    - Tasks completed: ${completedTasks}
    - Total hours tracked: ${totalHours.toFixed(1)}
    - Completion rate: ${tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : 0}%
    
    Provide a JSON response with:
    {
      "summary": "Brief overview of their productivity (1-2 sentences)",
      "insights": ["insight 1", "insight 2", "insight 3"],
      "recommendations": ["recommendation 1", "recommendation 2"],
      "score": 85 // productivity score 0-100
    }
    
    Keep it encouraging and actionable.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    }),
  });

  const result = await response.json();
  const analysis = JSON.parse(result.choices[0].message.content);
  
  return new Response(JSON.stringify({ 
    success: true,
    ...analysis,
    rawData: {
      tasksCreated: tasks.length,
      tasksCompleted: completedTasks,
      totalHours: totalHours.toFixed(1),
      completionRate: tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : 0
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleDarvisChat(data: any, supabase: any) {
  const { message, userId, conversationHistory = [] } = data;
  
  console.log('Darvis chat for user:', userId, 'message:', message);
  
  // Build conversation context
  const context = conversationHistory
    .slice(-5) // Last 5 messages for context
    .map((msg: any) => `${msg.sender}: ${msg.text}`)
    .join('\n');
  
  const systemPrompt = `You are Darvis, the AI assistant for D-TRACK (a task and time management app). 

Your capabilities:
1. Create tasks from natural language (extract title, description, due date, priority, reminders)
2. Reschedule existing tasks
3. Summarize user's workload (overdue, today's tasks, upcoming)
4. Provide productivity insights and motivation
5. Understand multiple languages and respond appropriately

Guidelines:
- Be friendly, helpful, and concise
- For task creation, always provide a preview that user must confirm
- Extract specific details like dates, times, priorities from natural language
- Use encouraging, professional tone
- Focus only on D-TRACK functionality - no general questions outside task management
- Support multiple languages: English, Spanish, French, German, Portuguese, Italian

Recent conversation:
${context}

User message: ${message}

Respond appropriately based on user intent. If creating a task, provide task_preview object.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }),
  });

  const result = await response.json();
  let aiResponse = result.choices[0].message.content;
  let taskPreview = null;

  // Check if this looks like a task creation request
  const taskKeywords = ['create task', 'add task', 'remind me', 'schedule', 'due', 'tomorrow', 'today', 'next week'];
  const isTaskRequest = taskKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );

  if (isTaskRequest) {
    // Extract task details using AI
    const extractPrompt = `Extract task details from: "${message}"

Return JSON format:
{
  "title": "task title",
  "description": "optional description", 
  "due_date": "YYYY-MM-DD or null",
  "due_time": "HH:MM or null",
  "priority": "Low|Medium|High|Urgent",
  "reminder_minutes": number or null
}

Rules:
- If no due date specified, use null
- Default priority is "Medium"
- Common time references: "tomorrow" = next day, "next week" = 7 days from now
- Reminder: "30 min before" = 30, "1 hour before" = 60
- Current date: ${new Date().toISOString().split('T')[0]}`;

    const extractResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: extractPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.3
      }),
    });

    const extractResult = await extractResponse.json();

    try {
      const extracted = JSON.parse(extractResult.choices[0].message.content);
      taskPreview = {
        title: extracted.title || 'New Task',
        description: extracted.description || null,
        due_date: extracted.due_date,
        due_time: extracted.due_time,
        priority: extracted.priority || 'Medium',
        reminder_minutes: extracted.reminder_minutes
      };

      aiResponse = `I can create this task for you. Please review the details and confirm:`;
    } catch (parseError) {
      console.error('Error parsing task extraction:', parseError);
    }
  }

  return new Response(JSON.stringify({
    success: true,
    response: {
      type: isTaskRequest ? 'task_creation' : 'general',
      message: aiResponse,
      task_preview: taskPreview
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}