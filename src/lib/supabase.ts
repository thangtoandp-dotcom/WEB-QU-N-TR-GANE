import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Uses Vite environment variables if defined, with safe fallback to provided project credentials
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://acdvkdsvpwdggkaukjmk.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_u1yHdyKLgTKrwQisonv6Rg_PEmxawh5';

/**
 * Supabase client instance for TOAN GAME HUB
 * Used for authentication, realtime subscriptions, and database queries
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/**
 * Kiểm tra kết nối tới Supabase và thông báo trạng thái
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  hasTables?: boolean;
}> {
  try {
    // Thử truy vấn bảng students
    const { data, error } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true });

    if (error) {
      // Mã lỗi 42P01: Bảng chưa được tạo trong Supabase
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: true,
          hasTables: false,
          message: 'Kết nối máy chủ Supabase thành công! Cần chạy mã SQL khởi tạo các bảng dữ liệu trên Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        hasTables: false,
        message: `Lỗi kết nối Supabase: ${error.message} (Mã: ${error.code})`
      };
    }

    return {
      success: true,
      hasTables: true,
      message: 'Kết nối Supabase hoàn toàn thành công! Dữ liệu đã sẵn sàng đồng bộ trực tuyến.'
    };
  } catch (err: any) {
    return {
      success: false,
      hasTables: false,
      message: `Không thể kết nối đến máy chủ Supabase: ${err.message || 'Lỗi mạng'}`
    };
  }
}

/**
 * Mã SQL chuẩn để Thầy Bùi Ngọc Thắng chạy trong Supabase SQL Editor
 * Nhằm khởi tạo 6 bảng dữ liệu cần thiết cho TOAN GAME HUB
 */
export const SUPABASE_INIT_SQL = `-- TOAN GAME HUB - THPT ĐAN PHƯỢNG
-- SCRIPT KHỞI TẠO BẢNG CƠ SỞ DỮ LIỆU TRÊN SUPABASE (SQL EDITOR)
-- Giáo viên phụ trách: Bùi Ngọc Thắng

-- 1. Bảng danh sách học sinh (students)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    total_score NUMERIC DEFAULT 0,
    games_played INT DEFAULT 0,
    badge TEXT DEFAULT 'Học viên chăm chỉ',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng danh sách lớp học (classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade INT NOT NULL,
    student_count INT DEFAULT 0,
    teacher_name TEXT DEFAULT 'Bùi Ngọc Thắng',
    avg_score NUMERIC DEFAULT 8.5
);

-- 3. Bảng kho trò chơi (games)
CREATE TABLE IF NOT EXISTS public.games (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    category_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    questions_count INT DEFAULT 10,
    duration_minutes INT DEFAULT 15,
    max_score INT DEFAULT 100,
    active BOOLEAN DEFAULT TRUE,
    description TEXT,
    color TEXT DEFAULT '#0878DC',
    bg_card TEXT,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size TEXT,
    embed_code TEXT,
    is_uploaded BOOLEAN DEFAULT FALSE,
    author_name TEXT DEFAULT 'Bùi Ngọc Thắng',
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng phòng thi đấu trực tuyến (rooms)
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    game_id TEXT NOT NULL,
    game_title TEXT NOT NULL,
    classes JSONB DEFAULT '[]'::jsonb,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    max_attempts INT DEFAULT 1,
    allow_replay BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    participants_count INT DEFAULT 0,
    created_by TEXT DEFAULT 'Bùi Ngọc Thắng',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng lịch sử làm bài & kết quả thi (attempts)
CREATE TABLE IF NOT EXISTS public.attempts (
    id TEXT PRIMARY KEY,
    student_code TEXT NOT NULL,
    student_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    game_id TEXT NOT NULL,
    game_title TEXT NOT NULL,
    room_code TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    total_questions INT DEFAULT 10,
    correct_count INT DEFAULT 0,
    incorrect_count INT DEFAULT 0,
    score NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật tính năng Row Level Security (RLS) để công khai đọc/ghi an toàn
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- Xóa chính sách cũ nếu đã tồn tại để tránh lỗi 42710 (policy already exists)
DROP POLICY IF EXISTS "Public read students" ON public.students;
DROP POLICY IF EXISTS "Public insert students" ON public.students;
DROP POLICY IF EXISTS "Public update students" ON public.students;
DROP POLICY IF EXISTS "Public delete students" ON public.students;
DROP POLICY IF EXISTS "Cho phép đọc students" ON public.students;
DROP POLICY IF EXISTS "Cho phép ghi students" ON public.students;

DROP POLICY IF EXISTS "Public read classes" ON public.classes;
DROP POLICY IF EXISTS "Public insert classes" ON public.classes;
DROP POLICY IF EXISTS "Public update classes" ON public.classes;
DROP POLICY IF EXISTS "Public delete classes" ON public.classes;
DROP POLICY IF EXISTS "Cho phép đọc classes" ON public.classes;
DROP POLICY IF EXISTS "Cho phép ghi classes" ON public.classes;

DROP POLICY IF EXISTS "Public read games" ON public.games;
DROP POLICY IF EXISTS "Public insert games" ON public.games;
DROP POLICY IF EXISTS "Public update games" ON public.games;
DROP POLICY IF EXISTS "Public delete games" ON public.games;
DROP POLICY IF EXISTS "Cho phép đọc games" ON public.games;
DROP POLICY IF EXISTS "Cho phép ghi games" ON public.games;

DROP POLICY IF EXISTS "Public read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public delete rooms" ON public.rooms;
DROP POLICY IF EXISTS "Cho phép đọc rooms" ON public.rooms;
DROP POLICY IF EXISTS "Cho phép ghi rooms" ON public.rooms;

DROP POLICY IF EXISTS "Public read attempts" ON public.attempts;
DROP POLICY IF EXISTS "Public insert attempts" ON public.attempts;
DROP POLICY IF EXISTS "Public update attempts" ON public.attempts;
DROP POLICY IF EXISTS "Public delete attempts" ON public.attempts;
DROP POLICY IF EXISTS "Cho phép đọc attempts" ON public.attempts;
DROP POLICY IF EXISTS "Cho phép ghi attempts" ON public.attempts;

-- Tạo chính sách cho phép truy cập đầy đủ (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public insert students" ON public.students FOR ALL USING (true);

CREATE POLICY "Public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Public insert classes" ON public.classes FOR ALL USING (true);

CREATE POLICY "Public read games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Public insert games" ON public.games FOR ALL USING (true);

CREATE POLICY "Public read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Public insert rooms" ON public.rooms FOR ALL USING (true);

CREATE POLICY "Public read attempts" ON public.attempts FOR SELECT USING (true);
CREATE POLICY "Public insert attempts" ON public.attempts FOR ALL USING (true);
`;
