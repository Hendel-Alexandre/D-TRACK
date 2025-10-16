import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
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

    if (!googleApiKey) {
      throw new Error('Google API key not configured');
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

    // SECURITY: Rate limiting check (100 requests per hour)
    const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
    const MAX_REQUESTS_PER_HOUR = 100;

    // Create Supabase client with service role for rate limit check
    const supabaseAdmin = createClient(
      supabaseUrl!,
      supabaseServiceKey!
    );

    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from('ai_usage_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authenticatedUserId)
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error('Rate limit check error:', countError);
    } else if (count && count >= MAX_REQUESTS_PER_HOUR) {
      console.warn(`Rate limit exceeded for user ${authenticatedUserId}: ${count} requests`);
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. You can make up to 100 AI requests per hour. Please try again later.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Rate limit check passed: ${count || 0}/${MAX_REQUESTS_PER_HOUR} requests in last hour`);

    const { action, data } = await req.json();
    console.log('AI Assistant request:', { action });

    // Sanitize input text to prevent injection
    const sanitizeText = (input: string): string => {
      if (!input || typeof input !== 'string') return '';
      return input.trim().slice(0, 10000);
    };

    // SECURITY: Detect prompt injection attempts
    const detectPromptInjection = (text: string): boolean => {
      const suspiciousPatterns = [
        /ignore (previous|all) (instructions|prompts)/i,
        /system prompt/i,
        /you are (now|actually)/i,
        /\[\s*system\s*\]/i,
        /forget (everything|all)/i,
        /reveal (your|the) (instructions|prompt|system)/i,
        /what are your (instructions|rules)/i,
      ];
      return suspiciousPatterns.some(pattern => pattern.test(text));
    };

    // Override userId in data with authenticated user's ID for security
    const secureData = { ...data, userId: authenticatedUserId };
    if (data.text) {
      secureData.text = sanitizeText(data.text);
      if (detectPromptInjection(secureData.text)) {
        console.warn(`Prompt injection attempt detected from user ${authenticatedUserId}`);
        return new Response(JSON.stringify({ 
          error: 'Invalid request detected' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    if (data.message) {
      secureData.message = sanitizeText(data.message);
      if (detectPromptInjection(secureData.message)) {
        console.warn(`Prompt injection attempt detected from user ${authenticatedUserId}`);
        return new Response(JSON.stringify({ 
          error: 'Invalid request detected' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Helper function to log AI usage
    const logUsage = async (action: string, tokenCount?: number) => {
      try {
        await supabaseAdmin.from('ai_usage_log').insert({
          user_id: authenticatedUserId,
          action: action,
          token_count: tokenCount || 0,
        });
      } catch (error) {
        console.error('Failed to log AI usage:', error);
      }
    };

    let result;
    switch (action) {
      case 'parse_natural_language':
        result = await parseNaturalLanguage(secureData, supabase);
        await logUsage(action);
        return result;
      case 'generate_progress_nudge':
        result = await generateProgressNudge(secureData, supabase);
        await logUsage(action);
        return result;
      case 'suggest_next_task':
        result = await suggestNextTask(secureData, supabase);
        await logUsage(action);
        return result;
      case 'analyze_productivity':
        result = await analyzeProductivity(secureData, supabase);
        await logUsage(action);
        return result;
      case 'darvis_chat':
        result = await handleDarvisChat(secureData, supabase);
        await logUsage(action);
        return result;
      case 'generate_image':
        result = await generateImage(secureData);
        await logUsage(action);
        return result;
      default:
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error(`[${errorId}] Error in AI Assistant function:`, error);
    return new Response(JSON.stringify({ error: 'Request failed. Please try again.' }), {
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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    }),
  });

  const result = await response.json();
  console.log('Google Gemini response:', result);
  
  const parsedTask = JSON.parse(result.candidates[0].content.parts[0].text);
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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const result = await response.json();
  const nudge = result.candidates[0].content.parts[0].text;
  
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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const result = await response.json();
  const suggestion = JSON.parse(result.candidates[0].content.parts[0].text);
  
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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const result = await response.json();
  const analysis = JSON.parse(result.candidates[0].content.parts[0].text);
  
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

// File validation constants
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'text/plain', 'text/csv', 'text/markdown',
  'application/json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/msword', // .doc
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILENAME_LENGTH = 255;
const FILENAME_REGEX = /^[a-zA-Z0-9._\-\s()]+$/;

function validateFile(file: {type: string, data: string, name: string}) {
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Supported types: images, PDFs, text files, Word/Excel documents.`);
  }
  
  // Estimate base64 size (base64 encoding is approximately 1.37x original size)
  // We decode to check actual size
  const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
  const estimatedSize = base64Data.length * 0.75; // Approximate original size
  
  if (estimatedSize > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`);
  }
  
  // Validate filename
  if (!file.name || file.name.length > MAX_FILENAME_LENGTH) {
    throw new Error(`Invalid filename. Must be 1-${MAX_FILENAME_LENGTH} characters.`);
  }
  
  // Check for suspicious characters in filename
  if (!FILENAME_REGEX.test(file.name)) {
    throw new Error('Invalid filename. Only alphanumeric characters, spaces, dots, hyphens, underscores, and parentheses are allowed.');
  }
  
  return true;
}

async function handleDarvisChat(data: any, supabase: any) {
  const { message, userId, conversationHistory = [], files } = data;
  
  console.log('Darvis chat for user:', userId, 'message:', message);
  
  // SECURITY: Validate all uploaded files server-side
  if (files && Array.isArray(files)) {
    console.log(`Validating ${files.length} uploaded files`);
    
    for (const file of files) {
      try {
        validateFile(file);
        console.log(`File validation passed: ${file.name} (${file.type})`);
      } catch (error: any) {
        const errorId = crypto.randomUUID();
        console.error(`[${errorId}] File validation failed for "${file.name}":`, error.message);
        throw new Error('File upload failed. Please check file type and size.');
      }
    }
  }
  
  // Build conversation context - sanitize (increased memory)
  const context = conversationHistory
    .slice(-15) // Last 15 messages for better memory
    .map((msg: any) => `${JSON.stringify(msg.sender)}: ${JSON.stringify(String(msg.text).slice(0, 500))}`)
    .join('\n');
  
  // Get current date/time context
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
  const currentMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });

  const systemPrompt = `You are Darvis, the friendly AI assistant for D-TRACK (a task and time management app). 

CURRENT DATE & TIME:
- Today is ${dayOfWeek}, ${currentDate}
- Current time: ${currentTime}
- Current month: ${currentMonth}

You have direct access to create and query user data. When users ask questions, use the appropriate tool immediately.

Your capabilities:
1. Create work tasks, notes, projects, calendar events
2. Query work tasks - Use get_tasks to count, list, or filter
3. Query student tasks - Use get_student_tasks for student work
4. Query calendar - Use get_calendar_events to see what's scheduled
5. Query user profile - Use get_user_profile for basic info
6. Query student profile - Use get_student_profile for school info
7. Query work profile - Use get_work_profile for job info
8. Query student classes - Use get_student_classes for schedule
9. Query student assignments - Use get_student_assignments
10. Query projects - Use get_projects to see user's projects
11. Query notes - Use get_notes to see user's notes
12. Query student files - Use get_student_files
13. Query work files - Use get_work_files
14. Add notes to calendar - Use add_note_to_calendar (search by title/date, NO IDs!)
15. Analyze uploaded files (images, documents)
16. Generate images from descriptions
17. Generate documents (essays, reports, Excel spreadsheets)
18. Convert documents between formats (PDF to Excel, Word to PDF, etc.)
19. Check timesheets and attendance
20. Provide workload insights

Guidelines for user-friendly communication:
- NEVER ask users for technical IDs or UUIDs - search by title/date instead
- Always use current date/time in your responses when relevant
- Use natural, conversational language
- Be helpful and encouraging
- Remember our conversation history - reference previous messages when relevant
- Seamlessly access both student and work data - users don't need to specify mode
- When asked about tasks, check both work tasks (tasks table) and student tasks (student_tasks table)
- Provide context-aware responses based on what the user is asking about

Recent conversation:
${context}

User message: ${JSON.stringify(message)}`;

  const tools = [
    {
      name: "get_tasks",
      description: "Get user's tasks - count them, list them, filter by status or priority",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["Todo", "In Progress", "Done", "All"], description: "Filter by status" },
          priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent", "All"], description: "Filter by priority" },
          count_only: { type: "boolean", description: "If true, return only count" }
        }
      }
    },
    {
      name: "get_projects",
      description: "Get user's projects with their status and details",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["Active", "Completed", "On Hold", "All"], description: "Filter by status" }
        }
      }
    },
    {
      name: "get_notes",
      description: "Get user's notes - search by title or list all",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Search in note titles and content" }
        }
      }
    },
    {
      name: "get_user_profile",
      description: "Get user's profile information (name, department, status, etc.)",
      parameters: {
        type: "object",
        properties: {}
      }
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
      name: "get_timesheets",
      description: "Get user's timesheet entries to analyze work hours and check attendance",
      parameters: {
        type: "object",
        properties: {
          start_date: { type: "string", description: "Start date in YYYY-MM-DD format" },
          end_date: { type: "string", description: "End date in YYYY-MM-DD format" }
        }
      }
    },
    {
      name: "check_late_status",
      description: "Check if user was late for work based on timesheet punch-in times",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "Date to check in YYYY-MM-DD format" },
          expected_start_time: { type: "string", description: "Expected start time in HH:MM format, default is 09:00" }
        },
        required: ["date"]
      }
    },
    {
      name: "get_calendar_events",
      description: "Get user's calendar events and tasks for a date range",
      parameters: {
        type: "object",
        properties: {
          start_date: { type: "string", description: "Start date in YYYY-MM-DD format" },
          end_date: { type: "string", description: "End date in YYYY-MM-DD format" }
        }
      }
    },
    {
      name: "create_student_class",
      description: "Create a class schedule entry for a student",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Class name" },
          instructor: { type: "string", description: "Instructor name" },
          location: { type: "string", description: "Class location" },
          day_of_week: { type: "number", description: "Day of week (0=Sunday, 1=Monday, 2=Tuesday, etc.)" },
          start_time: { type: "string", description: "Start time in HH:MM format" },
          end_time: { type: "string", description: "End time in HH:MM format" },
          color: { type: "string", description: "Hex color code for the class" }
        },
        required: ["name", "day_of_week", "start_time", "end_time"]
      }
    },
    {
      name: "add_note_to_calendar",
      description: "Add a note to a calendar event by searching for it by title or date",
      parameters: {
        type: "object",
        properties: {
          event_title: { type: "string", description: "Title of the event to update" },
          event_date: { type: "string", description: "Date of the event (YYYY-MM-DD format)" },
          note: { type: "string", description: "Note to add" }
        },
        required: ["note"]
      }
    },
    {
      name: "convert_document",
      description: "Convert documents between formats (PDF to Excel, Word to PDF, etc.)",
      parameters: {
        type: "object",
        properties: {
          source_format: { type: "string", description: "Source format (pdf, docx, excel, csv, md)" },
          target_format: { type: "string", description: "Target format (pdf, docx, excel, csv, md)" },
          content: { type: "string", description: "Content or description of what to convert" }
        },
        required: ["source_format", "target_format", "content"]
      }
    },
    {
      name: "generate_image",
      description: "Generate an image based on a detailed text description",
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "Detailed description of the image" }
        },
        required: ["prompt"]
      }
    },
    {
      name: "generate_document",
      description: "Generate essays, reports, or Excel spreadsheets",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["essay", "report", "excel", "spreadsheet"], description: "Document type" },
          prompt: { type: "string", description: "What the document should contain" }
        },
        required: ["type", "prompt"]
      }
    },
    {
      name: "find_sources",
      description: "Research a topic and suggest credible sources",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Topic to research" }
        },
        required: ["topic"]
      }
    },
    {
      name: "get_student_tasks",
      description: "Get student tasks - count, list, filter by status/priority",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["Todo", "In Progress", "Done", "All"], description: "Filter by status" },
          priority: { type: "string", enum: ["Low", "Medium", "High", "All"], description: "Filter by priority" },
          count_only: { type: "boolean", description: "If true, return only count" }
        }
      }
    },
    {
      name: "get_student_classes",
      description: "Get student's classes with schedule information",
      parameters: {
        type: "object",
        properties: {}
      }
    },
    {
      name: "get_student_assignments",
      description: "Get student assignments with status and type filters",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["pending", "in_progress", "completed", "submitted", "All"], description: "Filter by status" },
          type: { type: "string", enum: ["assignment", "exam", "quiz", "project", "All"], description: "Filter by type" }
        }
      }
    },
    {
      name: "get_student_profile",
      description: "Get student profile information (school, major, year)",
      parameters: {
        type: "object",
        properties: {}
      }
    },
    {
      name: "get_work_profile",
      description: "Get work profile information (company, job title, department)",
      parameters: {
        type: "object",
        properties: {}
      }
    },
    {
      name: "get_student_files",
      description: "Get student files - can filter by class or assignment",
      parameters: {
        type: "object",
        properties: {
          class_id: { type: "string", description: "Filter by class ID" },
          assignment_id: { type: "string", description: "Filter by assignment ID" }
        }
      }
    },
    {
      name: "get_work_files",
      description: "Get work files - can filter by project",
      parameters: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "Filter by project ID" }
        }
      }
    }
  ];

  // Build the parts for the message
  const messageParts: any[] = [{ text: systemPrompt + '\n\n' + message }];
  
  // Add files as inline data if present
  if (files && Array.isArray(files) && files.length > 0) {
    for (const file of files) {
      if (file.type && file.data) {
        // Extract base64 data (remove data URL prefix if present)
        let base64Data = file.data;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        
        // Determine MIME type
        let mimeType = file.type;
        if (file.type.startsWith('image/')) {
          // Add image inline data
          messageParts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
        } else if (file.type === 'application/pdf') {
          // PDF support
          messageParts.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data
            }
          });
        } else {
          // Try to send other file types
          messageParts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
        }
      }
    }
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: messageParts }
      ],
      tools: [{
        functionDeclarations: tools
      }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2000,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Gemini API error:', response.status, errorText);
    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: 'RATE_LIMIT', message: 'AI is temporarily rate-limited. Please try again shortly.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_ERROR', message: 'Gemini API error' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const result = await response.json();
  console.log('AI result:', JSON.stringify(result));
  
  if (!result.candidates || !result.candidates[0]) {
    console.error('Unexpected AI response format:', result);
    throw new Error('Invalid response from AI');
  }
  
  const candidate = result.candidates[0];
  const content = candidate.content;
  let aiResponse = content.parts.find((p: any) => p.text)?.text || '';
  let createdItems = [];

  // Handle function calls
  const functionCalls = content.parts.filter((p: any) => p.functionCall);
  if (functionCalls.length > 0) {
    console.log('Function calls detected:', functionCalls);
    
    for (const part of functionCalls) {
      const functionName = part.functionCall.name;
      const args = part.functionCall.args;
      
      console.log(`Executing tool: ${functionName}`, args);
      
      try {
        switch (functionName) {
          case 'get_tasks': {
            let query = supabase
              .from('tasks')
              .select('*')
              .eq('user_id', userId);
            
            if (args.status && args.status !== 'All') {
              query = query.eq('status', args.status);
            }
            if (args.priority && args.priority !== 'All') {
              query = query.eq('priority', args.priority);
            }
            
            const { data: tasks, error } = await query.order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (args.count_only) {
              aiResponse = `You have ${tasks?.length || 0} task${tasks?.length === 1 ? '' : 's'}${args.status && args.status !== 'All' ? ` with status "${args.status}"` : ''}${args.priority && args.priority !== 'All' ? ` with priority "${args.priority}"` : ''}.`;
            } else {
              const taskSummary = tasks?.slice(0, 10).map(t => `- ${t.title} (${t.status}, ${t.priority}${t.due_date ? ', due: ' + t.due_date : ''})`).join('\n') || 'No tasks found.';
              aiResponse = `You have ${tasks?.length || 0} task${tasks?.length === 1 ? '' : 's'}:\n\n${taskSummary}${tasks && tasks.length > 10 ? '\n\n...and ' + (tasks.length - 10) + ' more' : ''}`;
            }
            break;
          }
          
          case 'get_projects': {
            let query = supabase
              .from('projects')
              .select('*')
              .eq('user_id', userId);
            
            if (args.status && args.status !== 'All') {
              query = query.eq('status', args.status);
            }
            
            const { data: projects, error } = await query.order('created_at', { ascending: false });
            
            if (error) throw error;
            
            const projectSummary = projects?.map(p => `- ${p.name} (${p.status}${p.start_date ? ', started: ' + p.start_date : ''})`).join('\n') || 'No projects found.';
            aiResponse = `You have ${projects?.length || 0} project${projects?.length === 1 ? '' : 's'}:\n\n${projectSummary}`;
            break;
          }
          
          case 'get_notes': {
            let query = supabase
              .from('notes')
              .select('*')
              .eq('user_id', userId);
            
            if (args.search) {
              query = query.or(`title.ilike.%${args.search}%,content.ilike.%${args.search}%`);
            }
            
            const { data: notes, error } = await query.order('updated_at', { ascending: false }).limit(10);
            
            if (error) throw error;
            
            const noteSummary = notes?.map(n => `- ${n.title}${n.content ? ' - ' + n.content.substring(0, 50) + (n.content.length > 50 ? '...' : '') : ''}`).join('\n') || 'No notes found.';
            aiResponse = `Found ${notes?.length || 0} note${notes?.length === 1 ? '' : 's'}:\n\n${noteSummary}`;
            break;
          }
          
          case 'get_user_profile': {
            const { data: profile, error } = await supabase
              .from('users')
              .select('first_name, last_name, email, department, status')
              .eq('id', userId)
              .single();
            
            if (error) throw error;
            
            aiResponse = `Here's your profile:\nName: ${profile.first_name} ${profile.last_name}\nEmail: ${profile.email}\nDepartment: ${profile.department}\nStatus: ${profile.status}`;
            break;
          }
          
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
            createdItems[createdItems.length - 1].itemType = 'task';
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
            createdItems[createdItems.length - 1].itemType = 'note';
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
            createdItems[createdItems.length - 1].itemType = 'project';
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
            createdItems[createdItems.length - 1].itemType = 'calendar';
            break;
          }
          
          case 'get_timesheets': {
            const { data: timesheets, error } = await supabase
              .from('timesheets')
              .select('*')
              .eq('user_id', userId)
              .gte('date', args.start_date || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0])
              .lte('date', args.end_date || new Date().toISOString().split('T')[0])
              .order('date', { ascending: false });
            
            if (error) throw error;
            
            const totalHours = timesheets?.reduce((sum, t) => sum + parseFloat(t.hours || 0), 0) || 0;
            aiResponse = `Found ${timesheets?.length || 0} timesheet entries with ${totalHours.toFixed(2)} total hours.`;
            break;
          }
          
          case 'check_late_status': {
            const expectedTime = args.expected_start_time || '09:00';
            const { data: timesheets, error } = await supabase
              .from('timesheets')
              .select('*')
              .eq('user_id', userId)
              .eq('date', args.date)
              .order('created_at', { ascending: true })
              .limit(1);
            
            if (error) throw error;
            
            if (!timesheets || timesheets.length === 0) {
              aiResponse = `No timesheet entry found for ${args.date}. You may not have punched in that day.`;
            } else {
              const punchIn = new Date(timesheets[0].created_at);
              const punchTime = `${punchIn.getHours().toString().padStart(2, '0')}:${punchIn.getMinutes().toString().padStart(2, '0')}`;
              const expected = expectedTime.split(':').map(Number);
              const actual = [punchIn.getHours(), punchIn.getMinutes()];
              const isLate = actual[0] > expected[0] || (actual[0] === expected[0] && actual[1] > expected[1]);
              
              aiResponse = isLate 
                ? `Yes, you were late on ${args.date}. You punched in at ${punchTime}, expected was ${expectedTime}.`
                : `No, you were on time on ${args.date}! You punched in at ${punchTime}.`;
            }
            break;
          }
          
          case 'get_calendar_events': {
            const startDate = args.start_date || new Date().toISOString().split('T')[0];
            const endDate = args.end_date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
            
            const { data: events, error } = await supabase
              .from('tasks')
              .select('*')
              .eq('user_id', userId)
              .gte('due_date', startDate)
              .lte('due_date', endDate)
              .order('due_date', { ascending: true });
            
            if (error) throw error;
            
            if (!events || events.length === 0) {
              aiResponse = `You have no events scheduled between ${startDate} and ${endDate}.`;
            } else {
              const eventSummary = events.map(e => `- ${e.title} on ${e.due_date} (${e.status})`).join('\n');
              aiResponse = `You have ${events.length} event${events.length === 1 ? '' : 's'} scheduled:\n\n${eventSummary}`;
            }
            break;
          }
          
          case 'create_student_class': {
            const { data: studentClass, error } = await supabase
              .from('student_classes')
              .insert({
                user_id: userId,
                name: args.name,
                instructor: args.instructor || null,
                location: args.location || null,
                day_of_week: args.day_of_week,
                start_time: args.start_time,
                end_time: args.end_time,
                color: args.color || '#3b82f6'
              })
              .select()
              .single();
            
            if (error) throw error;
            
            createdItems.push({ type: 'student_class', item: studentClass });
            aiResponse = `✅ Class "${args.name}" added to your schedule!`;
            createdItems[createdItems.length - 1].itemType = 'class';
            break;
          }
          
          case 'add_note_to_calendar': {
            // Search for event by title or date
            let query = supabase
              .from('tasks')
              .select('*')
              .eq('user_id', userId);
            
            if (args.event_title) {
              query = query.ilike('title', `%${args.event_title}%`);
            }
            if (args.event_date) {
              query = query.eq('due_date', args.event_date);
            }
            
            const { data: events, error: fetchError } = await query.order('created_at', { ascending: false }).limit(5);
            
            if (fetchError) throw fetchError;
            if (!events || events.length === 0) {
              aiResponse = `I couldn't find any events matching "${args.event_title || args.event_date}". Could you be more specific?`;
              break;
            }
            
            // Update the most recent matching event
            const eventToUpdate = events[0];
            const updatedDescription = eventToUpdate.description 
              ? `${eventToUpdate.description}\n\n${args.note}`
              : args.note;
            
            const { error: updateError } = await supabase
              .from('tasks')
              .update({ description: updatedDescription })
              .eq('id', eventToUpdate.id)
              .eq('user_id', userId);
            
            if (updateError) throw updateError;
            
            aiResponse = `✅ Note added to "${eventToUpdate.title}"${eventToUpdate.due_date ? ` (${eventToUpdate.due_date})` : ''}`;
            break;
          }
          
          case 'generate_image': {
            // Use Lovable AI Gateway for image generation
            const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
            if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured');
            
            const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image-preview',
                messages: [
                  { role: 'user', content: args.prompt }
                ],
                modalities: ['image', 'text']
              }),
            });
            
            if (!imageResponse.ok) {
              const errorText = await imageResponse.text();
              console.error('Image generation error:', imageResponse.status, errorText);
              throw new Error('Image generation failed');
            }
            
            const imageResult = await imageResponse.json();
            const imageUrl = imageResult.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            
            if (!imageUrl) throw new Error('No image data returned');
            
            createdItems.push({ type: 'image', item: { url: imageUrl } });
            aiResponse = `✅ Image generated successfully!`;
            createdItems[createdItems.length - 1].itemType = 'image';
            break;
          }
          
          case 'generate_document': {
            let docPrompt = `Create a ${args.type}: ${args.prompt}`;
            
            const docResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: docPrompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 4000 }
              }),
            });
            
            if (!docResponse.ok) throw new Error('Document generation failed');
            
            const docResult = await docResponse.json();
            const docContent = docResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            const blob = new TextEncoder().encode(docContent);
            const base64 = btoa(String.fromCharCode(...blob));
            const extension = args.type === 'excel' || args.type === 'spreadsheet' ? 'csv' : 'md';
            
            createdItems.push({ 
              type: 'document', 
              item: { 
                content: docContent,
                download: `data:text/plain;base64,${base64}`,
                filename: `document_${Date.now()}.${extension}`
              } 
            });
            aiResponse = `✅ ${args.type} generated! You can download it.`;
            createdItems[createdItems.length - 1].itemType = 'document';
            break;
          }
          
          case 'convert_document': {
            const conversionPrompt = `Convert this ${args.source_format} content to ${args.target_format} format:\n\n${args.content}\n\nProvide the converted content in proper ${args.target_format} format.`;
            
            const convertResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: conversionPrompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 4000 }
              }),
            });
            
            if (!convertResponse.ok) throw new Error('Document conversion failed');
            
            const convertResult = await convertResponse.json();
            const convertedContent = convertResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            const blob = new TextEncoder().encode(convertedContent);
            const base64 = btoa(String.fromCharCode(...blob));
            const extension = args.target_format === 'excel' ? 'csv' : args.target_format === 'docx' ? 'md' : args.target_format;
            
            createdItems.push({ 
              type: 'document', 
              item: { 
                content: convertedContent,
                download: `data:text/plain;base64,${base64}`,
                filename: `converted_${Date.now()}.${extension}`
              } 
            });
            aiResponse = `✅ Document converted from ${args.source_format} to ${args.target_format}!`;
            createdItems[createdItems.length - 1].itemType = 'document';
            break;
          }
          
          case 'find_sources': {
            const sourcesPrompt = `Research the topic "${args.topic}" and provide 5 credible sources with brief descriptions. Format as: 1. [Source Name] - [Brief description and why it's credible]`;
            
            const sourcesResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: sourcesPrompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
              }),
            });
            
            if (!sourcesResponse.ok) throw new Error('Source finding failed');
            
            const sourcesResult = await sourcesResponse.json();
            const sources = sourcesResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            aiResponse = `Here are credible sources for "${args.topic}":\n\n${sources}`;
            break;
          }
          
          case 'get_student_tasks': {
            let query = supabase.from('student_tasks').select('*').eq('user_id', userId);
            
            if (args.status && args.status !== 'All') query = query.eq('status', args.status);
            if (args.priority && args.priority !== 'All') query = query.eq('priority', args.priority);
            
            const { data: tasks, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            
            if (args.count_only) {
              aiResponse = `You have ${tasks?.length || 0} student task${tasks?.length === 1 ? '' : 's'}.`;
            } else {
              const taskSummary = tasks?.slice(0, 10).map(t => `- ${t.title} (${t.status}, ${t.priority}${t.due_date ? ', due: ' + t.due_date : ''})`).join('\n') || 'No student tasks found.';
              aiResponse = `You have ${tasks?.length || 0} student task${tasks?.length === 1 ? '' : 's'}:\n\n${taskSummary}${tasks && tasks.length > 10 ? '\n\n...and ' + (tasks.length - 10) + ' more' : ''}`;
            }
            break;
          }
          
          case 'get_student_classes': {
            const { data: classes, error } = await supabase
              .from('student_classes')
              .select('*')
              .eq('user_id', userId)
              .order('day_of_week');
            
            if (error) throw error;
            
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const classSummary = classes?.map(c => 
              `- ${c.name} (${days[c.day_of_week]}, ${c.start_time}-${c.end_time})${c.instructor ? ' with ' + c.instructor : ''}${c.location ? ' at ' + c.location : ''}`
            ).join('\n') || 'No classes found.';
            aiResponse = `You have ${classes?.length || 0} class${classes?.length === 1 ? '' : 'es'}:\n\n${classSummary}`;
            break;
          }
          
          case 'get_student_assignments': {
            let query = supabase.from('student_assignments').select('*').eq('user_id', userId);
            
            if (args.status && args.status !== 'All') query = query.eq('status', args.status);
            if (args.type && args.type !== 'All') query = query.eq('type', args.type);
            
            const { data: assignments, error } = await query.order('due_date');
            if (error) throw error;
            
            const assignmentSummary = assignments?.map(a => 
              `- ${a.title} (${a.type}, ${a.status}) - Due: ${new Date(a.due_date).toLocaleDateString()}`
            ).join('\n') || 'No assignments found.';
            aiResponse = `You have ${assignments?.length || 0} assignment${assignments?.length === 1 ? '' : 's'}:\n\n${assignmentSummary}`;
            break;
          }
          
          case 'get_student_profile': {
            const { data: profile, error } = await supabase
              .from('student_profiles')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle();
            
            if (error) throw error;
            
            if (!profile) {
              aiResponse = "You don't have a student profile set up yet. Would you like to create one?";
            } else {
              aiResponse = `📚 Student Profile:\n- School: ${profile.school_name || 'Not set'}\n- Major: ${profile.major || 'Not set'}\n- Year: ${profile.year || 'Not set'}`;
            }
            break;
          }
          
          case 'get_work_profile': {
            const { data: profile, error } = await supabase
              .from('work_profiles')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle();
            
            if (error) throw error;
            
            if (!profile) {
              aiResponse = "You don't have a work profile set up yet. Would you like to create one?";
            } else {
              aiResponse = `💼 Work Profile:\n- Company: ${profile.company_name || 'Not set'}\n- Job Title: ${profile.job_title || 'Not set'}\n- Department: ${profile.department || 'Not set'}`;
            }
            break;
          }
          
          case 'get_student_files': {
            let query = supabase.from('student_files').select('*').eq('user_id', userId);
            
            if (args.class_id) query = query.eq('class_id', args.class_id);
            if (args.assignment_id) query = query.eq('assignment_id', args.assignment_id);
            
            const { data: files, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            
            const fileSummary = files?.slice(0, 10).map(f => 
              `- ${f.file_name} (${f.file_type || 'unknown'})${f.tags ? ' - Tags: ' + f.tags.join(', ') : ''}`
            ).join('\n') || 'No student files found.';
            aiResponse = `You have ${files?.length || 0} student file${files?.length === 1 ? '' : 's'}:\n\n${fileSummary}${files && files.length > 10 ? '\n\n...and ' + (files.length - 10) + ' more' : ''}`;
            break;
          }
          
          case 'get_work_files': {
            let query = supabase.from('work_files').select('*').eq('user_id', userId);
            
            if (args.project_id) query = query.eq('project_id', args.project_id);
            
            const { data: files, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            
            const fileSummary = files?.slice(0, 10).map(f => 
              `- ${f.file_name} (${f.file_type || 'unknown'})${f.tags ? ' - Tags: ' + f.tags.join(', ') : ''}`
            ).join('\n') || 'No work files found.';
            aiResponse = `You have ${files?.length || 0} work file${files?.length === 1 ? '' : 's'}:\n\n${fileSummary}${files && files.length > 10 ? '\n\n...and ' + (files.length - 10) + ' more' : ''}`;
            break;
          }
        }
      } catch (error: any) {
        console.error(`Error executing ${functionName}:`, error);
        aiResponse = `I had trouble with that request. Please try again.`;
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

async function generateImage(data: any) {
  const { message } = data;
  
  console.log('Generating image with prompt:', message);
  
  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: message }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation API error:', response.status, errorText);
      throw new Error('Failed to generate image');
    }

    const result = await response.json();
    console.log('Image generation result received');
    
    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image data in response');
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Image generated successfully!',
      image: imageUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error(`[${errorId}] Error generating image:`, error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to generate image. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}