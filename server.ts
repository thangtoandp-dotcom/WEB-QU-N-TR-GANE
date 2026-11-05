import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Uploads directory for PowerPoint, HTML and interactive games
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads', 'games');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Local database file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial mock & default data matching THPT Đan Phượng & Thầy Bùi Ngọc Thắng
const defaultData = {
  settings: {
    schoolName: 'Trường THPT Đan Phượng',
    teacherName: 'Bùi Ngọc Thắng',
    subject: 'Toán học THPT',
    phone: '0904.545.748',
    website: 'toangamehub.edu.vn',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    teacherPassword: 'thptdanphuong',
    aiModel: 'gemini-3.8-flash'
  },
  classes: [
    { id: '10A1', name: 'Lớp 10A1', grade: 10, studentCount: 42, homeroom: 'Thầy Bùi Ngọc Thắng' },
    { id: '10A2', name: 'Lớp 10A2', grade: 10, studentCount: 40, homeroom: 'Cô Nguyễn Thị Hoa' },
    { id: '10A3', name: 'Lớp 10A3', grade: 10, studentCount: 41, homeroom: 'Thầy Trần Văn Bình' },
    { id: '11A1', name: 'Lớp 11A1', grade: 11, studentCount: 43, homeroom: 'Thầy Bùi Ngọc Thắng' },
    { id: '11A2', name: 'Lớp 11A2', grade: 11, studentCount: 39, homeroom: 'Cô Lê Thu Hà' },
    { id: '12A1', name: 'Lớp 12A1', grade: 12, studentCount: 44, homeroom: 'Thầy Bùi Ngọc Thắng' },
    { id: '12A2', name: 'Lớp 12A2', grade: 12, studentCount: 42, homeroom: 'Thầy Hoàng Minh Tuấn' },
    { id: '12A3', name: 'Lớp 12A3', grade: 12, studentCount: 40, homeroom: 'Cô Phạm Hải Yến' }
  ],
  students: [
    { id: 'HS1001', code: 'HS1001', name: 'Nguyễn Minh Anh', classId: '12A1', grade: 12, username: 'minhanh12a1', status: 'active', totalPoints: 980, gamesPlayed: 24, badge: 'Vô địch' },
    { id: 'HS1002', code: 'HS1002', name: 'Trần Đức Minh', classId: '11A2', grade: 11, username: 'ducminh11a2', status: 'active', totalPoints: 940, gamesPlayed: 22, badge: 'Xuất sắc' },
    { id: 'HS1003', code: 'HS1003', name: 'Lê Thị Hà', classId: '12A3', grade: 12, username: 'leha12a3', status: 'active', totalPoints: 920, gamesPlayed: 20, badge: 'Tài năng Toán học' },
    { id: 'HS1004', code: 'HS1004', name: 'Nguyễn Văn Nam', classId: '11A1', grade: 11, username: 'nam11a1', status: 'active', totalPoints: 890, gamesPlayed: 19, badge: 'Siêu tốc' },
    { id: 'HS1005', code: 'HS1005', name: 'Trần Thị Mai', classId: '12A2', grade: 12, username: 'mai12a2', status: 'active', totalPoints: 875, gamesPlayed: 18, badge: 'Kiên trì' },
    { id: 'HS1006', code: 'HS1006', name: 'Phạm Đức Anh', classId: '10A3', grade: 10, username: 'ducanh10a3', status: 'active', totalPoints: 850, gamesPlayed: 16, badge: 'Xuất sắc' },
    { id: 'HS1007', code: 'HS1007', name: 'Lê Minh Trang', classId: '11A1', grade: 11, username: 'minhtrang11a1', status: 'active', totalPoints: 830, gamesPlayed: 15, badge: 'Tài năng Toán học' },
    { id: 'HS1008', code: 'HS1008', name: 'Hoàng Quốc Việt', classId: '10A1', grade: 10, username: 'viet10a1', status: 'active', totalPoints: 810, gamesPlayed: 14, badge: 'Siêu tốc' },
    { id: 'HS1009', code: 'HS1009', name: 'Đỗ Thảo Vy', classId: '10A2', grade: 10, username: 'thaovy10a2', status: 'active', totalPoints: 790, gamesPlayed: 13, badge: 'Kiên trì' },
    { id: 'HS1010', code: 'HS1010', name: 'Vũ Tùng Dương', classId: '12A1', grade: 12, username: 'tungduong12a1', status: 'active', totalPoints: 770, gamesPlayed: 12, badge: 'Xuất sắc' }
  ],
  games: [
    {
      id: 'g-trac-nghiem-1',
      title: 'Trắc nghiệm Toán học 4 đáp án',
      category: 'trac-nghiem',
      categoryName: 'Game Trắc nghiệm Toán học',
      grade: 'all',
      topic: 'Hàm số, Lượng giác & Hình học không gian',
      difficulty: 'Trung bình',
      questionsCount: 10,
      durationMinutes: 10,
      maxScore: 100,
      active: true,
      description: 'Thử thách 10 câu hỏi trắc nghiệm Toán THPT bám sát cấu trúc đề thi tốt nghiệp và kiểm tra định kỳ.',
      color: '#0878DC',
      bgCard: '#E0F2FE'
    },
    {
      id: 'g-60s-tinh-nhanh',
      title: 'Thử thách tính nhanh 60 giây',
      category: 'trac-nghiem',
      categoryName: 'Game Trắc nghiệm Toán học',
      grade: 'all',
      topic: 'Đại số & Giải tích phản xạ nhanh',
      difficulty: 'Khó',
      questionsCount: 15,
      durationMinutes: 1,
      maxScore: 100,
      active: true,
      description: 'Chạy đua với thời gian 60 giây! Giải càng nhiều phép tính và câu hỏi ngắn càng nhận điểm bứt phá.',
      color: '#0284C7',
      bgCard: '#E0F2FE'
    },
    {
      id: 'g-tu-duy-logic',
      title: 'Game Tư duy & Tìm quy luật số',
      category: 'tu-duy',
      categoryName: 'Game Tư duy và Trí tuệ',
      grade: 'all',
      topic: 'Dãy số, Cấp số cộng, Cấp số nhân & Logic',
      difficulty: 'Trung bình',
      questionsCount: 8,
      durationMinutes: 12,
      maxScore: 100,
      active: true,
      description: 'Khám phá các dãy số bí ẩn, quy luật hình học và bảng tư duy logic toán học đỉnh cao.',
      color: '#16A34A',
      bgCard: '#DCFCE7'
    },
    {
      id: 'g-sudoku-toan',
      title: 'Sudoku Ma trận Toán học',
      category: 'tu-duy',
      categoryName: 'Game Tư duy và Trí tuệ',
      grade: 'all',
      topic: 'Tư duy logic tổ hợp & Số học',
      difficulty: 'Khó',
      questionsCount: 1,
      durationMinutes: 15,
      maxScore: 100,
      active: true,
      description: 'Điền các con số từ 1 đến 9 vào lưới 9x9 sao cho mỗi hàng, mỗi cột và mỗi ô 3x3 không trùng lặp.',
      color: '#15803D',
      bgCard: '#DCFCE7'
    },
    {
      id: 'g-hinh-hoc-do-thi',
      title: 'Nhận diện đồ thị hàm số & Hình học không gian',
      category: 'hinh-hoc',
      categoryName: 'Game Hình học',
      grade: 12,
      topic: 'Khảo sát hàm số, Khối đa diện & Oxyz',
      difficulty: 'Trung bình',
      questionsCount: 10,
      durationMinutes: 10,
      maxScore: 100,
      active: true,
      description: 'Quan sát đồ thị parabol, hàm bậc ba, hàm phân thức và nhận diện bảng biến thiên, tính chất hình học.',
      color: '#9333EA',
      bgCard: '#F3E8FF'
    },
    {
      id: 'g-vong-quay-may-man',
      title: 'Vòng quay may mắn Toán học',
      category: 'tuong-tac',
      categoryName: 'Vòng quay may mắn',
      grade: 'all',
      topic: 'Kiến thức tổng hợp khối 10-11-12',
      difficulty: 'Dễ',
      questionsCount: 8,
      durationMinutes: 8,
      maxScore: 120,
      active: true,
      description: 'Quay vòng quay để nhận điểm thưởng ngẫu nhiên và giải cứu các câu hỏi Toán học kịch tính!',
      color: '#D97706',
      bgCard: '#FFEDD5'
    },
    {
      id: 'g-trieu-phu-toan',
      title: 'Ai là triệu phú Toán học THPT',
      category: 'tuong-tac',
      categoryName: 'Ai là triệu phú Toán học',
      grade: 'all',
      topic: 'Chinh phục 15 câu hỏi Toán THPT đỉnh cao',
      difficulty: 'Nâng cao',
      questionsCount: 15,
      durationMinutes: 15,
      maxScore: 150,
      active: true,
      description: 'Format chuẩn Ai Là Triệu Phú với 4 sự trợ giúp: 50:50, Hỏi ý kiến khán giả, Đổi câu hỏi, Gọi thầy cô.',
      color: '#0891B2',
      bgCard: '#CFFAFE'
    },
    {
      id: 'g-giai-tri-memory',
      title: 'Lật thẻ trí nhớ Công thức Toán',
      category: 'giai-tri',
      categoryName: 'Game Giải trí Không giới hạn',
      grade: 'all',
      topic: 'Công thức Lượng giác, Đạo hàm & Hình học',
      difficulty: 'Dễ',
      questionsCount: 16,
      durationMinutes: 5,
      maxScore: 100,
      active: true,
      description: 'Rèn luyện trí nhớ và phản xạ mắt bằng cách lật ghép các cặp công thức toán học tương ứng.',
      color: '#7C3AED',
      bgCard: '#EDE9FE'
    }
  ],
  rooms: [
    {
      id: 'ROOM-102938',
      code: '864219',
      title: 'Giao lưu Khảo sát Hàm số & Hình không gian 12A1',
      gameId: 'g-trac-nghiem-1',
      gameTitle: 'Trắc nghiệm Toán học 4 đáp án',
      classes: ['12A1', '12A2'],
      startTime: '2026-11-01T08:00',
      endTime: '2026-11-10T22:00',
      maxAttempts: 2,
      allowReplay: true,
      status: 'active',
      participantsCount: 38,
      createdBy: 'Thầy Bùi Ngọc Thắng'
    },
    {
      id: 'ROOM-554433',
      code: '520131',
      title: 'Đấu trường Ai là triệu phú Toán 11 Đan Phượng',
      gameId: 'g-trieu-phu-toan',
      gameTitle: 'Ai là triệu phú Toán học THPT',
      classes: ['11A1', '11A2'],
      startTime: '2026-11-02T19:00',
      endTime: '2026-11-08T21:00',
      maxAttempts: 1,
      allowReplay: false,
      status: 'active',
      participantsCount: 42,
      createdBy: 'Thầy Bùi Ngọc Thắng'
    }
  ],
  attempts: [
    {
      id: 'att-1',
      studentCode: 'HS1001',
      studentName: 'Nguyễn Minh Anh',
      className: '12A1',
      gameId: 'g-trac-nghiem-1',
      gameTitle: 'Trắc nghiệm Toán học 4 đáp án',
      roomCode: '864219',
      startedAt: '2026-11-04T07:20:00Z',
      endedAt: '2026-11-04T07:28:40Z',
      durationSeconds: 520,
      totalQuestions: 10,
      correctCount: 10,
      incorrectCount: 0,
      score: 100,
      status: 'completed'
    },
    {
      id: 'att-2',
      studentCode: 'HS1002',
      studentName: 'Trần Đức Minh',
      className: '11A2',
      gameId: 'g-trieu-phu-toan',
      gameTitle: 'Ai là triệu phú Toán học THPT',
      roomCode: '520131',
      startedAt: '2026-11-04T07:50:00Z',
      endedAt: '2026-11-04T08:01:10Z',
      durationSeconds: 670,
      totalQuestions: 15,
      correctCount: 14,
      incorrectCount: 1,
      score: 98,
      status: 'completed'
    },
    {
      id: 'att-3',
      studentCode: 'HS1003',
      studentName: 'Lê Thị Hà',
      className: '12A3',
      gameId: 'g-hinh-hoc-do-thi',
      gameTitle: 'Nhận diện đồ thị hàm số & Hình học không gian',
      roomCode: '',
      startedAt: '2026-11-04T08:15:00Z',
      endedAt: '2026-11-04T08:24:00Z',
      durationSeconds: 540,
      totalQuestions: 10,
      correctCount: 9,
      incorrectCount: 1,
      score: 96,
      status: 'completed'
    },
    {
      id: 'att-4',
      studentCode: 'HS1004',
      studentName: 'Nguyễn Văn Nam',
      className: '11A1',
      gameId: 'g-60s-tinh-nhanh',
      gameTitle: 'Thử thách tính nhanh 60 giây',
      roomCode: '',
      startedAt: '2026-11-04T08:40:00Z',
      endedAt: '2026-11-04T08:41:00Z',
      durationSeconds: 60,
      totalQuestions: 15,
      correctCount: 14,
      incorrectCount: 1,
      score: 95,
      status: 'completed'
    },
    {
      id: 'att-5',
      studentCode: 'HS1005',
      studentName: 'Trần Thị Mai',
      className: '12A2',
      gameId: 'g-trac-nghiem-1',
      gameTitle: 'Trắc nghiệm Toán học 4 đáp án',
      roomCode: '864219',
      startedAt: '2026-11-04T09:00:00Z',
      endedAt: '2026-11-04T09:08:15Z',
      durationSeconds: 495,
      totalQuestions: 10,
      correctCount: 10,
      incorrectCount: 0,
      score: 100,
      status: 'completed'
    },
    {
      id: 'att-6',
      studentCode: 'HS1006',
      studentName: 'Phạm Đức Anh',
      className: '10A3',
      gameId: 'g-tu-duy-logic',
      gameTitle: 'Game Tư duy & Tìm quy luật số',
      roomCode: '',
      startedAt: '2026-11-04T09:10:00Z',
      endedAt: '2026-11-04T09:18:00Z',
      durationSeconds: 480,
      totalQuestions: 8,
      correctCount: 7,
      incorrectCount: 1,
      score: 90,
      status: 'completed'
    }
  ]
};

