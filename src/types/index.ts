export type UserRole = 'teacher' | 'student' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  code?: string;
  className?: string;
  avatar?: string;
  school?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  grade: number;
  studentCount: number;
  homeroom: string;
}

export interface Student {
  id: string;
  code: string;
  name: string;
  classId: string;
  grade: number;
  username: string;
  status: 'active' | 'locked';
  totalPoints: number;
  gamesPlayed: number;
  badge?: string;
}

export type GameCategory =
  | 'trac-nghiem'
  | 'tu-duy'
  | 'hinh-hoc'
  | 'tuong-tac'
  | 'giai-tri';

export interface GameItem {
  id: string;
  title: string;
  category: GameCategory;
  categoryName: string;
  grade: number | 'all';
  topic: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó' | 'Nâng cao';
  questionsCount: number;
  durationMinutes: number;
  maxScore: number;
  active: boolean;
  description: string;
  color: string;
  bgCard: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'powerpoint' | 'html' | 'video' | 'embed';
  fileSize?: string;
  embedCode?: string;
  isUploaded?: boolean;
  isDefault?: boolean;
  authorName?: string;
  uploadedAt?: string;
}

export interface Question {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
  grade?: number;
}

export interface GameRoom {
  id: string;
  code: string;
  title: string;
  gameId: string;
  gameTitle: string;
  classes: string[];
  startTime: string;
  endTime: string;
  maxAttempts: number;
  allowReplay: boolean;
  status: 'active' | 'ended';
  participantsCount: number;
  createdBy: string;
}

export interface GameAttempt {
  id: string;
  studentCode: string;
  studentName: string;
  className: string;
  gameId: string;
  gameTitle: string;
  roomCode?: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  score: number;
  status: 'completed' | 'in_progress';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export interface AppSettings {
  schoolName: string;
  teacherName: string;
  subject: string;
  phone: string;
  website: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  aiModel: string;
}

