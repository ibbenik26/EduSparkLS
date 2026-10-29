import React, { useState, useEffect } from 'react';
import { BookOpen, Key, ArrowLeft, ArrowRight, X, Clock, Sparkles, Plus, Trash2, ShieldCheck, Award } from 'lucide-react';
import { isRTLSubject, playSound, canUserCRUDLibrary } from '../utils/helpers';

export default function LibraryTab({ role, books, setBooks, setCoins, setXp, setReadingHours, claimedCodes = [], setClaimedCodes, showToast, askConfirm }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [inputCode, setInputCode] = useState('');

  // Auto-Timer State for Digital Reader
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [autoEarnedForBook, setAutoEarnedForBook] = useState(false);

  // New Book CRUD Modal State
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Dhivehi');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newSecretCode, setNewSecretCode] = useState('');
  const [newEduPoints, setNewEduPoints] = useState(150);

  const canEditLibrary = canUserCRUDLibrary(role);

  // Each book can only pay out its online-reading reward once per student
  const readKey = selectedBook ? `READ:${selectedBook.id}` : null;
  const alreadyRead = !!readKey && claimedCodes.includes(readKey);

  // Online E-Reader timer: only counts seconds (no side effects inside the state updater)
  useEffect(() => {
    if (!selectedBook || autoEarnedForBook || alreadyRead) return;
    const timer = setInterval(() => setSessionSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [selectedBook, autoEarnedForBook, alreadyRead]);

  // Award once the required reading time is reached
  useEffect(() => {
    if (!selectedBook || autoEarnedForBook || alreadyRead) return;
    const requiredSecs = Math.max(15, Math.round((selectedBook.reading_hours || 1) * 15));
    if (sessionSeconds < requiredSecs) return;

    setAutoEarnedForBook(true);
    setClaimedCodes([...claimedCodes, readKey]);
    playSound('coin');
    setCoins(c => c + 100);
    setXp(x => x + 150);
    setReadingHours(h => Number((h + (selectedBook.reading_hours || 1)).toFixed(1)));
    showToast(`🎉 Reading goal reached for "${selectedBook.title}"! +100 Edu Coins & +150 XP`, 'success');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionSeconds]);

  const handlePhysicalCodeClaim = (e) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    if (claimedCodes.includes(code)) {
      showToast("⚠️ You have already claimed Edu Points for this physical book code!", "warning");
      return;
    }

    const matchedBook = books.find(b => (b.claim_code || '').toUpperCase() === code);
    if (!matchedBook) {
      showToast("❌ Invalid Voucher Code! Make sure it matches the code given by the Librarian.", "error");
      return;
    }

    const reward = matchedBook.edu_points_reward || 150;
    playSound('coin');
    setCoins(c => c + Math.round(reward * 0.7));
    setXp(x => x + reward);
    setReadingHours(h => Number((h + (matchedBook.reading_hours || 1)).toFixed(1)));
    setClaimedCodes([...claimedCodes, code]);
    setInputCode('');
    showToast(`🎉 Code verified for "${matchedBook.title}"! +${reward} XP & +${Math.round(reward * 0.7)} Coins`, "success");
  };

  const handleCreateBook = (e) => {
    e.preventDefault();
    if (!newTitle || !newSecretCode) return showToast("Please fill in the book title and secret code.", "warning");

    const newBookObj = {
      id: `book_${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      author: newAuthor || 'School Library',
      cover_url: newCoverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      summary: newSummary || 'Digital textbook chapter.',
      reading_hours: 3.0,
      claim_code: newSecretCode.toUpperCase(),
      edu_points_reward: parseInt(newEduPoints),
      pages: ["Chapter 1: Foundations of learning."]
    };

    setBooks([newBookObj, ...books]);
    setShowAddBookModal(false);
    setNewTitle(''); setNewSecretCode('');
    showToast("🎉 New book added to the E-Library!", "success");
  };

  const handleDeleteBook = (id) => {
    if (!canEditLibrary) return;
    askConfirm("Remove Book", "Are you sure you want to remove this book from the library?", () => {
      setBooks(books.filter(b => b.id !== id));
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-2">
          <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            National E-Library & Physical Hub
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Digital Textbook Catalog</h2>
          <p className="text-emerald-100 text-xs max-w-xl">
            Read online for live time auto-rewards, OR enter the librarian's secret voucher code when reading physical books.
          </p>
        </div>

        {canEditLibrary && (
          <button
            onClick={() => setShowAddBookModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs transition shadow-md shrink-0 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book (CRUD)</span>
          </button>
        )}
      </div>

      {/* Code Claim Input Box */}
      <div className="bg-white border border-emerald-200 p-5 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>Redeem Librarian Physical Book Code</span>
          </h3>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Librarian Code Entry
          </span>
        </div>

        <form onSubmit={handlePhysicalCodeClaim} className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter the librarian's voucher code (e.g., LIB-DHIV-01)"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:border-emerald-500"
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-xs transition">
            Claim Edu Points
          </button>
        </form>
      </div>

      {/* Book Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {books.map((book) => {
          const isDhivehi = isRTLSubject(book.subject);

          return (
            <div key={book.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition flex flex-col justify-between">
              <div className="p-5 space-y-3">
                <div className="h-44 bg-slate-100 rounded-2xl overflow-hidden relative border">
                  <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {book.subject}
                  </span>
                  {canEditLibrary && (
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="absolute top-2 left-2 bg-rose-600 text-white p-1.5 rounded-lg text-xs shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className={isDhivehi ? 'font-dhivehi' : ''}>
                  <h3 className="font-black text-slate-900 text-base leading-snug">{book.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">By {book.author}</p>
                </div>

                <p className={`text-xs text-slate-600 line-clamp-2 ${isDhivehi ? 'font-dhivehi' : ''}`}>
                  {book.summary}
                </p>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="flex items-center space-x-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reading: {book.reading_hours}h</span>
                  </span>

                  {/* VISIBLE EDU POINTS REWARD (CODE IS HIDDEN) */}
                  <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>+{book.edu_points_reward || 150} Edu Points</span>
                  </span>
                </div>

                <button
                  onClick={() => { setSelectedBook(book); setPageIndex(0); setSessionSeconds(0); setAutoEarnedForBook(false); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Reader (Auto-Reward)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reader Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Online E-Reader Active</span>
                </span>
                <h3 className={`text-lg font-black text-slate-900 mt-0.5 ${isRTLSubject(selectedBook.subject) ? 'font-dhivehi' : ''}`}>
                  {selectedBook.title}
                </h3>
              </div>
              <button onClick={() => setSelectedBook(null)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 font-mono font-bold text-emerald-800">
                <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Recorded Time: {sessionSeconds}s</span>
              </div>
              {(autoEarnedForBook || alreadyRead) && (
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black">
                  {alreadyRead && !autoEarnedForBook ? 'Already Rewarded ✅' : 'Goal Fulfilled (+100 Coins) ✅'}
                </span>
              )}
            </div>

            <div className={`min-h-[220px] bg-slate-50 border border-slate-200 p-6 rounded-2xl text-slate-800 leading-relaxed text-sm whitespace-pre-line ${
              isRTLSubject(selectedBook.subject) ? 'font-dhivehi text-base' : ''
            }`}>
              {selectedBook.pages[pageIndex] || "End of chapter."}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                disabled={pageIndex === 0}
                onClick={() => setPageIndex(p => p - 1)}
                className="px-4 py-2 border rounded-xl text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-mono font-bold text-slate-500">Page {pageIndex + 1} / {selectedBook.pages.length}</span>
              <button
                disabled={pageIndex + 1 >= selectedBook.pages.length}
                onClick={() => setPageIndex(p => p + 1)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Book CRUD Modal (Super Admin & Teacher) */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Add Book to E-Library</h3>
              <button onClick={() => setShowAddBookModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-3 text-xs font-medium">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Book Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" className="w-full bg-slate-50 border rounded-xl p-2.5" required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject</label>
                  <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-indigo-700">
                    <option value="Dhivehi">Dhivehi</option>
                    <option value="Islam">Islam</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Maths">Maths</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-amber-800 block mb-1">Secret Code (Librarian)</label>
                  <input type="text" value={newSecretCode} onChange={(e) => setNewSecretCode(e.target.value)} placeholder="e.g. LIB-DHIV-99" className="w-full bg-amber-50 border border-amber-300 font-mono font-bold rounded-xl p-2.5" required />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Visible Edu Points Reward</label>
                <input type="number" value={newEduPoints} onChange={(e) => setNewEduPoints(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold" required />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cover Image URL</label>
                <input type="text" value={newCoverUrl} onChange={(e) => setNewCoverUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border rounded-xl p-2.5" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Summary</label>
                <textarea value={newSummary} onChange={(e) => setNewSummary(e.target.value)} rows={2} className="w-full bg-slate-50 border rounded-xl p-2.5" />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md">
                Publish Book to Library 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}