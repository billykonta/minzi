import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Types for student dashboard data
export type StudyTask = {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  completed: boolean;
  time: string;
  current?: boolean;
  description?: string;
  resources?: string[];
};

export type Subject = {
  id: string;
  name: string;
  progress: number;
  nextSession: string;
  alert: boolean;
  alertMessage?: string;
  topics: number;
  topicsCompleted: number;
  color?: string;
  examDates?: { title: string; date: string }[];
};

export type Activity = {
  id: string;
  type: 'chat' | 'quiz' | 'flashcard' | 'summary' | 'study' | 'note';
  title: string;
  time: string;
  icon: string;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
  subjectId?: string;
  details?: string;
};

export type StudentStats = {
  streak: number;
  studyTime: number;
  xp: number;
  level: number;
  progress: number;
  totalTasksCompleted: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  focusTime: number[];
  subjectDistribution: { name: string; value: number }[];
};

// Functions to fetch and update student dashboard data
export async function getStudentStats(userId: string): Promise<StudentStats> {
  // Define default stats object to use as fallback
  const defaultStats: StudentStats = {
    streak: 0,
    studyTime: 0,
    xp: 0,
    level: 1,
    progress: 0,
    totalTasksCompleted: 0,
    totalQuizzesCompleted: 0,
    averageScore: 0,
    focusTime: [0, 0, 0, 0, 0, 0, 0],
    subjectDistribution: []
  };
  
  try {
    // First, try to get existing stats
    const { data, error } = await supabase
      .from('student_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record exists
    
    // If we got data back, return it
    if (data) {
      return {
        streak: data.streak || 0,
        studyTime: data.study_time || 0,
        xp: data.xp || 0,
        level: data.level || 1,
        progress: data.progress || 0,
        totalTasksCompleted: data.total_tasks_completed || 0,
        totalQuizzesCompleted: data.total_quizzes_completed || 0,
        averageScore: data.average_score || 0,
        focusTime: data.focus_time || [0, 0, 0, 0, 0, 0, 0],
        subjectDistribution: data.subject_distribution || []
      };
    }
    
    // If no data exists, create a new record
    console.log('No student stats found, creating new record');
    
    // Prepare data for insertion
    const newStatsRecord = {
      user_id: userId,
      streak: 0,
      study_time: 0,
      xp: 0,
      level: 1,
      progress: 0,
      total_tasks_completed: 0,
      total_quizzes_completed: 0,
      average_score: 0,
      focus_time: [0, 0, 0, 0, 0, 0, 0],
      subject_distribution: []
    };
    
    // Insert new record
    const { error: insertError } = await supabase
      .from('student_stats')
      .insert(newStatsRecord);
    
    if (insertError) {
      console.error('Error creating student stats:', insertError);
    }
    
    // Return default stats regardless of insert success
    // This ensures the UI works even if the insert fails
    return defaultStats;
  } catch (error) {
    console.error('Error in getStudentStats:', error);
    // Return default values if there's any error
    return defaultStats;
  }
}

export async function getStudyTasks(userId: string): Promise<StudyTask[]> {
  try {
    const { data, error } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('time', { ascending: true });
    
    if (error) throw error;
    
    return data.map(task => ({
      id: task.id,
      subject: task.subject,
      topic: task.topic,
      duration: task.duration,
      completed: task.completed,
      time: task.time,
      current: task.current,
      description: task.description,
      resources: task.resources
    }));
  } catch (error) {
    console.error('Error fetching study tasks:', error);
    return [];
  }
}

export async function getSubjects(userId: string): Promise<Subject[]> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(subject => ({
      id: subject.id,
      name: subject.name,
      progress: subject.progress,
      nextSession: subject.next_session,
      alert: subject.alert,
      alertMessage: subject.alert_message,
      topics: subject.topics,
      topicsCompleted: subject.topics_completed,
      color: subject.color,
      examDates: subject.exam_dates
    }));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

export async function getRecentActivities(userId: string): Promise<Activity[]> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    return data.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      time: activity.time,
      icon: activity.icon,
      iconColor: activity.icon_color,
      badge: activity.badge,
      badgeColor: activity.badge_color,
      subjectId: activity.subject_id,
      details: activity.details
    }));
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

