import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  console.log('AI Assistant function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!lovableApiKey) {
      throw new Error('Lovable AI key not configured');
    }

    // Create Supabase client with user's auth context
    const supabase = createClient(
      supabaseUrl!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use authenticated user's ID
    const authenticatedUserId = user.id;
    console.log('Authenticated user:', authenticatedUserId);

    const { action, data } = await req.json();
    console.log('AI Assistant request:', { action });

    // Sanitize input text to prevent injection
    const sanitizeText = (input: string): string => {
      if (!input || typeof input !== 'string') return '';
      return input.trim().slice(0, 10000);
    };

    // Override userId in data with authenticated user's ID for security
    const secureData = { ...data, userId: authenticatedUserId };
    if (data.text) secureData.text = sanitizeText(data.text);
    if (data.message) secureData.message = sanitizeText(data.message);

    switch (action) {
      case 'parse_natural_language':
        return await parseNaturalLanguage(secureData, supabase);
      case 'generate_progress_nudge':
        return await generateProgressNudge(secureData, supabase);
      case 'suggest_next_task':
        return await suggestNextTask(secureData, supabase);
      case 'analyze_productivity':
        return await analyzeProductivity(secureData, supabase);
      case 'darvis_chat':
        return await handleDarvisChat(secureData, supabase);
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
    
    Text: ${JSON.stringify(text)}
    
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

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
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
    
    - Total tasks: ${JSON.stringify(totalTasks)}
    - Completed tasks: ${JSON.stringify(completedTasks)}
    - Overdue tasks: ${JSON.stringify(overdueTasks)}
    - Active projects: ${JSON.stringify(projects.length)}
    
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

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
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
    ${tasks.map((t: any) => `- ${JSON.stringify(t.title)} (Priority: ${JSON.stringify(t.priority)}, Due: ${JSON.stringify(t.due_date) || 'No due date'})`).join('\n')}
    
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

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
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
    Analyze this user's productivity over the last ${JSON.stringify(timeRange)} days and provide insights:
    
    Data:
    - Tasks created: ${JSON.stringify(tasks.length)}
    - Tasks completed: ${JSON.stringify(completedTasks)}
    - Total hours tracked: ${JSON.stringify(totalHours.toFixed(1))}
    - Completion rate: ${JSON.stringify(tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : 0)}%
    
    Provide a JSON response with:
    {
      "summary": "Brief overview of their productivity (1-2 sentences)",
      "insights": ["insight 1", "insight 2", "insight 3"],
      "recommendations": ["recommendation 1", "recommendation 2"],
      "score": 85 // productivity score 0-100
    }
    
    Keep it encouraging and actionable.
  `;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
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
  
  // Build conversation context - sanitize
  const context = conversationHistory
    .slice(-5) // Last 5 messages for context
    .map((msg: any) => `${JSON.stringify(msg.sender)}: ${JSON.stringify(String(msg.text).slice(0, 500))}`)
    .join('\n');
  
  const systemPrompt = `You are Darvis, the AI assistant for D-TRACK (a task and time management app). 

You have direct access to create tasks, notes, projects, and calendar events for users. When users request these actions, use the appropriate tool immediately.

Your capabilities:
1. Create tasks - Use create_task tool when user wants to add/create a task
2. Create notes - Use create_note tool when user wants to write/save a note
3. Create projects - Use create_project tool when user wants to start a new project
4. Create calendar events - Use create_calendar_event tool for meetings/appointments
5. Summarize user's workload and provide insights
6. Support multiple languages: English, Spanish, French, German, Portuguese, Italian

Guidelines:
- Be friendly, helpful, and concise
- When user requests task/note/project/event creation, use tools immediately
- Extract dates, times, priorities from natural language
- Confirm after creation with a friendly message
- Use encouraging, professional tone

Recent conversation:
${context}

User message: ${JSON.stringify(message)}`;

  const tools = [
    {
      type: "function",
      function: {
        name: "create_task",
        description: "Create a new task in D-TRACK",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Task title" },
            description: { type: "string", description: "Task description" },
            due_date: { type: "string", description: "Due date in YYYY-MM-DD format" },
            priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"], description: "Task priority" },
            reminder_minutes: { type: "number", description: "Reminder before due date in minutes" }
          },
          required: ["title"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "create_note",
        description: "Create a new note in D-TRACK",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Note title" },
            content: { type: "string", description: "Note content" },
            category: { type: "string", description: "Note category" }
          },
          required: ["title", "content"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "create_project",
        description: "Create a new project in D-TRACK",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Project name" },
            description: { type: "string", description: "Project description" },
            start_date: { type: "string", description: "Start date in YYYY-MM-DD format" },
            end_date: { type: "string", description: "End date in YYYY-MM-DD format" }
          },
          required: ["name"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "create_calendar_event",
        description: "Create a new calendar event in D-TRACK",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Event title" },
            description: { type: "string", description: "Event description" },
            event_date: { type: "string", description: "Event date in YYYY-MM-DD format" },
            start_time: { type: "string", description: "Start time in HH:MM format" },
            end_time: { type: "string", description: "End time in HH:MM format" }
          },
          required: ["title", "event_date"]
        }
      }
    }
  ];

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      tools: tools,
      max_completion_tokens: 1000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: 'RATE_LIMIT', message: 'AI is temporarily rate-limited or quota is exhausted. Please try again shortly.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: 'PAYMENT_REQUIRED', message: 'AI credits are exhausted. Please add funds to continue.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'AI_GATEWAY_ERROR', message: 'Upstream AI error' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const result = await response.json();
  console.log('AI result:', JSON.stringify(result));
  
  if (!result.choices || !result.choices[0] || !result.choices[0].message) {
    console.error('Unexpected AI response format:', result);
    throw new Error('Invalid response from AI');
  }
  
  const choice = result.choices[0];
  let aiResponse = choice.message.content || '';
  let createdItems = [];

  // Handle tool calls
  if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    console.log('Tool calls detected:', choice.message.tool_calls);
    
    for (const toolCall of choice.message.tool_calls) {
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);
      
      console.log(`Executing tool: ${functionName}`, args);
      
      try {
        switch (functionName) {
          case 'create_task': {
            const { data: task, error } = await supabase
              .from('tasks')
              .insert({
                user_id: userId,
                title: args.title,
                description: args.description || null,
                due_date: args.due_date || null,
                priority: args.priority || 'Medium',
                status: 'Todo',
                reminder_enabled: !!args.reminder_minutes,
                reminder_hours_before: args.reminder_minutes ? Math.floor(args.reminder_minutes / 60) : 0,
                reminder_days_before: 0
              })
              .select()
              .single();
            
            if (error) throw error;
            createdItems.push({ type: 'task', item: task });
            aiResponse = `✅ Task created: "${args.title}"${args.due_date ? ` (Due: ${args.due_date})` : ''}. What else can I help you with?`;
            break;
          }
          
          case 'create_note': {
            const { data: note, error } = await supabase
              .from('notes')
              .insert({
                user_id: userId,
                title: args.title,
                content: args.content,
                category: args.category || 'General'
              })
              .select()
              .single();
            
            if (error) throw error;
            createdItems.push({ type: 'note', item: note });
            aiResponse = `✅ Note created: "${args.title}". Anything else?`;
            break;
          }
          
          case 'create_project': {
            const { data: project, error } = await supabase
              .from('projects')
              .insert({
                user_id: userId,
                name: args.name,
                description: args.description || null,
                start_date: args.start_date || null,
                end_date: args.end_date || null,
                status: 'Active'
              })
              .select()
              .single();
            
            if (error) throw error;
            createdItems.push({ type: 'project', item: project });
            aiResponse = `✅ Project created: "${args.name}". Ready to add tasks to it?`;
            break;
          }
          
          case 'create_calendar_event': {
            // Calendar events are stored as tasks with due dates
            const { data: event, error } = await supabase
              .from('tasks')
              .insert({
                user_id: userId,
                title: args.title,
                description: args.description || null,
                due_date: args.event_date,
                status: 'Todo',
                priority: 'Medium',
                reminder_enabled: true,
                reminder_hours_before: 1,
                reminder_days_before: 0
              })
              .select()
              .single();
            
            if (error) throw error;
            createdItems.push({ type: 'calendar_event', item: event });
            aiResponse = `✅ Calendar event created: "${args.title}" on ${args.event_date}${args.description ? ` - ${args.description}` : ''}. What's next?`;
            break;
          }
        }
      } catch (error: any) {
        console.error(`Error executing ${functionName}:`, error);
        aiResponse = `I had trouble creating that ${functionName.replace('create_', '')}. Please try again or check your permissions.`;
      }
    }
  }

  return new Response(JSON.stringify({
    success: true,
    response: {
      type: createdItems.length > 0 ? 'creation_complete' : 'general',
      message: aiResponse,
      created_items: createdItems
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}