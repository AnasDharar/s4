import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Environment variables for Supabase
const supabaseUrl = process.env.SUPABASE_PROJECT_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export interface Participant {
  id: string;
  name: string;
  college_name: string;
  registered_at: string;
  level1_completed: boolean;
  level1_url?: string | null;
  level1_completed_at?: string | null;
  level2_completed: boolean;
  level2_completed_at?: string | null;
  level3_completed: boolean;
  level3_completed_at?: string | null;
  total_completed: number;
}

export interface VerificationLog {
  id: string;
  user_id: string;
  user_name: string;
  college_name: string;
  url: string;
  status: 'SUCCESS' | 'FAILED';
  level?: number;
  section_match?: boolean;
  h3_match?: boolean;
  hash_match?: boolean;
  metadata_match?: boolean;
  eyebrow_match?: boolean;
  title_match?: boolean;
  error_message?: string | null;
  created_at: string;
}

// Local JSON Storage Fallback Handlers
const DATA_DIR = path.join(process.cwd(), 'data');
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PARTICIPANTS_FILE)) {
    fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify([]), 'utf-8');
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([]), 'utf-8');
  }
}

function getLocalParticipants(): Participant[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(PARTICIPANTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalParticipants(data: Participant[]) {
  ensureDataDir();
  fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getLocalLogs(): VerificationLog[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(LOGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalLogs(data: VerificationLog[]) {
  ensureDataDir();
  fs.writeFileSync(LOGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function createParticipant(name: string, collegeName: string): Promise<Participant> {
  const newParticipant: Participant = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    college_name: collegeName.trim(),
    registered_at: new Date().toISOString(),
    level1_completed: false,
    level1_url: null,
    level1_completed_at: null,
    level2_completed: false,
    level2_completed_at: null,
    level3_completed: false,
    level3_completed_at: null,
    total_completed: 0,
  };

  const locals = getLocalParticipants();
  locals.push(newParticipant);
  saveLocalParticipants(locals);

  if (supabase) {
    try {
      const { error } = await supabase.from('participants').insert([newParticipant]);
      if (error) {
        console.warn('Supabase insert participant warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase exception:', err);
    }
  }

  return newParticipant;
}

export async function getParticipant(id: string): Promise<Participant | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('participants').select('*').eq('id', id).single();
      if (!error && data) {
        return data as Participant;
      }
    } catch {
      // Fallback
    }
  }

  const locals = getLocalParticipants();
  return locals.find(p => p.id === id) || null;
}

export async function updateParticipantLevel1(
  userId: string,
  websiteUrl: string,
  completedAt: string
): Promise<Participant | null> {
  const locals = getLocalParticipants();
  const index = locals.findIndex(p => p.id === userId);
  let updatedItem: Participant | null = null;

  if (index !== -1) {
    const totalComp = Math.max(locals[index].total_completed || 0, locals[index].level2_completed ? 2 : 1);
    locals[index] = {
      ...locals[index],
      level1_completed: true,
      level1_url: websiteUrl,
      level1_completed_at: completedAt,
      total_completed: totalComp,
    };
    saveLocalParticipants(locals);
    updatedItem = locals[index];
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .update({
          level1_completed: true,
          level1_url: websiteUrl,
          level1_completed_at: completedAt,
          total_completed: updatedItem?.total_completed || 1
        })
        .eq('id', userId)
        .select()
        .single();

      if (!error && data) {
        return data as Participant;
      }
    } catch (err) {
      console.warn('Supabase level1 update warning:', err);
    }
  }

  return updatedItem;
}

export async function updateParticipantLevel2(
  userId: string,
  imageUrl: string,
  completedAt: string
): Promise<Participant | null> {
  const locals = getLocalParticipants();
  const index = locals.findIndex(p => p.id === userId);
  let updatedItem: Participant | null = null;

  if (index !== -1) {
    locals[index] = {
      ...locals[index],
      level2_completed: true,
      level2_completed_at: completedAt,
      total_completed: Math.max(locals[index].total_completed || 0, 2),
    };
    saveLocalParticipants(locals);
    updatedItem = locals[index];
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .update({
          level2_completed: true,
          level2_completed_at: completedAt,
          total_completed: 2
        })
        .eq('id', userId)
        .select()
        .single();

      if (!error && data) {
        return data as Participant;
      }
    } catch (err) {
      console.warn('Supabase level2 update warning:', err);
    }
  }

  return updatedItem;
}

export async function addVerificationLog(log: Omit<VerificationLog, 'id' | 'created_at'>): Promise<VerificationLog> {
  const newLog: VerificationLog = {
    ...log,
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
  };

  const logs = getLocalLogs();
  logs.unshift(newLog);
  saveLocalLogs(logs);

  if (supabase) {
    try {
      const { error } = await supabase.from('verification_logs').insert([newLog]);
      if (error) {
        console.warn('Supabase log insert warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase log insert exception:', err);
    }
  }

  return newLog;
}

export async function getLeaderboard(): Promise<Participant[]> {
  let list: Participant[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('total_completed', { ascending: false })
        .order('level2_completed_at', { ascending: true, nullsFirst: false })
        .order('level1_completed_at', { ascending: true, nullsFirst: false })
        .order('registered_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Participant[];
      }
    } catch (err) {
      console.warn('Supabase leaderboard fetch warning:', err);
    }
  }

  list = getLocalParticipants();

  return list.sort((a, b) => {
    // 1. Total levels completed DESC
    const countA = a.total_completed || (a.level2_completed ? 2 : a.level1_completed ? 1 : 0);
    const countB = b.total_completed || (b.level2_completed ? 2 : b.level1_completed ? 1 : 0);
    if (countA !== countB) return countB - countA;

    // 2. Level 2 completion timestamp ASC
    if (a.level2_completed && b.level2_completed) {
      const t2A = a.level2_completed_at ? new Date(a.level2_completed_at).getTime() : Infinity;
      const t2B = b.level2_completed_at ? new Date(b.level2_completed_at).getTime() : Infinity;
      if (t2A !== t2B) return t2A - t2B;
    }

    // 3. Level 1 completion timestamp ASC
    if (a.level1_completed && b.level1_completed) {
      const t1A = a.level1_completed_at ? new Date(a.level1_completed_at).getTime() : Infinity;
      const t1B = b.level1_completed_at ? new Date(b.level1_completed_at).getTime() : Infinity;
      if (t1A !== t1B) return t1A - t1B;
    }

    const regA = new Date(a.registered_at).getTime();
    const regB = new Date(b.registered_at).getTime();
    return regA - regB;
  });
}

export async function getUserLogs(userId: string): Promise<VerificationLog[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('verification_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as VerificationLog[];
      }
    } catch {
      // Fallback
    }
  }

  const logs = getLocalLogs();
  return logs.filter(l => l.user_id === userId);
}
