import React, { useState } from 'react';
import { X, GraduationCap, Users, ShieldCheck, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { UserProfile, Student } from '../types';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole: 'teacher' | 'student';
  onLoginSuccess: (profile: UserProfile) => void;
  studentsList: Student[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  defaultRole,
  onLoginSuccess,
  studentsList
}) => {
  const [role, setRole] = useState<'teacher' | 'student'>(defaultRole);
  const [teacherPasscode, setTeacherPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedStudentCode, setSelectedStudentCode] = useState(studentsList[0]?.code || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-sync when studentsList finishes loading
  React.useEffect(() => {
    if (studentsList.length > 0 && (!selectedStudentCode || !studentsList.some(s => s.code === selectedStudentCode))) {
      setSelectedStudentCode(studentsList[0].code);
    }
  }, [studentsList, selectedStudentCode]);

  if (!isOpen) return null;

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const entered = teacherPasscode.trim();
    if (!entered) {
      setErrorMsg('Vui lòng nhập mật khẩu quản trị viên.');
      return;
    }

    try {
      if (entered === '768306') {
        const adminProfile: UserProfile = {
          id: 'T-BNT',
          name: 'Thầy Bùi Ngọc Thắng',
          role: 'teacher',
          school: 'Trường THPT Đan Phượng'
        };
        try {
          sessionStorage.setItem('toan_admin_auth', 'true');
        } catch {}
        onLoginSuccess(adminProfile);
        onClose();
        return;
      }

      const res = await api.teacherLogin(entered);
      if (res.success && res.profile) {
        try {
          sessionStorage.setItem('toan_admin_auth', 'true');
        } catch {}
        onLoginSuccess(res.profile);
        onClose();
      } else {
        setErrorMsg('Mật khẩu quản trị viên chưa chính xác. Vui lòng thử lại!');
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ xác thực.');
    }
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const st = studentsList.find((s) => s.code === selectedStudentCode);
    if (st) {
      onLoginSuccess({
        id: st.id,
        code: st.code,
        name: st.name,
        role: 'student',
        className: st.classId,
        school: 'Trường THPT Đan Phượng'
      });
      onClose();
    } else {
      setErrorMsg('Vui lòng chọn học sinh hợp lệ.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-[#0878DC] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#063B8E] to-[#0878DC] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              {role === 'teacher' ? <GraduationCap className="w-6 h-6 text-[#FFDE59]" /> : <Users className="w-6 h-6 text-[#00CFFF]" />}
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif leading-none">
                Đăng nhập hệ thống
              </h3>
              <p className="text-xs text-[#E0F2FE] mt-1 font-sans">
                TOAN GAME HUB • THPT Đan Phượng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Role Toggle Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2">
          <button
            type="button"
            onClick={() => { setRole('teacher'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl font-bold font-serif text-base flex items-center justify-center gap-2 cursor-pointer transition-all ${
              role === 'teacher'
                ? 'bg-[#063B8E] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#FFDE59]" />
            <span>Giáo viên</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('student'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl font-bold font-serif text-base flex items-center justify-center gap-2 cursor-pointer transition-all ${
              role === 'student'
                ? 'bg-[#16A34A] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-white" />
            <span>Học sinh</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          {role === 'teacher' ? (
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div className="p-3 bg-[#EAF5FF] rounded-xl border border-[#0878DC]/30 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#0878DC] shrink-0" />
                <div className="text-sm">
                  <div className="font-bold text-[#063B8E]">Tài khoản Giáo viên phụ trách:</div>
                  <div className="text-slate-700">Thầy Bùi Ngọc Thắng (Toán THPT Đan Phượng)</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Mật khẩu Quản trị viên:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={teacherPasscode}
                    onChange={(e) => setTeacherPasscode(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị viên"
                    className="w-full border-2 border-slate-300 rounded-xl pl-3.5 pr-11 py-2.5 text-base focus:border-[#0878DC] focus:outline-none font-sans tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-serif">
                  <Lock className="w-3 h-3 text-[#0878DC]" />
                  <span>Chỉ Quản trị viên mới có quyền truy cập và chỉnh sửa hệ thống.</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#063B8E] hover:bg-[#052C6E] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg transition-transform transform active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-[#FFDE59]" />
                <span>Đăng nhập Giáo viên</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Chọn học sinh tham gia:
                </label>
                <select
                  value={selectedStudentCode}
                  onChange={(e) => setSelectedStudentCode(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-xl px-3 py-2.5 text-base focus:border-[#16A34A] focus:outline-none font-serif cursor-pointer"
                >
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.code}>
                      {st.name} - {st.classId} (Mã: {st.code}) - {st.totalPoints} điểm
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <div className="font-bold">✨ Điểm cộng học tập:</div>
                <div>Học sinh tham gia trò chơi sẽ tự động tích lũy điểm số, mở khóa huy hiệu và ghi danh lên Bảng Vàng THPT Đan Phượng.</div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg transition-transform transform active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Vào học & chơi game</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