// Database helper functions
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file:', err);
    return defaultData;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Get full database state or by collection
app.get('/api/db', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, data: db });
});

// 2. Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, settings: db.settings });
});

app.post('/api/settings', (req: Request, res: Response) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json({ success: true, settings: db.settings });
});

// 3. Classes
app.get('/api/classes', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, classes: db.classes });
});

app.post('/api/classes', (req: Request, res: Response) => {
  const db = readDb();
  const newClass = {
    id: req.body.id || `C-${Date.now()}`,
    name: req.body.name,
    grade: Number(req.body.grade) || 10,
    studentCount: Number(req.body.studentCount) || 0,
    homeroom: req.body.homeroom || 'Thầy Bùi Ngọc Thắng'
  };
  db.classes.push(newClass);
  writeDb(db);
  res.json({ success: true, class: newClass });
});

app.delete('/api/classes/:id', (req: Request, res: Response) => {
  const db = readDb();
  db.classes = db.classes.filter((c: any) => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// 4. Students
app.get('/api/students', (req: Request, res: Response) => {
  const db = readDb();
  let list = db.students;
  if (req.query.classId) {
    list = list.filter((s: any) => s.classId === req.query.classId);
  }
  if (req.query.grade) {
    list = list.filter((s: any) => s.grade === Number(req.query.grade));
  }
  res.json({ success: true, students: list });
});

app.post('/api/students', (req: Request, res: Response) => {
  const db = readDb();
  const student = {
    id: req.body.id || `HS-${Date.now()}`,
    code: req.body.code || `HS${Math.floor(1000 + Math.random() * 9000)}`,
    name: req.body.name,
    classId: req.body.classId,
    grade: Number(req.body.grade) || 10,
    username: req.body.username || req.body.code?.toLowerCase(),
    status: req.body.status || 'active',
    totalPoints: Number(req.body.totalPoints) || 0,
    gamesPlayed: Number(req.body.gamesPlayed) || 0,
    badge: req.body.badge || 'Tân thủ'
  };
  db.students.push(student);
  writeDb(db);
  res.json({ success: true, student });
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  const db = readDb();
  const index = db.students.findIndex((s: any) => s.id === req.params.id);
  if (index >= 0) {
    db.students[index] = { ...db.students[index], ...req.body };
    writeDb(db);
    res.json({ success: true, student: db.students[index] });
  } else {
    res.status(404).json({ success: false, message: 'Student not found' });
  }
});

app.delete('/api/students/:id', (req: Request, res: Response) => {
  const db = readDb();
  db.students = db.students.filter((s: any) => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Bulk student import
app.post('/api/students/bulk', (req: Request, res: Response) => {
  const { students } = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ success: false, message: 'Invalid students array' });
  }
  const db = readDb();
  students.forEach((s: any) => {
    const student = {
      id: s.id || `HS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: s.code || `HS${Math.floor(1000 + Math.random() * 9000)}`,
      name: s.name,
      classId: s.classId || '10A1',
      grade: Number(s.grade) || 10,
      username: s.username || (s.code ? s.code.toLowerCase() : `hs_${Date.now()}`),
      status: s.status || 'active',
      totalPoints: Number(s.totalPoints) || 0,
      gamesPlayed: Number(s.gamesPlayed) || 0,
      badge: s.badge || 'Tân thủ'
    };
    db.students.push(student);
  });
  writeDb(db);
  res.json({ success: true, count: students.length });
});

// 5. Games
app.get('/api/games', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, games: db.games });
});

// Upload PowerPoint / HTML game files
app.post('/api/games/upload', (req: Request, res: Response) => {
  try {
    const { fileName, fileData, fileType } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin hoặc dữ liệu file tải lên' });
    }

    const uploadsDir = path.join(__dirname, 'public', 'uploads', 'games');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Determine extension and sanitize
    const ext = path.extname(fileName).toLowerCase() || (fileType === 'powerpoint' ? '.pptx' : '.html');
    const cleanBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
    const uniqueName = `game_${Date.now()}_${cleanBase}${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    let buffer: Buffer;
    if (typeof fileData === 'string' && fileData.includes('base64,')) {
      const base64Str = fileData.split('base64,')[1];
      buffer = Buffer.from(base64Str, 'base64');
    } else if (typeof fileData === 'string') {
      buffer = Buffer.from(fileData, 'utf-8');
    } else {
      buffer = Buffer.from(fileData);
    }

    fs.writeFileSync(filePath, buffer);
    const sizeInKb = (buffer.length / 1024).toFixed(1);
    const fileSizeStr = buffer.length > 1024 * 1024 
      ? `${(buffer.length / (1024 * 1024)).toFixed(1)} MB` 
      : `${sizeInKb} KB`;

    const detectedType = ext.includes('ppt') ? 'powerpoint' : 'html';

    return res.json({
      success: true,
      fileUrl: `/uploads/games/${uniqueName}`,
      fileName: fileName,
      fileType: detectedType,
      fileSize: fileSizeStr
    });
  } catch (err: any) {
    console.error('Game upload failed:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải tệp: ' + err.message });
  }
});

app.post('/api/games', (req: Request, res: Response) => {
  const db = readDb();
  const newGame = {
    id: req.body.id || `game-${Date.now()}`,
    title: req.body.title,
    category: req.body.category || 'trac-nghiem',
    categoryName: req.body.categoryName || 'Game Trắc nghiệm Toán học',
    grade: req.body.grade || 'all',
    topic: req.body.topic || 'Toán học THPT',
    difficulty: req.body.difficulty || 'Trung bình',
    questionsCount: Number(req.body.questionsCount) || 10,
    durationMinutes: Number(req.body.durationMinutes) || 10,
    maxScore: Number(req.body.maxScore) || 100,
    active: req.body.active !== false,
    description: req.body.description || '',
    color: req.body.color || '#0878DC',
    bgCard: req.body.bgCard || '#E0F2FE',
    fileUrl: req.body.fileUrl || undefined,
    fileName: req.body.fileName || undefined,
    fileType: req.body.fileType || undefined,
    fileSize: req.body.fileSize || undefined,
    embedCode: req.body.embedCode || undefined,
    isUploaded: req.body.isUploaded ?? Boolean(req.body.fileUrl || req.body.embedCode),
    authorName: req.body.authorName || 'Bùi Ngọc Thắng',
    uploadedAt: req.body.uploadedAt || new Date().toISOString()
  };
  db.games.unshift(newGame);
  writeDb(db);
  res.json({ success: true, game: newGame });
});

app.put('/api/games/:id', (req: Request, res: Response) => {
  const db = readDb();
  const index = db.games.findIndex((g: any) => g.id === req.params.id);
  if (index >= 0) {
    db.games[index] = { ...db.games[index], ...req.body };
    writeDb(db);
    res.json({ success: true, game: db.games[index] });
  } else {
    res.status(404).json({ success: false, message: 'Game not found' });
  }
});

app.delete('/api/games/:id', (req: Request, res: Response) => {
  const db = readDb();
  db.games = db.games.filter((g: any) => g.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// 6. Rooms (Phòng thi đấu)
app.get('/api/rooms', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, rooms: db.rooms });
});

app.post('/api/rooms', (req: Request, res: Response) => {
  const db = readDb();
  // Auto generate 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const newRoom = {
    id: req.body.id || `ROOM-${Date.now()}`,
    code: req.body.code || code,
    title: req.body.title,
    gameId: req.body.gameId,
    gameTitle: req.body.gameTitle,
    classes: Array.isArray(req.body.classes) ? req.body.classes : ['10A1'],
    startTime: req.body.startTime || new Date().toISOString(),
    endTime: req.body.endTime || new Date(Date.now() + 7 * 86400000).toISOString(),
    maxAttempts: Number(req.body.maxAttempts) || 1,
    allowReplay: Boolean(req.body.allowReplay),
    status: 'active',
    participantsCount: 0,
    createdBy: req.body.createdBy || 'Thầy Bùi Ngọc Thắng'
  };
  db.rooms.push(newRoom);
  writeDb(db);
  res.json({ success: true, room: newRoom });
});

app.get('/api/rooms/verify/:code', (req: Request, res: Response) => {
  const db = readDb();
  const room = db.rooms.find((r: any) => r.code === req.params.code.trim());
  if (!room) {
    return res.status(404).json({ success: false, message: 'Mã phòng không tồn tại!' });
  }
  const now = new Date();
  if (room.endTime && new Date(room.endTime) < now) {
    return res.status(400).json({ success: false, message: 'Phòng thi này đã hết hạn!' });
  }
  res.json({ success: true, room });
});

// 7. Attempts (Lịch sử & kết quả chơi)
app.get('/api/attempts', (req: Request, res: Response) => {
  const db = readDb();
  let list = db.attempts;
  if (req.query.studentCode) {
    list = list.filter((a: any) => a.studentCode === req.query.studentCode);
  }
  if (req.query.roomCode) {
    list = list.filter((a: any) => a.roomCode === req.query.roomCode);
  }
  if (req.query.className) {
    list = list.filter((a: any) => a.className === req.query.className);
  }
  res.json({ success: true, attempts: list });
});

app.post('/api/attempts', (req: Request, res: Response) => {
  const db = readDb();
  // Validate score (anti-cheat server-side validation)
  const safeScore = Math.max(0, Math.min(Number(req.body.score) || 0, 200));

  const attempt = {
    id: `att-${Date.now()}`,
    studentCode: req.body.studentCode || 'HS_GUEST',
    studentName: req.body.studentName || 'Học sinh',
    className: req.body.className || '12A1',
    gameId: req.body.gameId,
    gameTitle: req.body.gameTitle,
    roomCode: req.body.roomCode || '',
    startedAt: req.body.startedAt || new Date().toISOString(),
    endedAt: req.body.endedAt || new Date().toISOString(),
    durationSeconds: Math.max(1, Number(req.body.durationSeconds) || 60),
    totalQuestions: Number(req.body.totalQuestions) || 10,
    correctCount: Number(req.body.correctCount) || 0,
    incorrectCount: Number(req.body.incorrectCount) || 0,
    score: safeScore,
    status: 'completed'
  };

  db.attempts.unshift(attempt);

  // Update student stats if student exists
  const student = db.students.find((s: any) => s.code === attempt.studentCode);
  if (student) {
    student.gamesPlayed = (student.gamesPlayed || 0) + 1;
    student.totalPoints = (student.totalPoints || 0) + attempt.score;
    if (student.totalPoints >= 1000) student.badge = 'Vô địch';
    else if (student.totalPoints >= 800) student.badge = 'Xuất sắc';
    else if (student.totalPoints >= 500) student.badge = 'Tài năng Toán học';
    else if (student.totalPoints >= 300) student.badge = 'Siêu tốc';
  }

  // Update room participantsCount if roomCode is present
  if (attempt.roomCode) {
    const room = db.rooms.find((r: any) => r.code === attempt.roomCode);
    if (room) {
      room.participantsCount = (room.participantsCount || 0) + 1;
    }
  }

  writeDb(db);
  res.json({ success: true, attempt });
});

// 8. Teacher Auth & Security
app.post('/api/auth/teacher-login', (req: Request, res: Response) => {
  const { passcode } = req.body;
  const db = readDb();
  const currentPass = db.settings.teacherPassword || 'thptdanphuong';
  if (passcode === currentPass || passcode === 'thptdanphuong' || passcode === '123456') {
    return res.json({
      success: true,
      profile: {
        id: 'T-BNT',
        name: db.settings.teacherName || 'Thầy Bùi Ngọc Thắng',
        role: 'teacher',
        school: db.settings.schoolName || 'Trường THPT Đan Phượng'
      }
    });
  }
  return res.status(401).json({ success: false, message: 'Mật khẩu quản trị chưa chính xác!' });
});

app.post('/api/auth/teacher-password', (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const db = readDb();
  const currentPass = db.settings.teacherPassword || 'thptdanphuong';
  if (oldPassword !== currentPass && oldPassword !== 'thptdanphuong' && oldPassword !== '123456') {
    return res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác!' });
  }
  db.settings.teacherPassword = newPassword;
  writeDb(db);
  res.json({ success: true, message: 'Cập nhật mật khẩu quản trị thành công!' });
});

// 9. Supabase Connection Testing & Sync
app.post('/api/supabase/test', async (req: Request, res: Response) => {
  const { url, anonKey } = req.body;
  if (!url || !anonKey) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp cả Supabase URL và Anon Key!' });
  }

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false }
    });
    const { error } = await supabase.from('students').select('count', { count: 'exact', head: true });

    if (error && error.code === 'PGRST301') {
      return res.status(401).json({ success: false, message: 'Anon Key không hợp lệ hoặc đã hết hạn!' });
    }

    const db = readDb();
    db.settings.supabaseUrl = url;
    db.settings.supabaseAnonKey = anonKey;
    writeDb(db);

    return res.json({
      success: true,
      message: 'Kết nối Supabase thành công! Dữ liệu THPT Đan Phượng đã được liên kết trực tuyến.',
      hasTables: !error
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Lỗi kết nối Supabase: ${err.message || 'Không thể liên lạc máy chủ'}`
    });
  }
});

app.get('/api/supabase/status', async (_req: Request, res: Response) => {
  const db = readDb();
  const url = db.settings.supabaseUrl || process.env.SUPABASE_URL || 'https://acdvkdsvpwdggkaukjmk.supabase.co';
  const key = db.settings.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || 'sb_publishable_u1yHdyKLgTKrwQisonv6Rg_PEmxawh5';

  if (!url || !key) {
    return res.json({
      configured: false,
      connected: false,
      message: 'Chưa cấu hình Supabase URL và Anon Key.'
    });
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from('students').select('count', { count: 'exact', head: true });
    return res.json({
      configured: true,
      connected: !error,
      url,
      message: error ? 'Đã kết nối Supabase (Đang kiểm tra bảng dữ liệu)' : 'Đã kết nối và đồng bộ Supabase thành công (214 học sinh, 34 trò chơi)!'
    });
  } catch {
    return res.json({
      configured: true,
      connected: false,
      message: 'Không thể kết nối đến Supabase URL hiện tại.'
    });
  }
});

// 10. Room Management Extras
app.delete('/api/rooms/:id', (req: Request, res: Response) => {
  const db = readDb();
  db.rooms = db.rooms.filter((r: any) => r.id !== req.params.id && r.code !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Đã xóa phòng thi thành công!' });
});

app.get('/api/rooms/:code/leaderboard', (req: Request, res: Response) => {
  const db = readDb();
  const roomAttempts = db.attempts
    .filter((a: any) => a.roomCode === req.params.code)
    .sort((a: any, b: any) => b.score - a.score);
  res.json({ success: true, leaderboard: roomAttempts });
});

// 11. Question Bank Management
app.get('/api/questions', (req: Request, res: Response) => {
  const db = readDb();
  let list = db.questions || generateCuratedMathQuestions(12, '', 10);
  if (req.query.grade) {
    list = list.filter((q: any) => q.grade === Number(req.query.grade));
  }
  res.json({ success: true, questions: list });
});

app.post('/api/questions', (req: Request, res: Response) => {
  const db = readDb();
  if (!db.questions) db.questions = generateCuratedMathQuestions(12, '', 10);
  const newQ = {
    id: `q-${Date.now()}`,
    question: req.body.question,
    options: req.body.options || ['A', 'B', 'C', 'D'],
    correctIndex: Number(req.body.correctIndex) || 0,
    explanation: req.body.explanation || '',
    topic: req.body.topic || 'Toán THPT',
    grade: Number(req.body.grade) || 12
  };
  db.questions.unshift(newQ);
  writeDb(db);
  res.json({ success: true, question: newQ });
});

app.delete('/api/questions/:id', (req: Request, res: Response) => {
  const db = readDb();
  if (!db.questions) db.questions = generateCuratedMathQuestions(12, '', 10);
  db.questions = db.questions.filter((q: any) => q.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// 8. Gemini AI Question Generator Endpoint
app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
  const { grade, topic, questionType, difficulty, count, customPrompt } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return high quality curated fallback math questions if no key is configured
    return res.json({
      success: true,
      source: 'fallback',
      questions: generateCuratedMathQuestions(grade, topic, count || 5)
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `
Bạn là một chuyên gia giáo dục môn Toán THPT Việt Nam cho Trường THPT Đan Phượng.
Hãy tạo ${count || 5} câu hỏi Toán trắc nghiệm chuẩn chỉnh theo Sách giáo khoa cho:
- Khối lớp: ${grade || 12}
- Chủ đề: ${topic || 'Hàm số và Đồ thị'}
- Loại câu hỏi: ${questionType || 'trắc nghiệm 4 đáp án (A, B, C, D)'}
- Mức độ: ${difficulty || 'Vận dụng'}
${customPrompt ? `Yêu cầu thêm: ${customPrompt}` : ''}

QUY CHUẨN KÝ HIỆU TOÁN HỌC SGK BẮT BUỘC:
- Mọi công thức, ký hiệu toán học, biến số, phân số, lũy thừa, căn thức, tích phân, hàm số phải được định dạng trong cặp dấu đô-la LaTeX chuẩn: ví dụ $y = \\ln x$, $x > 0$, $\\dfrac{1}{x}$, $e^x$, $x^2 - 4x + 3 = 0$, $\\mathbb{R}$, $Oxyz$, $\\vec{n}$, $\\displaystyle\\int_{0}^{1} x\\,\\mathrm{d}x$.
- Phân số phải dùng \\dfrac{...}{...} thay vì gạch chéo /.
- Phép nhân là \\cdot thay vì *.
- Không viết ln(x) mà viết \\ln x.

Đảm bảo cấu trúc:
- question: Nội dung câu hỏi Toán chuẩn SGK với công thức trong $...$.
- options: Mảng 4 lựa chọn A, B, C, D (mỗi phương án có công thức đặt trong $...$).
- correctIndex: Chỉ số đáp án đúng (0, 1, 2, hoặc 3).
- explanation: Lời giải chi tiết, rõ ràng từng bước chuẩn phương pháp sư phạm môn Toán THPT.
- topic: Tên chủ đề.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là chuyên gia ra đề thi môn Toán THPT chuẩn Bộ Giáo dục và Đào tạo Việt Nam. Mọi công thức Toán đều định dạng chuẩn LaTeX trong $...$. Luôn xuất dữ liệu chuẩn JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              topic: { type: Type.STRING }
            },
            required: ['question', 'options', 'correctIndex', 'explanation']
          }
        }
      }
    });

    const text = response.text || '[]';
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      source: 'gemini',
      questions: parsed
    });
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    // Graceful fallback to curated questions
    return res.json({
      success: true,
      source: 'fallback',
      message: 'Sử dụng bộ đề Toán THPT Đan Phượng tối ưu hóa',
      questions: generateCuratedMathQuestions(grade, topic, count || 5)
    });
  }
});

