import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Search, Eye, Key, Sparkles, Clock, Coins, ShieldCheck, 
  Save, Plus, Trash2, Upload, Camera, X, Globe, Library as LibraryIcon, Bookmark, Filter
} from 'lucide-react';
import { canUserCRUDLibrary, getDhivehiFormat } from '../utils/helpers';
import { supabase } from '../lib/supabase';

export default function LibraryTab({
  role, books, setBooks, coins, setCoins, setXp, readingHours, setReadingHours,
  claimedCodes, setClaimedCodes, showToast, askConfirm
}) {
  const [formatFilter, setFormatFilter] = useState('All'); // 'All' | 'online' | 'offline'
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [previewBook, setPreviewBook] = useState(null);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [librarianCodeInput, setLibrarianCodeInput] = useState('');

  // New Book Form State (Admin/Teacher)
  const [bookTitle, setBookTitle] = useState('');
  const [bookSubject, setBookSubject] = useState('Physics');
  const [bookGrade, setBookGrade] = useState(7);
  const [isOnline, setIsOnline] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [desc, setDesc] = useState('');
  const [content, setContent] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(1.0);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Digital Reading Resumable Timer State
  const [activeReadingSeconds, setActiveReadingSeconds] = useState(0);
  const [sessionStartSeconds, setSessionStartSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = useRef(null);
  const coverInputRef = useRef(null);

  const canEditLibrary = canUserCRUDLibrary(role);

  // -------------------------------------------------------------
  // 1. OPEN BOOK READER & RESUME TIMER
  // -------------------------------------------------------------
  const handleOpenBookReader = (book) => {
    setPreviewBook(book);
    const savedBookProgressKey = `edusparkls_book_sec_${book.id}`;
    const savedSeconds = parseInt(localStorage.getItem(savedBookProgressKey) || '0', 10);
    setActiveReadingSeconds(savedSeconds);
    setSessionStartSeconds(savedSeconds);
    setIsTimerPaused(false);
  };

  useEffect(() => {
    if (!previewBook) {
      setActiveReadingSeconds(0);
      setSessionStartSeconds(0);
      return;
    }

    const handleVisibilityChange = () => {
      setIsTimerPaused(document.visibilityState === 'hidden');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    timerRef.current = setInterval(() => {
      if (document.visibilityState === 'visible' && !isTimerPaused) {
        setActiveReadingSeconds(prev => prev + 1);
      }
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [previewBook, isTimerPaused]);

  const handleCloseBookReader = () => {
    if (!previewBook) return;

    const savedBookProgressKey = `edusparkls_book_sec_${previewBook.id}`;
    localStorage.setItem(savedBookProgressKey, activeReadingSeconds.toString());

    const incrementalSeconds = Math.max(0, activeReadingSeconds - sessionStartSeconds);

    if (incrementalSeconds >= 5) {
      const hoursAdded = parseFloat((incrementalSeconds / 3600).toFixed(3));
      const coinsEarned = Math.floor((incrementalSeconds / 3600) * 50);
      const xpEarned = Math.floor((incrementalSeconds / 3600) * 75);

      setReadingHours(prev => {
        const nextHours = parseFloat((prev + hoursAdded).toFixed(2));
        localStorage.setItem('edusparkls_reading_hours', nextHours.toString());
        return nextHours;
      });

      if (coinsEarned > 0) setCoins(c => c + coinsEarned);
      if (xpEarned > 0) setXp(x => x + xpEarned);

      const mins = Math.floor(incrementalSeconds / 60);
      const secs = incrementalSeconds % 60;
      showToast(`💾 Progress Saved! Read for ${mins}m ${secs}s. Endpoint saved at ${formatTimerDisplay(activeReadingSeconds)}.`, "success");
    }

    setPreviewBook(null);
    setActiveReadingSeconds(0);
    setSessionStartSeconds(0);
  };

  // -------------------------------------------------------------
  // 2. LIBRARIAN CODE REDEMPTION (Physical Library)
  // -------------------------------------------------------------
  const handleRedeemLibrarianCode = (e) => {
    e.preventDefault();
    const cleanCode = librarianCodeInput.trim().toUpperCase();
    if (!cleanCode) return showToast("Please enter a librarian code", "warning");

    if (claimedCodes.includes(cleanCode)) {
      return showToast("⚠️ Code already claimed!", "warning");
    }

    const presetCodes = {
      'LIB-1HR': { hours: 1 },
      'LIB-2HR': { hours: 2 },
      'LIB-3HR': { hours: 3 },
      'READ1': { hours: 1 },
      'READ2': { hours: 2 },
      'DHIVEHI100': { hours: 2 }
    };

    let earnedHours = 0;
    if (presetCodes[cleanCode]) {
      earnedHours = presetCodes[cleanCode].hours;
    } else {
      const match = cleanCode.match(/(?:LIB|READ|BOOK)[-]?(\d+)/i);
      if (match && match[1]) earnedHours = parseInt(match[1], 10);
    }

    if (earnedHours > 0) {
      const earnedCoins = earnedHours * 50;
      const earnedXp = earnedHours * 75;

      setReadingHours(prev => {
        const nextHours = parseFloat((prev + earnedHours).toFixed(2));
        localStorage.setItem('edusparkls_reading_hours', nextHours.toString());
        return nextHours;
      });

      setCoins(c => c + earnedCoins);
      setXp(x => x + earnedXp);
      setClaimedCodes(prev => [...prev, cleanCode]);
      setLibrarianCodeInput('');

      showToast(`🎉 Code Verified! +${earnedHours} Reading Hours & +${earnedCoins} Coins added to your account!`, "success");
    } else {
      showToast("❌ Invalid librarian code. Check code handed by your school librarian!", "error");
    }
  };

  // -------------------------------------------------------------
  // 3. ADMIN ADD & DELETE BOOK HANDLERS
  // -------------------------------------------------------------
  const handleCoverFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
      setUploadingCover(false);
      showToast("📸 Cover image attached!", "info");
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookTitle.trim()) return showToast("Enter book title", "warning");

    const newBook = {
      id: `book_${Date.now()}`,
      title: bookTitle.trim(),
      subject: bookSubject,
      grade: parseInt(bookGrade),
      is_online: isOnline,
      is_offline: isOffline,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      excerpt: excerpt.trim(),
      desc: desc.trim(),
      content: content.trim(),
      estimated_hours: parseFloat(estimatedHours) || 1.0
    };

    setBooks(prev => [newBook, ...prev]);
    setShowAddBookModal(false);

    // Persist to Supabase
    try {
      const { error } = await supabase.from('books').insert([newBook]);
      if (error) {
        showToast(`⚠️ Supabase Save Alert: ${error.message}`, "error");
      } else {
        showToast("🎉 Book saved to E-Library database!", "success");
      }
    } catch (err) {
      console.warn("Supabase book insert error:", err);
    }

    // Reset Form
    setBookTitle(''); setExcerpt(''); setDesc(''); setContent(''); setImageUrl('');
  };

  const handleDeleteBook = (bookId, title) => {
    askConfirm("Delete Book", `Remove "${title}" from the library database?`, async () => {
      setBooks(prev => prev.filter(b => b.id !== bookId));
      try {
        await supabase.from('books').delete().eq('id', bookId);
        showToast(`Removed "${title}" from library.`, "info");
      } catch (err) {
        console.warn("Delete book error:", err);
      }
    });
  };

  const formatTimerDisplay = (totalSecs) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` 
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filtered Books List
  const filteredBooks = books.filter(b => {
    const matchesFormat = 
      formatFilter === 'All' ||
      (formatFilter === 'online' && b.is_online) ||
      (formatFilter === 'offline' && b.is_offline);

    const matchesSubject = selectedSubject === 'All' || b.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'All' || String(b.grade) === String(selectedGrade);
    const matchesQuery = `${b.title} ${b.subject} ${b.desc} ${b.excerpt}`.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFormat && matchesSubject && matchesGrade && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div className="space-y-2">
          <span className="bg-blue-400/20 border border-blue-300/30 text-blue-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center space-x-1.5 w-fit">
            <BookOpen className="w-3.5 h-3.5" />
            <span>School E-Library & Physical Book Hub</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Edusparkls Library Center</h2>
          <p className="text-blue-100 text-xs max-w-lg">
            Read online e-books or physical library books to earn <strong>50 Coins for every 1 Reading Hour</strong>!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl flex items-center space-x-3">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black text-base">⌛</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Total Reading Hours</span>
              <span className="text-lg font-black text-amber-300">{readingHours} Hours</span>
            </div>
          </div>

          {canEditLibrary && (
            <button
              onClick={() => setShowAddBookModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-3 rounded-2xl text-xs transition shadow-md flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Book</span>
            </button>
          )}
        </div>
      </div>

      {/* Librarian Physical Code Redemption Bar */}
      <div className="bg-gradient-to-r from-amber-500 to-rose-600 rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-md flex items-center space-x-1 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>School Librarian Physical Code Verification</span>
          </span>
          <h3 className="font-black text-base">Claim Coins for Physical Library Books</h3>
          <p className="text-xs text-amber-100">
            Read a book in the school library? Enter code given by your librarian to claim <strong>50 Coins / Hour</strong>.
          </p>
        </div>

        <form onSubmit={handleRedeemLibrarianCode} className="flex space-x-2 w-full sm:w-auto shrink-0">
          <input
            type="text"
            value={librarianCodeInput}
            onChange={(e) => setLibrarianCodeInput(e.target.value)}
            placeholder="e.g. LIB-1HR"
            className="bg-white/10 border border-white/30 text-white placeholder-amber-200 text-xs font-mono font-bold px-3 py-2.5 rounded-xl uppercase focus:outline-none focus:bg-white/20 w-full sm:w-44"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-950 text-amber-400 font-black px-4 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center space-x-1 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Claim Coins</span>
          </button>
        </form>
      </div>

      {/* SEARCH & MULTI-FILTER CONTROL BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Format Tabs: All | Online E-Books | Physical Library */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold w-full md:w-auto">
            <button
              onClick={() => setFormatFilter('All')}
              className={`px-3.5 py-1.5 rounded-xl transition ${formatFilter === 'All' ? 'bg-indigo-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Books ({books.length})
            </button>
            <button
              onClick={() => setFormatFilter('online')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1 ${formatFilter === 'online' ? 'bg-indigo-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Online E-Books</span>
            </button>
            <button
              onClick={() => setFormatFilter('offline')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1 ${formatFilter === 'offline' ? 'bg-indigo-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <LibraryIcon className="w-3.5 h-3.5" />
              <span>Physical Library</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, Dhivehi, excerpt..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Subject & Grade Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
          <span className="flex items-center space-x-1 text-slate-400 text-[11px] uppercase tracking-wider">
            <Filter className="w-3 h-3" />
            <span>Filters:</span>
          </span>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            <option value="All">All Subjects</option>
            {['Dhivehi', 'Islam', 'Quran', 'Physics', 'Maths', 'Chemistry', 'Biology', 'Economics'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            <option value="All">All Grades</option>
            {[7, 8, 9, 10].map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* BOOK GRID WITH IMAGE COVERS */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-medium">
          No books match your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const format = getDhivehiFormat(book.subject, book.title);
            const estHours = book.estimated_hours || 1.0;
            const rewardCoins = Math.round(estHours * 50);
            const savedBookSecs = parseInt(localStorage.getItem(`edusparkls_book_sec_${book.id}`) || '0', 10);

            return (
              <div key={book.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs hover:shadow-md transition flex flex-col justify-between relative group">
                <div className="space-y-3">
                  
                  {/* Cover Image Container */}
                  <div className="w-full h-48 bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
                    <img
                      src={book.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'; }}
                    />

                    {/* Online / Offline Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                      {book.is_online && (
                        <span className="bg-blue-950/80 backdrop-blur-xs text-blue-300 border border-blue-400/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Globe className="w-2.5 h-2.5" />
                          <span>Online E-Book</span>
                        </span>
                      )}
                      {book.is_offline && (
                        <span className="bg-amber-950/80 backdrop-blur-xs text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <LibraryIcon className="w-2.5 h-2.5" />
                          <span>Physical Library</span>
                        </span>
                      )}
                    </div>

                    {/* Reward Pill */}
                    <span className="absolute bottom-2.5 right-2.5 bg-slate-900/90 backdrop-blur-xs text-amber-400 border border-amber-500/40 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>{estHours} Hr = {rewardCoins} Coins</span>
                    </span>

                    {/* Admin Delete Action Button */}
                    {canEditLibrary && (
                      <button
                        onClick={() => handleDeleteBook(book.id, book.title)}
                        className="absolute top-2.5 right-2.5 bg-rose-600/90 hover:bg-rose-600 text-white p-1.5 rounded-xl transition shadow-sm"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Title & Excerpt */}
                  <div dir={format.dir}>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-200 w-fit">
                      {book.subject} • Grade {book.grade || 'All'}
                    </span>

                    <h3 className={`font-black text-slate-900 text-base mt-1.5 leading-snug ${format.className}`}>
                      {book.title}
                    </h3>

                    <p className={`text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2 ${format.className}`}>
                      {book.excerpt || book.desc || 'Ministry reference book.'}
                    </p>

                    {savedBookSecs > 0 && (
                      <div className="mt-2 text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                        📍 Saved Endpoint: {formatTimerDisplay(savedBookSecs)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {book.is_online ? (
                    <button
                      onClick={() => handleOpenBookReader(book)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{savedBookSecs > 0 ? 'Resume Reading' : 'Read On Device'}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                      Read at Physical Library 📚
                    </span>
                  )}

                  <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{estHours} Hr Book</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADMIN ADD BOOK MODAL */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black flex items-center space-x-2 text-slate-900">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Add E-Library / Physical Book</span>
              </h3>
              <button onClick={() => setShowAddBookModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBookSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Book Title (English or Dhivehi)</label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g. Physics Optics / ދިވެހި ބަހުގެ ގަވާއިދު"
                  className="w-full border rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Subject</label>
                  <select
                    value={bookSubject}
                    onChange={(e) => setBookSubject(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-bold"
                  >
                    {['Physics', 'Dhivehi', 'Islam', 'Quran', 'Maths', 'Chemistry', 'Biology', 'Economics', 'General'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Target Grade</label>
                  <select
                    value={bookGrade}
                    onChange={(e) => setBookGrade(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-bold"
                  >
                    {[7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Online vs Offline Checkboxes */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-slate-800">Availability Formats:</span>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-1.5 font-bold text-indigo-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOnline}
                      onChange={(e) => setIsOnline(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>📱 Online E-Book</span>
                  </label>

                  <label className="flex items-center space-x-1.5 font-bold text-amber-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOffline}
                      onChange={(e) => setIsOffline(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>📚 Physical Library</span>
                  </label>
                </div>
              </div>

              {/* Cover Image Upload / URL Input */}
              <div className="space-y-2 bg-indigo-50/60 border border-indigo-200/80 p-3.5 rounded-2xl">
                <label className="font-black text-indigo-950 block">Book Cover Image</label>
                <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverFileUpload} className="hidden" />

                {!imageUrl ? (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="w-full bg-white border-2 border-dashed border-indigo-300 hover:border-indigo-500 p-5 rounded-2xl flex flex-col items-center justify-center space-y-1 transition text-indigo-800"
                  >
                    <Upload className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-xs">Click to Upload Cover Image File</span>
                  </button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                    <img src={imageUrl} alt="Cover Preview" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 bg-slate-950/80 text-white p-1 rounded-xl hover:bg-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="font-bold block text-[10px] uppercase text-slate-500">Or Paste Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full border rounded-xl p-2 text-xs bg-white mt-0.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Reading Hours & Coin Reward (50 Coins / Hour)</label>
                <input
                  type="number"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="w-full border rounded-xl p-2.5 font-bold text-amber-600"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Book Excerpt (Summary)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Key concepts covered in this book..."
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Full Chapter Text / Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Paste study text or chapter material..."
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddBookModal(false)} className="w-full bg-slate-100 font-bold py-2.5 rounded-xl">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl shadow-md"
                >
                  Save Book to Library 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL READ-ON-DEVICE MODAL WITH RESUMABLE TIMER */}
      {previewBook && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {(() => {
              const modalFormat = getDhivehiFormat(previewBook.subject, previewBook.title);

              return (
                <div dir={modalFormat.dir} className={modalFormat.className}>
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md">
                        {previewBook.subject}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-1">{previewBook.title}</h3>
                    </div>

                    <button onClick={handleCloseBookReader} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 font-bold">
                      ✕
                    </button>
                  </div>

                  {/* CONTINUOUS RESUMABLE TIMER DISPLAY */}
                  <div className="my-4 bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-inner">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-mono font-black text-sm">
                        ⏱️ {formatTimerDisplay(activeReadingSeconds)}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Continuous Endpoint Timer</span>
                        <span className="text-xs font-bold text-amber-400">
                          {isTimerPaused ? 'Paused (Screen Sleeping or Tab Hidden)' : 'Actively Resumed & Counting...'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate</span>
                      <span className="text-xs font-black text-emerald-400">+50 Coins / 1 Hr</span>
                    </div>
                  </div>

                  {/* Content View */}
                  <div className="py-4 space-y-4 text-sm leading-loose text-slate-700">
                    <p className="font-bold text-slate-900">{previewBook.excerpt || previewBook.desc}</p>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 font-medium space-y-3">
                      <h4 className="font-black text-slate-900">📖 Text Content & Study Material</h4>
                      <p>{previewBook.content || 'މި ފޮތުގެ މުހިންމު ބައިތައް ކިޔުމަށް ސިލެކްޓް ކުރައްވާ. ކިޔުމުގެ ވަގުތު އޮޓޯއިން ރެކޯޑު ކުރެވޭނެއެވެ.'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold">
                      Status: <strong className={isTimerPaused ? "text-rose-600" : "text-emerald-600"}>{isTimerPaused ? 'Paused' : 'Active'}</strong>
                    </span>

                    <button
                      onClick={handleCloseBookReader}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center space-x-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Endpoint & Exit</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}