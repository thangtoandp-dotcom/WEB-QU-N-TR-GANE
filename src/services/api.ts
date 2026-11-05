import * as XLSX from 'xlsx';
import { Student, GameItem, GameRoom, GameAttempt, ClassItem, Question, GameCategory } from '../types';
import { supabase } from '../lib/supabase';

// API client interacting with Supabase Cloud & Express backend
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
    // 1. Try Supabase first
    try {
      const { data, error } = await supabase.from('classes').select('*').order('grade', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          name: c.name,
          grade: c.grade || (c.name.startsWith('10') ? 10 : c.name.startsWith('11') ? 11 : 12),
          studentCount: c.total_students || c.student_count || 0,
          homeroom: c.teacher || c.teacher_name || 'Bùi Ngọc Thắng'
        }));
      }
    } catch (e) {
      console.warn('Supabase getClasses fallback', e);
    }

    // 2. Fallback to Express local endpoint
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
      await supabase.from('classes').insert([{
        id: classData.id || `c${Date.now()}`,
        name: classData.name,
        grade: classData.grade,
        total_students: classData.studentCount || 0,
        teacher: classData.homeroom || 'Bùi Ngọc Thắng'
      }]);
    } catch (e) {
      console.warn('Supabase addClass error', e);
    }

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
    // 1. Try Supabase first (reads 214+ real students)
    try {
      let query = supabase.from('students').select('*').order('name', { ascending: true });
      if (params?.classId) {
        query = query.or(`class_id.eq.${params.classId},class_name.eq.${params.classId}`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let students: Student[] = data.map((s: any) => {
          const gradeNum = s.class_name?.startsWith('10') ? 10 : s.class_name?.startsWith('11') ? 11 : 12;
          return {
            id: s.id,
            code: s.code || s.id,
            name: s.name,
            classId: s.class_name || s.class_id,
            grade: gradeNum,
            username: s.code || s.name,
            status: s.status === 'locked' ? 'locked' : 'active',
            totalPoints: s.avg_score ? Math.round(s.avg_score * 10) : (s.total_score || (s.total_tests ? s.total_tests * 25 : 0)),
            gamesPlayed: s.total_tests || s.games_played || 0,
            badge: s.badge || s.notes || 'Học viên THPT Đan Phượng'
          };
        });

        if (params?.grade) {
          students = students.filter(st => st.grade === params.grade);
        }
        return students;
      }
    } catch (e) {
      console.warn('Supabase getStudents fallback', e);
    }

    // 2. Fallback to Express endpoint
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
      await supabase.from('students').insert([{
        id: student.id || `s_${Date.now()}`,
        code: student.code,
        name: student.name,
        class_name: student.classId,
        status: student.status || 'active',
        total_score: student.totalPoints || 0,
        games_played: student.gamesPlayed || 0,
        badge: student.badge || 'Học viên chăm chỉ'
      }]);
    } catch (e) {
      console.warn('Supabase addStudent error', e);
    }

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
      await supabase.from('students').update({
        name: updates.name,
        class_name: updates.classId,
        status: updates.status,
        total_score: updates.totalPoints,
        games_played: updates.gamesPlayed,
        badge: updates.badge
      }).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateStudent error', e);
    }

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
      await supabase.from('students').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteStudent error', e);
    }

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
      const records = students.map(s => ({
        id: s.id || `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        code: s.code,
        name: s.name,
        class_name: s.classId,
        status: 'active',
        total_score: s.totalPoints || 0,
        games_played: 0,
        badge: s.badge || 'Học viên chăm chỉ'
      }));
      await supabase.from('students').upsert(records);
    } catch (e) {
      console.warn('Supabase bulkAddStudents error', e);
    }

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
    let supabaseGames: GameItem[] = [];

    // 1. Fetch 34+ games directly from Supabase
    try {
      const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        supabaseGames = data.map((g: any) => {
          let cat: GameCategory = 'trac-nghiem';
          const titleLower = (g.title || '').toLowerCase();
          if (
            g.category === 'fun' || g.category === 'entertainment' || g.category === 'giai-tri' ||
            titleLower.includes('cờ') || titleLower.includes('giải cứu') || titleLower.includes('đào vàng') ||
            titleLower.includes('hứng quả') || titleLower.includes('rắn') || titleLower.includes('bốc bài') ||
            titleLower.includes('đua tới') || titleLower.includes('bắn đĩa') || titleLower.includes('ong') ||
            titleLower.includes('hái quả') || titleLower.includes('bậc thang')
          ) {
            cat = 'giai-tri';
          } else if (titleLower.includes('hình học') || titleLower.includes('tọa độ') || titleLower.includes('vec tơ') || titleLower.includes('đập niêu')) {
            cat = 'hinh-hoc';
          } else if (titleLower.includes('tư duy') || titleLower.includes('caro') || titleLower.includes('khóa')) {
            cat = 'tu-duy';
          } else if (titleLower.includes('hđtn') || titleLower.includes('tương tác')) {
            cat = 'tuong-tac';
          }

          let catName = g.category_name;
          if (!catName || catName === 'Toán học & Tư duy') {
            catName = cat === 'giai-tri' 
              ? 'Game Giải trí Không giới hạn' 
              : cat === 'hinh-hoc' 
              ? 'Game Hình học & Không gian' 
              : cat === 'tu-duy' 
              ? 'Game Tư duy & Trí tuệ' 
              : cat === 'tuong-tac' 
              ? 'Game Tương tác Học tập' 
              : 'Game Trắc nghiệm Toán';
          }

          return {
            id: g.id,
            title: g.title,
            category: cat,
            categoryName: catName,
            grade: g.grade === '10' ? 10 : g.grade === '11' ? 11 : g.grade === '12' ? 12 : 'all',
            topic: g.subtitle || g.topic || 'Toán học THPT Đan Phượng',
            difficulty: g.difficulty || 'Trung bình',
            questionsCount: g.quiz_questions?.length || g.questions_count || 10,
            durationMinutes: g.estimated_minutes || g.duration_minutes || 15,
            maxScore: g.max_score || 100,
            active: g.active !== false,
            description: g.description || g.subtitle || g.title,
            color: g.thumbnail_color?.includes('indigo') || g.thumbnail_color?.includes('blue') ? '#0878DC' : g.color || '#0878DC',
            bgCard: 'from-blue-600 to-indigo-700',
            fileUrl: g.embed_url || g.file_url || undefined,
            fileType: g.html_content ? 'html' : (g.file_type || (g.embed_url ? 'embed' : 'html')),
            embedCode: g.html_content || g.embed_code || undefined,
            isUploaded: Boolean(g.is_custom_upload || g.html_content || g.is_uploaded),
            authorName: g.author || g.author_name || 'Thầy Bùi Ngọc Thắng',
            uploadedAt: g.created_at || g.created_date
          };
        });
      }
    } catch (e) {
      console.warn('Supabase getGames fallback', e);
    }

    // 2. Also combine with local system templates (Ai là triệu phú, Vòng quay, Sudoku)
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      const localGames: GameItem[] = data.games || [];

      if (supabaseGames.length === 0) return localGames;

      const existingTitles = new Set(supabaseGames.map(g => g.title.toLowerCase().trim()));
      const combined = [...supabaseGames];
      for (const lg of localGames) {
        if (!existingTitles.has(lg.title.toLowerCase().trim())) {
          combined.push(lg);
        }
      }
      return combined;
    } catch {
      return supabaseGames;
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
    // 1. Save to Supabase
    try {
      await supabase.from('games').insert([{
        id: game.id || `game_${Date.now()}`,
        title: game.title,
        subtitle: game.topic,
        description: game.description,
        category: game.category,
        category_name: game.categoryName,
        grade: game.grade?.toString() || 'all',
        difficulty: game.difficulty || 'Trung bình',
        estimated_minutes: game.durationMinutes || 15,
        html_content: game.embedCode || null,
        embed_url: game.fileUrl || null,
        is_custom_upload: true,
        author: game.authorName || 'Thầy Bùi Ngọc Thắng'
      }]);
    } catch (e) {
      console.warn('Supabase addGame error', e);
    }

    // 2. Also sync to local backend
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
      await supabase.from('games').update({
        title: updates.title,
        subtitle: updates.topic,
        description: updates.description,
        difficulty: updates.difficulty,
        grade: updates.grade?.toString(),
        html_content: updates.embedCode,
        embed_url: updates.fileUrl
      }).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateGame error', e);
    }

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
      await supabase.from('games').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteGame error', e);
    }

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
      const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          code: r.code,
          title: r.title,
          gameId: r.game_id,
          gameTitle: r.game_title,
          classes: Array.isArray(r.classes) ? r.classes : [],
          startTime: r.start_time,
          endTime: r.end_time,
          maxAttempts: r.max_attempts || 1,
          allowReplay: Boolean(r.allow_replay),
          status: r.status || 'active',
          participantsCount: r.participants_count || 0,
          createdBy: r.created_by || 'Bùi Ngọc Thắng'
        }));
      }
    } catch (e) {
      console.warn('Supabase getRooms fallback', e);
    }

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
      await supabase.from('rooms').insert([{
        id: room.id || `r_${Date.now()}`,
        code: room.code,
        title: room.title,
        game_id: room.gameId,
        game_title: room.gameTitle,
        classes: room.classes || [],
        status: 'active',
        created_by: 'Bùi Ngọc Thắng'
      }]);
    } catch (e) {
      console.warn('Supabase createRoom error', e);
    }

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
      const { data } = await supabase.from('rooms').select('*').eq('code', code.trim().toUpperCase()).single();
      if (data) {
        return {
          success: true,
          room: {
            id: data.id,
            code: data.code,
            title: data.title,
            gameId: data.game_id,
            gameTitle: data.game_title,
            classes: Array.isArray(data.classes) ? data.classes : [],
            startTime: data.start_time,
            endTime: data.end_time,
            maxAttempts: data.max_attempts || 1,
            allowReplay: Boolean(data.allow_replay),
            status: data.status || 'active',
            participantsCount: data.participants_count || 0,
            createdBy: data.created_by || 'Bùi Ngọc Thắng'
          }
        };
      }
    } catch {}

    try {
      const res = await fetch(`/api/rooms/verify/${code}`);
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Lỗi kết nối kiểm tra mã phòng' };
    }
  },

  async getAttempts(params?: { studentCode?: string; roomCode?: string; className?: string }): Promise<GameAttempt[]> {
    try {
      let query = supabase.from('attempts').select('*').order('started_at', { ascending: false });
      if (params?.studentCode) query = query.eq('student_code', params.studentCode);
      if (params?.roomCode) query = query.eq('room_code', params.roomCode);
      if (params?.className) query = query.eq('class_name', params.className);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((a: any) => ({
          id: a.id,
          studentCode: a.student_code,
          studentName: a.student_name,
          className: a.class_name,
          gameId: a.game_id,
          gameTitle: a.game_title,
          roomCode: a.room_code || undefined,
          startedAt: a.started_at,
          endedAt: a.ended_at,
          durationSeconds: a.duration_seconds || 0,
          totalQuestions: a.total_questions || 10,
          correctCount: a.correct_count || 0,
          incorrectCount: a.incorrect_count || 0,
          score: Number(a.score) || 0,
          status: a.status || 'completed'
        }));
      }
    } catch (e) {
      console.warn('Supabase getAttempts fallback', e);
    }

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
      await supabase.from('attempts').insert([{
        id: attempt.id || `att_${Date.now()}`,
        student_code: attempt.studentCode || 'HS1001',
        student_name: attempt.studentName || 'Học sinh',
        class_name: attempt.className || '12A1',
        game_id: attempt.gameId,
        game_title: attempt.gameTitle,
        room_code: attempt.roomCode || null,
        started_at: attempt.startedAt || new Date().toISOString(),
        ended_at: attempt.endedAt || new Date().toISOString(),
        duration_seconds: attempt.durationSeconds || 0,
        total_questions: attempt.totalQuestions || 10,
        correct_count: attempt.correctCount || 0,
        incorrect_count: attempt.incorrectCount || 0,
        score: attempt.score || 0,
        status: attempt.status || 'completed'
      }]);
    } catch (e) {
      console.warn('Supabase saveAttempt error', e);
    }

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