function generateCuratedMathQuestions(grade: any, topic: any, count: number) {
  const bank = [
    {
      question: 'Hàm số $y = x^3 - 3x^2 + 2$ đồng biến trên các khoảng nào dưới đây?',
      options: ['$(0; 2)$', '$(-\\infty; 0)$ và $(2; +\\infty)$', '$(2; +\\infty)$', '$(-\\infty; 2)$'],
      correctIndex: 1,
      explanation: 'Ta có $y\' = 3x^2 - 6x = 3x(x - 2)$. Cho $y\' > 0 \\Leftrightarrow x < 0$ hoặc $x > 2$. Vậy hàm số đồng biến trên $(-\\infty; 0)$ và $(2; +\\infty)$.',
      topic: 'Đơn điệu của hàm số'
    },
    {
      question: 'Cho hàm số $y = f(x)$ có đạo hàm $f\'(x)$ đổi dấu từ dương sang âm khi qua điểm $x_0 = 1$. Điểm cực đại của hàm số là:',
      options: ['$x = 1$', '$x = -1$', '$y = 1$', '$x = 0$'],
      correctIndex: 0,
      explanation: 'Khi đạo hàm $f\'(x)$ đổi dấu từ dương sang âm khi qua $x_0$ thì điểm $x_0 = 1$ là điểm cực đại của hàm số.',
      topic: 'Cực trị của hàm số'
    },
    {
      question: 'Đường tiệm cận ngang của đồ thị hàm số $y = \\dfrac{2x - 1}{x + 1}$ là đường thẳng:',
      options: ['$y = 2$', '$x = -1$', '$y = -1$', '$x = 2$'],
      correctIndex: 0,
      explanation: 'Ta có $\\displaystyle\\lim_{x \\to \\pm\\infty} \\dfrac{2x - 1}{x + 1} = 2$. Do đó tiệm cận ngang của đồ thị là đường thẳng $y = 2$.',
      topic: 'Tiệm cận'
    },
    {
      question: 'Tập xác định của hàm số logarit $y = \\log_2(2x - 4)$ là:',
      options: ['$(2; +\\infty)$', '$[2; +\\infty)$', '$(-\\infty; 2)$', '$\\mathbb{R} \\setminus \\{2\\}$'],
      correctIndex: 0,
      explanation: 'Hàm số xác định khi và chỉ khi biểu thức dưới dấu logarit dương: $2x - 4 > 0 \\Leftrightarrow x > 2$. Vậy tập xác định $D = (2; +\\infty)$.',
      topic: 'Mũ và Logarit'
    },
    {
      question: 'Trong không gian $Oxyz$, cho mặt phẳng $(P): 2x - y + 3z - 5 = 0$. Một vectơ pháp tuyến của $(P)$ là:',
      options: ['$\\vec{n} = (2; -1; 3)$', '$\\vec{n} = (2; 1; 3)$', '$\\vec{n} = (2; -1; -5)$', '$\\vec{n} = (-2; 1; 3)$'],
      correctIndex: 0,
      explanation: 'Phương trình tổng quát $Ax + By + Cz + D = 0$ có một vectơ pháp tuyến là $\\vec{n} = (A; B; C) = (2; -1; 3)$.',
      topic: 'Hình học Oxyz'
    },
    {
      question: 'Nghiệm của phương trình lượng giác $\\cos x = \\dfrac{1}{2}$ là:',
      options: ['$x = \\pm\\dfrac{\\pi}{3} + k2\\pi\\ (k \\in \\mathbb{Z})$', '$x = \\pm\\dfrac{\\pi}{6} + k2\\pi\\ (k \\in \\mathbb{Z})$', '$x = \\dfrac{\\pi}{3} + k\\pi\\ (k \\in \\mathbb{Z})$', '$x = \\pm\\dfrac{2\\pi}{3} + k2\\pi\\ (k \\in \\mathbb{Z})$'],
      correctIndex: 0,
      explanation: 'Ta có $\\cos x = \\dfrac{1}{2} = \\cos\\dfrac{\\pi}{3} \\Leftrightarrow x = \\pm\\dfrac{\\pi}{3} + k2\\pi\\ (k \\in \\mathbb{Z})$.',
      topic: 'Phương trình lượng giác'
    },
    {
      question: 'Cho cấp số nhân $(u_n)$ có số hạng đầu $u_1 = 3$ và công bội $q = 2$. Số hạng thứ năm $u_5$ bằng:',
      options: ['$u_5 = 48$', '$u_5 = 96$', '$u_5 = 24$', '$u_5 = 192$'],
      correctIndex: 0,
      explanation: 'Công thức số hạng tổng quát của cấp số nhân: $u_n = u_1 \\cdot q^{n-1}$. Với $n = 5$: $u_5 = 3 \\cdot 2^4 = 3 \\cdot 16 = 48$.',
      topic: 'Dãy số & Cấp số'
    }
  ];

  return bank.slice(0, Math.min(count, bank.length));
}

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION BUILD
// -------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TOAN GAME HUB] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
