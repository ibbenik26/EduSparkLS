import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Search, Eye, Key, Sparkles, Clock, Coins, CheckCircle2, Pause, Play, ShieldCheck, Save } from 'lucide-react';
import { canUserCRUDLibrary, getDhivehiFormat } from '../utils/helpers';

export default function LibraryTab({
  role, books, setBooks, coins, setCoins, setXp, readingHours, setReadingHours,
  claimedCodes, setClaimedCodes, showToast, askConfirm
}) {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewBook, setPreviewBook] = useState(null);

  // Librarian Code Redemption State
  const [librarianCodeInput, setLibrarianCodeInput] = useState('');

  // Digital Reading Auto-Timer & Resume State
  const [activeReadingSeconds, setActiveReadingSeconds] = useState(0);
  const [sessionStartSeconds, setSessionStartSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = useRef(null);

  const canEditLibrary = canUserCRUDLibrary(role);

  // -------------------------------------------------------------
  // 1. OPEN BOOK READER & RESUME TIMER FROM SAVED ENDPOINT
  // -------------------------------------------------------------
  const handleOpenBookReader = (book) => {
    setPreviewBook(book);

    // Load saved reading seconds for this specific book from localStorage
    const savedBookProgressKey = `edusparkls_book_sec_${book.id}`;
    const savedSeconds = parseInt(localStorage.getItem(savedBookProgressKey) || '0', 10);

    setActiveReadingSeconds(savedSeconds);
    setSessionStartSeconds(savedSeconds);
    setIsTimerPaused(false);
  };

  // Auto-timer tick & screen visibility listener
  useEffect(() => {
    if (!previewBook) {
      setActiveReadingSeconds(0);
      setSessionStartSeconds(0);
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsTimerPaused(true);
      } else {
        setIsTimerPaused(false);
      }
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

  // Save progress & endpoint timer
  const handleCloseBookReader = () => {
    if (!previewBook) return;

    // Save total accumulated seconds for this book so next time it resumes from here
    const savedBookProgressKey = `edusparkls_book_sec_${previewBook.id}`;
    localStorage.setItem(savedBookProgressKey, activeReadingSeconds.toString());

    // Calculate newly added reading seconds during this active session
    const incrementalSeconds = Math.max(0, activeReadingSeconds - sessionStartSeconds);

    if (incrementalSeconds >= 5) {
      const hoursAdded = parseFloat((incrementalSeconds / 3600).toFixed(3));
      const coinsEarned = Math.floor((incrementalSeconds / 3600) * 50); // 50 coins per 1 hr
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
  // 2. LIBRARIAN CODE REDEMPTION (Physical Books)
  // -------------------------------------------------------------
  const handleRedeemLibrarianCode = (e) => {
    e.preventDefault();
    const cleanCode = librarianCodeInput.trim().toUpperCase();
    if (!cleanCode) return showToast("Please enter a librarian code", "warning");

    if (claimedCodes.includes(cleanCode)) {
      return showToast("⚠️ Code already claimed!", "warning");
    }

    const presetCodes = {
      'LIB-1HR': { hours: 1, label: '1 Hour Physical Reading Pass' },
      'LIB-2HR': { hours: 2, label: '2 Hours Physical Reading Pass' },
      'LIB-3HR': { hours: 3, label: '3 Hours Physical Reading Pass' },
      'READ1': { hours: 1, label: '1 Hour Reading Verification' },
      'READ2': { hours: 2, label: '2 Hours Reading Verification' },
      'DHIVEHI100': { hours: 2, label: 'Dhivehi Reading Hours Pass' }
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

      showToast(`🎉 Code Verified! +${earnedHours} Reading Hours & +${earnedCoins} Coins added to your endpoint!`, "success");
    } else {
      showToast("❌ Invalid librarian code. Check code handed by your school librarian!", "error");
    }
  };

  const formatTimerDisplay = (totalSecs) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredBooks = books.filter(b => {
    const matchesSubject = selectedSubject === 'All' || b.subject === selectedSubject;
    const matchesQuery = `${b.title} ${b.subject} ${b.desc}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div className="space-y-2">
          <span className="bg-blue-400/20 border border-blue-300/30 text-blue-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center space-x-1.5 w-fit">
            <BookOpen className="w-3.5 h-3.5" />
            <span>School E-Library & Reading Rewards Vault</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Edusparkls Library Center</h2>
          <p className="text-blue-100 text-xs max-w-lg">
            Read books on your device to build your reading timer endpoint or enter Librarian Codes to earn <strong>50 Coins for every 1 Reading Hour</strong>!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-3 shrink-0">
          <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-black text-lg">⌛</div>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-200 block">Total Reading Hours Endpoint</span>
            <span className="text-xl font-black text-amber-300">{readingHours} Hours</span>
          </div>
        </div>
      </div>

      {/* Librarian Code Card */}
      <div className="bg-gradient-to-r from-amber-500 to-rose-600 rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-md flex items-center space-x-1 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>School Librarian Verification Code</span>
          </span>
          <h3 className="font-black text-base">Claim Coins for Physical Book Reading</h3>
          <p className="text-xs text-amber-100">
            Finished reading a physical book in library? Enter librarian code to add hours & claim <strong>50 Coins / Hour</strong>.
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

      {/* Search & Subject Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books, Dhivehi title..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['All', 'Dhivehi', 'Islam', 'Quran', 'Physics', 'Maths'].map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                selectedSubject === sub ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.map((book) => {
          const format = getDhivehiFormat(book.subject, book.title);
          const estHours = book.estimated_hours || 1;
          const rewardCoins = estHours * 50;
          const savedBookSecs = parseInt(localStorage.getItem(`edusparkls_book_sec_${book.id}`) || '0', 10);

          return (
            <div key={book.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3" dir={format.dir}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 w-fit block">
                    {book.subject} • Grade {book.grade || 'All'}
                  </span>

                  <span className="text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <Coins className="w-3 h-3 text-amber-600" />
                    <span>{estHours} Hr = {rewardCoins} Coins</span>
                  </span>
                </div>

                <h3 className={`font-black text-slate-900 text-base ${format.className}`}>
                  {book.title}
                </h3>

                <p className={`text-xs text-slate-500 leading-relaxed ${format.className}`}>
                  {book.desc || 'Standard curriculum reference book.'}
                </p>

                {savedBookSecs > 0 && (
                  <div className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg w-fit">
                    📍 Resume Endpoint: {formatTimerDisplay(savedBookSecs)}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenBookReader(book)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{savedBookSecs > 0 ? 'Resume Reading' : 'Read On Device'}</span>
                </button>

                <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{estHours} Hr Book</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DIGITAL READ-ON-DEVICE MODAL WITH RESUMABLE TIMER */}
      {previewBook && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {(() => {
              const modalFormat = getDhivehiFormat(previewBook.subject, previewBook.title);

              return (
                <div dir={modalFormat.dir} className={modalFormat.className}>
                  {/* Header */}
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

                  {/* Book Content */}
                  <div className="py-4 space-y-4 text-sm leading-loose text-slate-700">
                    <p>{previewBook.desc}</p>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 font-medium space-y-3">
                      <h4 className="font-black text-slate-900">📖 Text Content & Study Guide</h4>
                      <p>{previewBook.content || 'މި ފޮތުގެ މުހިންމު ބައިތައް ކިޔުމަށް ސިލެކްޓް ކުރައްވާ. ކިޔުމުގެ ވަގުތު އޮޓޯއިން ރެކޯޑު ކުރެވޭނެއެވެ.'}</p>
                    </div>
                  </div>

                  {/* Reader Action Controls */}
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