import { createClient } from '@supabase/supabase-js';

// Essas variáveis de ambiente devem ser configuradas no arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cria o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do Supabase
export type Survey = {
  id: number;
  question: string;
  question_type: 'experience' | 'frequency' | 'variety' | 'quality' | 'service' | 'recommend' | 'custom';
  order: number;
  active: boolean;
  created_at: string;
};

export type SurveyOption = {
  id: number;
  survey_id: number;
  text: string;
  value: number;
  order: number;
};

export type SurveyResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
  comments: string;
  created_at: string;
};

export type SurveyAnswer = {
  id: number;
  response_id: number;
  survey_id: number;
  rating: number;
  created_at: string;
};