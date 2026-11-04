import * as XLSX from 'xlsx';
import { Student, GameItem, GameRoom, GameAttempt, ClassItem, Question } from '../types';

// API client interacting with the Express backend
export const api = {
  async getDb() {
    try {
      const res = await fetch('/api/db');
      const data = await res.json();
      return data.data;
    } catch (e) {
      console.warn('Backend fetch failed, using fallback mock', e);
      return null;
    }
  },

  async getClasses(): Promise<ClassItem[]> {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      return data.classes || [];
    } catch {
      return [];
    }
  },

  async addClass(classData: Partial<ClassItem>): Promise<ClassItem | null> {
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      const data = await res.json();
      return data.class;
    } catch {
      return null;
    }
  },

  async getStudents(params?: { classId?: string; grade?: number }): Promise<Student[]> {
    try {
      const query = new URLSearchParams();
      if (params?.classId) query.set('classId', params.classId);
      if (params?.grade) query.set('grade', params.grade.toString());
      const res = await fetch(`/api/students?${query.toString()}`);
      const data = await res.json();
      return data.students || [];
    } catch {
      return [];
    }
  },

  async addStudent(student: Partial<Student>): Promise<Student | null> {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      const data = await res.json();
      return data.student;
    } catch {
      return null;
    }
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      return data.student;
    } catch {
      return null;
    }
  },

  async deleteStudent(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  async bulkAddStudents(students: Partial<Student>[]): Promise<boolean> {
    try {
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students })
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  async getGames(): Promise<GameItem[]> {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      return data.games || [];
    } catch {
      return [];
    }
  },

  async uploadGameFile(fileName: string, fileData: string, fileType: string): Promise<{ success: boolean; fileUrl?: string; fileName?: string; fileType?: 'powerpoint' | 'html' | 'embed'; fileSize?: string; message?: string }> {
    try {
      const res = await fetch('/api/games/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileData, fileType })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Lỗi tải tệp: ' + err.message };
    }
  },

  async addGame(game: Partial<GameItem>): Promise<GameItem | null> {
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game)
      });
      const data = await res.json();
      return data.game;
    } catch {
      return null;
    }
  },

  async updateGame(id: string, updates: Partial<GameItem>): Promise<GameItem | null> {
    try {
      const res = await fetch(`/api/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      return data.game;
    } catch {
      return null;
    }
  },

  async deleteGame(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  async getRooms(): Promise<GameRoom[]> {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      return data.rooms || [];
    } catch {
      return [];
    }
  },

  async createRoom(room: Partial<GameRoom>): Promise<GameRoom | null> {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
      });
      const data = await res.json();
      return data.room;
    } catch {
      return null;
    }
  },

  async verifyRoom(code: string): Promise<{ success: boolean; room?: GameRoom; message?: string }> {
    try {
      const res = await fetch(`/api/rooms/verify/${code}`);
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối kiểm tra mã phòng' };
    }
  },

  async getAttempts(params?: { studentCode?: string; roomCode?: string; className?: string }): Promise<GameAttempt[]> {
    try {
      const query = new URLSearchParams();
      if (params?.studentCode) query.set('studentCode', params.studentCode);
      if (params?.roomCode) query.set('roomCode', params.roomCode);
      if (params?.className) query.set('className', params.className);
      const res = await fetch(`/api/attempts?${query.toString()}`);
      const data = await res.json();
      return data.attempts || [];
    } catch {
      return [];
    }
  },

  async saveAttempt(attempt: Partial<GameAttempt>): Promise<GameAttempt | null> {
    try {
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt)
      });
      const data = await res.json();
      return data.attempt;
    } catch {
      return null;
    }
  },

  async generateAiQuestions(params: {
    grade: number;
    topic: string;
    questionType: string;
    difficulty: string;
    count: number;
    customPrompt?: string;
  }): Promise<{ success: boolean; questions: Question[]; source?: string; message?: string }> {
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch {
      return { success: false, questions: [], message: 'Không thể kết nối máy chủ AI' };
    }
  },

  async teacherLogin(passcode: string): Promise<{ success: boolean; profile?: any; message?: string }> {
    try {
      const res = await fetch('/api/auth/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Lỗi kết nối máy chủ xác thực' };
    }
  },

  async updateTeacherPassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/teacher-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Lỗi máy chủ' };
    }
  },

  async testSupabase(url: string, anonKey: string): Promise<{ success: boolean; message: string; hasTables?: boolean }> {
    try {
      const res = await fetch('/api/supabase/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, anonKey })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: 'Không thể kết nối đến máy chủ API kiểm tra Supabase' };
    }
  },

  async getSupabaseStatus(): Promise<{ configured: boolean; connected: boolean; url?: string; message: string }> {
    try {
      const res = await fetch('/api/supabase/status');
      return await res.json();
    } catch {
      return { configured: false, connected: false, message: 'Không thể lấy trạng thái Supabase' };
    }
  },

  async deleteRoom(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  async getRoomLeaderboard(code: string): Promise<GameAttempt[]> {
    try {
      const res = await fetch(`/api/rooms/${code}/leaderboard`);
      const data = await res.json();
      return data.leaderboard || [];
    } catch {
      return [];
    }
  },

  async getQuestions(params?: { grade?: number }): Promise<Question[]> {
    try {
      const query = params?.grade ? `?grade=${params.grade}` : '';
      const res = await fetch(`/api/questions${query}`);
      const data = await res.json();
      return data.questions || [];
    } catch {
      return [];
    }
  },

  async addQuestion(question: Partial<Question>): Promise<Question | null> {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question)
      });
      const data = await res.json();
      return data.question;
    } catch {
      return null;
    }
  },

  async deleteQuestion(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }
};

// -------------------------------------------------------------
// EXCEL UTILITIES (XLSX)
// -------------------------------------------------------------
export const excelService = {
  exportStudents(students: Student[], fileName = 'Danh_sach_hoc_sinh_THPT_Dan_Phuong.xlsx') {
    const data = students.map((s, idx) => ({
      'STT': idx + 1,
      'Mã học sinh': s.code,
      'Họ và tên': s.name,
      'Lớp': s.classId,
      'Khối': s.grade,
      'Tài khoản': s.username,
      'Trạng thái': s.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa',
      'Tổng điểm': s.totalPoints,
      'Số lượt chơi': s.gamesPlayed,
      'Danh hiệu': s.badge || 'Tân thủ'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Học sinh');
    XLSX.writeFile(workbook, fileName);
  },

  exportAttempts(attempts: GameAttempt[], fileName = 'Bao_cao_ket_qua_TOAN_GAME_HUB.xlsx') {
    const data = attempts.map((a, idx) => ({
      'STT': idx + 1,
      'Mã học sinh': a.studentCode,
      'Họ và tên': a.studentName,
      'Lớp': a.className,
      'Tên trò chơi': a.gameTitle,
      'Mã phòng': a.roomCode || 'Tự do',
      'Điểm số': a.score,
      'Số câu đúng': a.correctCount,
      'Số câu sai': a.incorrectCount,
      'Tổng câu hỏi': a.totalQuestions,
      'Thời gian làm bài (giây)': a.durationSeconds,
      'Thời gian hoàn thành': new Date(a.endedAt).toLocaleString('vi-VN')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kết quả thi đấu');
    XLSX.writeFile(workbook, fileName);
  },

  async importStudentsFromFile(file: File): Promise<Partial<Student>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: any[] = XLSX.utils.sheet_to_json(firstSheet);

          const students: Partial<Student>[] = rows.map((r, idx) => ({
            code: r['Mã học sinh'] || r['Mã HS'] || r['code'] || `HS${1000 + idx}`,
            name: r['Họ và tên'] || r['Họ tên'] || r['name'] || 'Học sinh mới',
            classId: r['Lớp'] || r['classId'] || '10A1',
            grade: Number(r['Khối'] || (r['Lớp'] ? r['Lớp'].substring(0, 2) : 10)) || 10,
            username: r['Tài khoản'] || r['username'] || `hs_${idx}`,
            status: 'active',
            totalPoints: 0,
            gamesPlayed: 0
          }));

          resolve(students);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
};

// Supabase Schema SQL Template for Section 11 export
export const SUPABASE_SCHEMA_SQL = `
-- ===================================================================
-- TOAN GAME HUB - THPT ĐAN PHƯỢNG (GIÁO VIÊN BÙI NGỌC THẮNG)
-- SUPABASE POSTGRESQL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- 1. Profiles (Giáo viên & Học sinh)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
  class_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes (Lớp học)
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade INT NOT NULL CHECK (grade IN (10, 11, 12)),
  student_count INT DEFAULT 0,
  homeroom_teacher TEXT DEFAULT 'Thầy Bùi Ngọc Thắng',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students (Học sinh)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  grade INT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'locked')),
  total_points INT DEFAULT 0,
  games_played INT DEFAULT 0,
  badge TEXT DEFAULT 'Tân thủ',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Games (Kho trò chơi)
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  grade TEXT DEFAULT 'all',
  topic TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Trung bình',
  questions_count INT DEFAULT 10,
  duration_minutes INT DEFAULT 10,
  max_score INT DEFAULT 100,
  active BOOLEAN DEFAULT TRUE,
  description TEXT,
  color TEXT DEFAULT '#0878DC',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Questions (Ngân hàng câu hỏi Toán)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  grade INT DEFAULT 12,
  topic TEXT,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Game Rooms (Phòng thi đấu trực tuyến)
CREATE TABLE IF NOT EXISTS game_rooms (
  id TEXT PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  classes JSONB NOT NULL DEFAULT '["10A1"]',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_attempts INT DEFAULT 1,
  allow_replay BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_by TEXT DEFAULT 'Thầy Bùi Ngọc Thắng',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Game Attempts (Lịch sử từng lượt chơi)
CREATE TABLE IF NOT EXISTS game_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  game_id TEXT NOT NULL,
  game_title TEXT NOT NULL,
  room_code VARCHAR(6),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INT DEFAULT 0,
  total_questions INT DEFAULT 10,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  score INT DEFAULT 0,
  status TEXT DEFAULT 'completed'
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read public games and leaderboard
CREATE POLICY "Public games read" ON games FOR SELECT USING (active = true);
CREATE POLICY "Public leaderboard read" ON students FOR SELECT USING (true);
CREATE POLICY "Public attempts create" ON game_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public attempts read" ON game_attempts FOR SELECT USING (true);
`;
