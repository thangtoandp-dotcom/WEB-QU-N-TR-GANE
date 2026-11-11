import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCode, 
  FileSpreadsheet, 
  Presentation, 
  Video,
  Link, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HelpCircle,
  Sparkles,
  Film
} from 'lucide-react';
import { GameItem, GameCategory } from '../../types';
import { api } from '../../services/api';

interface GameUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: GameCategory;
  onGameUploaded: (newGame: GameItem) => void;
}

export const GameUploadModal: React.FC<GameUploadModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'trac-nghiem',
  onGameUploaded
}) => {
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'powerpoint' | 'html' | 'video' | 'embed'>('powerpoint');
  const [fileSizeStr, setFileSizeStr] = useState('');
  
  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GameCategory>(
    defaultCategory === 'giai-tri' ? 'giai-tri' : 'trac-nghiem'
  );
  const [grade, setGrade] = useState<number | 'all'>('all');
  const [topic, setTopic] = useState('Chuyên đề Toán THPT');
  const [difficulty, setDifficulty] = useState<'Dễ' | 'Trung bình' | 'Khó' | 'Nâng cao'>('Trung bình');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [maxScore, setMaxScore] = useState(100);
  const [description, setDescription] = useState('');
  const [embedLink, setEmbedLink] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setErrorMsg('');

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'mp4' || ext === 'webm' || ext === 'm4v') {
      setFileType('video');
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
      if (!topic) setTopic('Video Game Toán học tương tác');
    } else if (ext === 'ppt' || ext === 'pptx' || ext === 'ppsx') {
      setFileType('powerpoint');
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
      if (!topic) setTopic('Chuyên đề PowerPoint tương tác');
    } else if (ext === 'html' || ext === 'htm' || ext === 'htlm') {
      setFileType('html');
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
      if (!topic) setTopic('Trò chơi tương tác HTML5');
    } else {
      setErrorMsg('Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp Game (.html, .htlm, .ppt, .pptx, .mp4).');
      setSelectedFile(null);
      return;
    }

    const kb = (file.size / 1024).toFixed(1);
    setFileSizeStr(file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${kb} KB`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên trò chơi!');
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      setErrorMsg('Vui lòng chọn tệp Game (.html, .htlm, .ppt, .pptx, .mp4) để tải lên!');
      return;
    }

    if (uploadMode === 'link' && !embedLink.trim()) {
      setErrorMsg('Vui lòng nhập liên kết hoặc mã nhúng iframe của trò chơi!');
      return;
    }

    setIsUploading(true);

    try {
      let finalFileUrl = '';
      let finalFileType = fileType;
      let finalFileSize = fileSizeStr;

      let htmlContent = '';
      if (uploadMode === 'file' && selectedFile) {
        // Read file as base64
        const reader = new FileReader();
        const fileDataPromise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        const fileData = await fileDataPromise;
        const uploadRes = await api.uploadGameFile(selectedFile.name, fileData, fileType);

        if (!uploadRes.success || !uploadRes.fileUrl) {
          throw new Error(uploadRes.message || 'Không thể tải tệp lên máy chủ');
        }

        finalFileUrl = uploadRes.fileUrl;
        finalFileType = uploadRes.fileType || fileType;
        finalFileSize = uploadRes.fileSize || fileSizeStr;

        // If file is HTML, also read raw text for instant inline rendering fallback
        if (finalFileType === 'html') {
          try {
            htmlContent = await selectedFile.text();
          } catch (e) {
            console.warn('Could not read HTML text:', e);
          }
        }
      } else if (uploadMode === 'link') {
        finalFileUrl = embedLink.trim();
        finalFileType = 'embed';
        finalFileSize = 'Trực tuyến';
      }

      // Determine category Name
      let catName = 'Game Trắc nghiệm Toán học';
      if (category === 'giai-tri') catName = 'Game Giải trí Không giới hạn';
      else if (category === 'hinh-hoc') catName = 'Game Hình học';
      else if (category === 'tu-duy') catName = 'Game Tư duy và Trí tuệ';
      else if (category === 'tuong-tac') catName = 'Game Tương tác';

      // Pick background color based on type and category
      let color = '#0878DC';
      let bgCard = '#E0F2FE';
      if (finalFileType === 'video') {
        color = '#8B5CF6';
        bgCard = '#F3E8FF';
      } else if (finalFileType === 'powerpoint') {
        color = '#EA580C';
        bgCard = '#FFEDD5';
      } else if (category === 'giai-tri') {
        color = '#E11D48';
        bgCard = '#FFE4E6';
      }

      const typeLabel = finalFileType === 'video' ? 'Video Game (.mp4)' : finalFileType === 'powerpoint' ? 'PowerPoint (.pptx/.ppt)' : 'HTML5';
      const gameId = `game_upload_${Date.now()}`;

      const newGame: GameItem = {
        id: gameId,
        title: title.trim(),
        category,
        categoryName: catName,
        grade,
        topic: topic.trim() || 'Toán THPT',
        difficulty,
        questionsCount: finalFileType === 'powerpoint' ? 10 : (finalFileType === 'video' ? 5 : 1),
        durationMinutes: Number(durationMinutes) || 15,
        maxScore: Number(maxScore) || 100,
        active: true,
        description: description.trim() || `Tệp trò chơi dạng ${typeLabel} do giáo viên Bùi Ngọc Thắng tải lên lưu trữ tại Kho trò chơi.`,
        color,
        bgCard,
        fileUrl: finalFileUrl,
        fileName: selectedFile ? selectedFile.name : (embedLink.slice(0, 30) + '...'),
        fileType: finalFileType,
        fileSize: finalFileSize,
        embedCode: uploadMode === 'link' ? embedLink.trim() : (htmlContent ? htmlContent : undefined),
        isUploaded: true,
        isDefault: false,
        authorName: 'Thầy Bùi Ngọc Thắng',
        uploadedAt: new Date().toISOString()
      };

      const created = await api.addGame(newGame);
      if (created) {
        onGameUploaded(created);
        onClose();
      } else {
        throw new Error('Không thể lưu trò chơi vào thư viện');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi tải trò chơi lên!');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto font-serif">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-4 border-[#0878DC] shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#063B8E] to-[#0878DC] flex items-center justify-center text-white shadow-md">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#063B8E]">
                Tải Lên File Game Vào Kho Trò Chơi
              </h3>
              <p className="text-slate-500 text-sm">
                Hỗ trợ tải tệp: <strong>.html (.htlm), .ppt, .pptx, .mp4</strong> lưu trữ trực tiếp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Method Tabs: File Upload vs Web Embed */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-sm font-bold">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                uploadMode === 'file' ? 'bg-[#0878DC] text-white shadow-md' : 'text-slate-600 hover:bg-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Tải file từ máy tính (.html, .ppt, .pptx, .mp4)</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className={`py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                uploadMode === 'link' ? 'bg-[#0878DC] text-white shadow-md' : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Link className="w-4 h-4" />
              <span>Nhúng liên kết trực tuyến</span>
            </button>
          </div>

          {/* Mode 1: File Upload Box */}
          {uploadMode === 'file' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#0878DC]/60 hover:border-[#0878DC] bg-[#EAF5FF]/60 hover:bg-[#EAF5FF] rounded-2xl p-6 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pptx,.ppt,.ppsx,.html,.htm,.htlm,.mp4,.webm,.m4v"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* 3 Supported File Badges */}
              <div className="flex flex-wrap justify-center gap-2.5 mb-3">
                <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl border border-purple-200 flex items-center gap-1.5 text-xs font-bold shadow-xs">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>Video Game (.mp4)</span>
                </div>
                <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-200 flex items-center gap-1.5 text-xs font-bold shadow-xs">
                  <Presentation className="w-4 h-4 text-amber-600" />
                  <span>PowerPoint (.ppt, .pptx)</span>
                </div>
                <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-1.5 text-xs font-bold shadow-xs">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>HTML Web Game (.html, .htlm)</span>
                </div>
              </div>

              {selectedFile ? (
                <div className="space-y-1.5 bg-white/80 p-3 rounded-xl border border-[#0878DC]/30 max-w-md mx-auto">
                  <div className="font-bold text-[#063B8E] text-base flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="truncate">{fileName}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-white ${
                      fileType === 'video' ? 'bg-purple-600' : fileType === 'powerpoint' ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}>
                      {fileType === 'video' ? '🎬 VIDEO GAME (.MP4)' : fileType === 'powerpoint' ? '📊 POWERPOINT' : '💻 HTML5 GAME'}
                    </span>
                    <span className="text-slate-500">Dung lượng: <strong>{fileSizeStr}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-xs text-[#0878DC] hover:underline pt-1 cursor-pointer block mx-auto font-bold"
                  >
                    Bấm để chọn tệp khác
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-base font-bold text-slate-800">
                    Kéo thả file Game hoặc bấm vào đây để duyệt tệp từ máy tính
                  </div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Hỗ trợ tệp <strong>.html (.htlm)</strong>, <strong>.ppt, .pptx</strong> và <strong>.mp4</strong> (dung lượng tối đa 150MB). File sau khi tải sẽ được lưu trữ vĩnh viễn trong Kho trò chơi.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Liên kết Game hoặc mã nhúng iFrame:
              </label>
              <input
                type="text"
                value={embedLink}
                onChange={(e) => setEmbedLink(e.target.value)}
                placeholder="https://view.officeapps.live.com/... hoặc link PowerPoint Online, Canva, Wordwall..."
                className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base focus:border-[#0878DC] focus:outline-none"
              />
              <span className="text-xs text-slate-500 block">
                Hỗ trợ đường link từ PowerPoint Online, Canva, Genially, Wordwall, Desmos hoặc mã nhúng &lt;iframe&gt;
              </span>
            </div>
          )}

          {/* Form details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Tên trò chơi: *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Game PowerPoint: Đạo Hàm & Hàm Số"
                className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2 text-base focus:border-[#0878DC] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Phân hệ trò chơi: *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GameCategory)}
                className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-base focus:border-[#0878DC] focus:outline-none cursor-pointer bg-white"
              >
                <option value="trac-nghiem">Trò chơi Toán học - Trắc nghiệm kiến thức</option>
                <option value="tu-duy">Trò chơi Toán học - Tư duy & Trí tuệ</option>
                <option value="hinh-hoc">Trò chơi Toán học - Hình học & Đồ thị</option>
                <option value="tuong-tac">Trò chơi Toán học - Tương tác</option>
                <option value="giai-tri">Trò chơi Giải trí - Thư giãn & Phản xạ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Khối lớp áp dụng:
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-base focus:border-[#0878DC] focus:outline-none cursor-pointer bg-white"
              >
                <option value="all">Tất cả các khối (10, 11, 12)</option>
                <option value="10">Khối 10 THPT</option>
                <option value="11">Khối 11 THPT</option>
                <option value="12">Khối 12 THPT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Chủ đề kiến thức:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Khảo sát hàm số, Hình Oxyz, Giải trí..."
                className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2 text-base focus:border-[#0878DC] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Thời gian chơi (phút):
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2 text-base focus:border-[#0878DC] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Điểm tối đa:
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full border-2 border-slate-300 rounded-xl px-3.5 py-2 text-base focus:border-[#0878DC] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Mô tả ngắn & Hướng dẫn chơi:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập hướng dẫn ngắn cho học sinh trước khi chơi game này..."
              className="w-full border-2 border-slate-300 rounded-xl p-2.5 text-base focus:border-[#0878DC] focus:outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Tính năng Toàn Màn Hình:</strong> Khi học sinh hoặc giáo viên bấm "Bắt đầu chơi", hệ thống sẽ cung cấp nút <strong>Mở rộng hết màn hình máy tính (Fullscreen)</strong> để trình chiếu trò chơi sống động, không bị phân tâm.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#063B8E] to-[#0878DC] hover:from-[#052C6E] hover:to-[#0664B8] text-white font-bold cursor-pointer shadow-lg flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tải lên...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  <span>Lưu & Tải game lên</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
