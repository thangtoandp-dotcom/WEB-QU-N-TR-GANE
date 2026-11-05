import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  GraduationCap,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { Student, ClassItem, UserProfile } from '../types';
import { api, excelService } from '../services/api';

interface ClassesViewProps {
  students: Student[];
  classes: ClassItem[];
  currentUser: UserProfile;
  onRefreshData: () => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  students,
  classes,
  currentUser,
  onRefreshData
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formClassId, setFormClassId] = useState(classes[0]?.name || classes[0]?.id || '12A3');
  const [formStatus, setFormStatus] = useState<'active' | 'locked'>('active');

  const isMatchClass = (studentClass: string, targetClass: string) => {
    if (!targetClass || targetClass === 'all') return true;
    if (!studentClass) return false;
    const s = studentClass.trim().toLowerCase().replace(/^c/, '');
    const t = targetClass.trim().toLowerCase().replace(/^c/, '');
    return s === t || studentClass === targetClass;
  };

  const filteredStudents = students.filter((s) => {
    if (selectedClassId !== 'all' && !isMatchClass(s.classId, selectedClassId)) return false;
    if (selectedGrade !== 'all' && s.grade.toString() !== selectedGrade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.classId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportExcel = () => {
    excelService.exportStudents(filteredStudents);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedStudents = await excelService.importStudentsFromFile(file);
      if (parsedStudents.length > 0) {
        await api.bulkAddStudents(parsedStudents);
        alert(`Đã nhập thành công ${parsedStudents.length} học sinh từ tệp Excel!`);
        onRefreshData();
      } else {
        alert('Tệp Excel không chứa dữ liệu học sinh phù hợp.');
      }
    } catch (err) {
      alert('Lỗi đọc tệp Excel: Vui lòng kiểm tra định dạng cột (Mã học sinh, Họ và tên, Lớp).');
    }
    e.target.value = '';
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormName('');
    setFormCode(`HS${Math.floor(1000 + Math.random() * 9000)}`);
    setFormClassId(classes[0]?.name || classes[0]?.id || '12A3');
    setFormStatus('active');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setFormName(s.name);
    setFormCode(s.code);
    setFormClassId(s.classId);
    setFormStatus(s.status);
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find((c) => c.id === formClassId);
    const grade = targetClass ? targetClass.grade : 10;

    if (editingStudent) {
      await api.updateStudent(editingStudent.id, {
        name: formName,
        code: formCode,
        classId: formClassId,
        grade,
        status: formStatus
      });
    } else {
      await api.addStudent({
        name: formName,
        code: formCode,
        classId: formClassId,
        grade,
        username: formCode.toLowerCase(),
        status: formStatus,
        totalPoints: 0,
        gamesPlayed: 0
      });
    }

    setIsAddModalOpen(false);
    onRefreshData();
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa học sinh ${name} khỏi danh sách?`)) {
      await api.deleteStudent(id);
      onRefreshData();
    }
  };

  const handleToggleLock = async (s: Student) => {
    const newStatus = s.status === 'active' ? 'locked' : 'active';
    await api.updateStudent(s.id, { status: newStatus });
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#0878DC]/20 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B8E] font-serif flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-[#0878DC]" />
              <span>Quản Lý Lớp Học & Học Sinh THPT Đan Phượng</span>
            </h2>
            <p className="text-slate-600 font-serif text-base mt-0.5">
              Giáo viên phụ trách: <strong>Thầy Bùi Ngọc Thắng</strong> • Tổng số: {students.length} học sinh
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 shadow cursor-pointer transition-colors"
              title="Xuất tệp Excel"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>

            <label className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 shadow cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Nhập Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>

            <button
              onClick={handleOpenAdd}
              className="bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 shadow cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm học sinh</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Grade Filter */}
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span>Khối:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1 text-sm bg-slate-50 font-serif"
              >
                <option value="all">Tất cả khối</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span>Lớp:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1 text-sm bg-slate-50 font-serif"
              >
                <option value="all">Tất cả các lớp</option>
                {classes.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name} ({c.homeroom || 'Thầy Bùi Ngọc Thắng'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên, mã HS..."
              className="w-full bg-[#EAF5FF] border border-[#0878DC]/30 rounded-xl pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0878DC]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Class Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {classes.map((cls) => {
          const countInClass = students.filter((s) => isMatchClass(s.classId, cls.name) || isMatchClass(s.classId, cls.id)).length;
          const isSelected = isMatchClass(selectedClassId, cls.name);

          return (
            <div
              key={cls.id || cls.name}
              onClick={() => setSelectedClassId(isSelected ? 'all' : cls.name)}
              className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0878DC] text-white border-[#0878DC] shadow-md scale-105'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-[#0878DC]'
              }`}
            >
              <div className="font-bold font-serif text-xl">{cls.name}</div>
              <div className={`text-sm mt-0.5 font-bold ${isSelected ? 'text-blue-100' : 'text-[#0878DC]'}`}>
                {countInClass} học sinh
              </div>
              <div className={`text-xs mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                {cls.homeroom || 'Thầy Bùi Ngọc Thắng'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl shadow-md border-2 border-[#0878DC]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-serif text-base">
            <thead className="bg-[#EAF5FF] text-[#063B8E] font-bold text-sm border-b-2 border-[#0878DC]/20">
              <tr>
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Mã học sinh</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4 text-center">Lớp</th>
                <th className="py-3 px-4 text-center">Khối</th>
                <th className="py-3 px-4 text-center">Tài khoản</th>
                <th className="py-3 px-4 text-center">Lượt chơi</th>
                <th className="py-3 px-4 text-center">Tổng điểm</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 text-slate-500 text-sm">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0878DC] text-sm">{s.code}</td>
                  <td className="py-3 px-4 font-bold text-[#063B8E]">{s.name}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{s.classId}</td>
                  <td className="py-3 px-4 text-center text-sm">{s.grade}</td>
                  <td className="py-3 px-4 text-center font-mono text-xs text-slate-500">{s.username}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">{s.gamesPlayed || 0}</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-600">{s.totalPoints || 0}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        s.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {s.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleLock(s)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title={s.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {s.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-slate-500 hover:text-[#0878DC] rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteStudent(s.id, s.name)}
                        className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Xóa học sinh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-4 border-[#0878DC] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xl font-bold font-serif text-[#063B8E]">
                {editingStudent ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Mã học sinh:
                </label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2 text-base font-mono focus:border-[#0878DC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Họ và tên:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2 text-base font-serif focus:border-[#0878DC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Lớp học:
                </label>
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-base font-serif focus:border-[#0878DC] focus:outline-none cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Khối {c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Trạng thái:
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-base font-serif focus:border-[#0878DC] focus:outline-none cursor-pointer"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="locked">Tạm khóa</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer font-serif"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0878DC] hover:bg-[#0664B8] text-white font-bold cursor-pointer font-serif shadow"
                >
                  {editingStudent ? 'Cập nhật' : 'Lưu học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