export async function updateStudyTask(taskId: string, updates: Partial<StudyTask>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('study_tasks')
      .update(updates)
      .eq('id', taskId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating study task:', error);
    return false;
  }
}

export async function createStudyTask(userId: string, task: Omit<StudyTask, 'id'>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('study_tasks')
      .insert([{ ...task, user_id: userId }])
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error creating study task:', error);
    return null;
  }
}

export async function updateStudentStats(userId: string, updates: Partial<StudentStats>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('student_stats')
      .update(updates)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating student stats:', error);
    return false;
  }
}

export async function logActivity(userId: string, activity: Omit<Activity, 'id'>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .insert([{ ...activity, user_id: userId, created_at: new Date().toISOString() }])
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
}

// Helper functions for student dashboard
export function calculateLevelFromXP(xp: number): { level: number; progress: number } {
  // Base XP needed for level 1
  const baseXP = 1000;
  // XP growth factor per level
  const growthFactor = 1.5;
  
  // If XP is less than base, they're still level 1 with partial progress
  if (xp < baseXP) {
    return {
      level: 1,
      progress: Math.floor((xp / baseXP) * 100)
    };
  }
  
  let level = 1;
  let xpForCurrentLevel = baseXP;
  let xpForNextLevel = Math.floor(baseXP * growthFactor);
  let accumulatedXP = 0;
  
  while (xp >= accumulatedXP + xpForCurrentLevel) {
    accumulatedXP += xpForCurrentLevel;
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel = Math.floor(xpForCurrentLevel * growthFactor);
  }
  
  // Calculate progress to next level
  const xpIntoCurrentLevel = xp - accumulatedXP;
  const progress = Math.floor((xpIntoCurrentLevel / xpForCurrentLevel) * 100);
  
  return { level, progress };
}

export function formatStudyTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

export function getIconForActivityType(type: string): string {
  switch (type) {
    case 'chat': return 'MessageCircle';
    case 'quiz': return 'Trophy';
    case 'flashcard': return 'FlashCard';
    case 'summary': return 'BookOpen';
    case 'study': return 'Clock';
    case 'note': return 'PenLine';
    default: return 'Activity';
  }
}

export function getColorForActivityType(type: string): string {
  switch (type) {
    case 'chat': return 'text-blue-500';
    case 'quiz': return 'text-yellow-500';
    case 'flashcard': return 'text-purple-500';
    case 'summary': return 'text-teal-500';
    case 'study': return 'text-green-500';
    case 'note': return 'text-orange-500';
    default: return 'text-gray-500';
  }
}

export function getSubjectColor(subjectName: string): string {
  const subjectColors: Record<string, string> = {
    'mathematics': '#4C51BF', // indigo-700
    'physics': '#2B6CB0', // blue-700
    'chemistry': '#2C7A7B', // teal-700
    'biology': '#2F855A', // green-700
    'computer science': '#6B46C1', // purple-700
    'english': '#B7791F', // yellow-700
    'history': '#C05621', // orange-700
    'geography': '#00796B', // teal-800
    'economics': '#9C27B0', // purple-600
    'psychology': '#E53E3E', // red-600
    'philosophy': '#718096', // gray-600
    'art': '#D53F8C', // pink-600
    'music': '#805AD5', // purple-500
    'physical education': '#38A169', // green-600
  };
  
  const normalizedSubject = subjectName.toLowerCase();
  
  for (const [subject, color] of Object.entries(subjectColors)) {
    if (normalizedSubject.includes(subject)) {
      return color;
    }
  }
  
  return '#4A5568'; // Default color (gray-700)
}
