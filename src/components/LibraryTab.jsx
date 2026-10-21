import React, { useState, useEffect } from 'react';
import { BookOpen, Key, ArrowLeft, ArrowRight, X, Clock, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { isRTLSubject, playSound } from '../utils/helpers';

export default function LibraryTab({ books, coins, setCoins, setXp, readingHours, setReadingHours, claimedCodes = [], setClaimedCodes }) {
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedBook, setSelectedBook] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [inputCode, setInputCode] = useState('');

  // Online E-Reader Auto-Timer State
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [autoEarnedForBook, setAutoEarnedForBook] = useState(false);

  // Active Timer for Digital Reader
  useEffect(() => {
    let timer = null;
    if (selectedBook && !autoEarnedForBook) {
      timer = setInterval(() => {
        setSessionSeconds(prev => {
          const nextSec = prev + 1;
          // Target seconds needed (simulated for interactive reading: 30s = full book hour completion)
          const requiredSecs = Math.max(15, Math.round((selectedBook.reading_hours || 1) * 15));
          
          if (nextSec >= requiredSecs) {
            setAutoEarnedForBook(true);
            playSound('coin');
            setCoins(c => c + 100);
            setXp(x => x + 150);
            setReadingHours(h => Number((h + (selectedBook.reading_hours || 1)).toFixed(1)));
            alert(`🎉 Reading Goal Fulfilled!\nBook: "${selectedBook.title}"\nAuto-Awarded +100 Edu Coins & +150 XP!`);
          }
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedBook, autoEarnedForBook, setCoins, setXp, setReadingHours]);

  const handleOpenBook = (book) => {
    setSelectedBook(book);
    setPageIndex(0);
    setSessionSeconds(0);
    setAutoEarnedForBook(false);
  };

  const handlePhysicalCodeClaim = (e) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    if (claimedCodes.includes(code)) {
      alert("⚠️ You have already claimed Edu Points for this physical library voucher!");
      return;
    }

    const matchedBook = books.find(b => (b.claim_code || '').toUpperCase() === code);
    if (!matchedBook) {
      alert("❌ Invalid Voucher Code! Please verify the code given by your Library Teacher.");
      return;
    }

    playSound('coin');
    setCoins(c => c + 120);
    setXp(x => x + 180);
    setReadingHours(h => Number((h + (matchedBook.reading_hours || 1)).toFixed(1)));
    setClaimedCodes([...claimedCodes, code]);
    setInputCode('');
    alert(`🎉 Physical Library Voucher Verified!\nBook: ${matchedBook.title}\n+120 Edu Coins & +180 XP Credited!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-md">
        <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
          E-Library & Physical Book Hub
        </span>
        <h2 className="text-2xl sm:text-3xl font-black">School Textbook & Reading Hub</h2>
        <p className="text-emerald-100 text-xs max-w-xl">
          Read online with live time auto-rewards, OR enter the voucher code issued by your Library Teacher when reading physical books.
        </p>
      </div>

      {/* Claim Voucher Bar */}
      <div className="bg-white border border-emerald-200 p-5 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>Enter Physical Library Teacher Code</span>
          </h3>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Physical Book Voucher Claim
          </span>
        </div>

        <form onSubmit={handlePhysicalCodeClaim} className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter voucher code (e.g., LIB-DHIV-01)"
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
                <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Target: {book.reading_hours}h</span>
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Voucher: {book.claim_code}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenBook(book)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Digital Reader (Auto-Earn)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Digital Reader Modal with Active Live Timer */}
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

            {/* Live Timer Progress Bar */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 font-mono font-bold text-emerald-800">
                <Clock className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Reading Time Recorded: {sessionSeconds}s</span>
              </div>

              {autoEarnedForBook ? (
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Goal Reached (+100 Coins)</span>
                </span>
              ) : (
                <span className="text-slate-500 text-[10px] italic">Keep reading to auto-claim Edu Points!</span>
              )}
            </div>

            {/* Digital Textbook Page Area */}
            <div className={`min-h-[220px] bg-slate-50 border border-slate-200 p-6 rounded-2xl text-slate-800 leading-relaxed text-sm whitespace-pre-line ${
              isRTLSubject(selectedBook.subject) ? 'font-dhivehi text-base' : ''
            }`}>
              {selectedBook.pages[pageIndex] || "End of chapter."}
            </div>

            {/* Page Controls */}
            <div className="flex justify-between items-center pt-2">
              <button
                disabled={pageIndex === 0}
                onClick={() => setPageIndex(p => p - 1)}
                className="px-4 py-2 border rounded-xl text-xs font-bold disabled:opacity-40 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-mono font-bold text-slate-500">
                Page {pageIndex + 1} / {selectedBook.pages.length}
              </span>

              <button
                disabled={pageIndex + 1 >= selectedBook.pages.length}
                onClick={() => setPageIndex(p => p + 1)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold disabled:opacity-40 flex items-center space-x-1"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}