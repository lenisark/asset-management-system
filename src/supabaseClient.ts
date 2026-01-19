import { createClient } from '@supabase/supabase-js';

// Supabase 설정
// 환경 변수를 사용하거나 직접 입력하세요
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 테이블 이름
export const TABLES = {
  ASSETS: 'assets',
  TRANSACTIONS: 'transactions',
} as const;
