import React, { useState } from 'react';
import { BookOpen, Key, ArrowLeft, ArrowRight, X, Award } from 'lucide-react';
import { isRTLSubject } from '../utils/helpers';

export default function LibraryTab({ books, coins, setCoins, setXp, claimedCodes = [], setClaimedCodes }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [inputCode, setInputCode] = useState('');

  const handleClaimCodeSubmit = (e) => {
    e.preventDefault();
    const cleaned = inputCode.trim().toUpperCase();
    if (!cleaned) return;

    if (claimedCodes.includes(cleaned)) {
      alert("⚠️ You have already claimed Edu Points for this book code!");
      return;
    }

    const matchedBook = books.find(b => (b.claim_code || '').toUpperCase() === cleaned);
    if (!matchedBook) {
      alert("❌ Invalid Claim Code! Check textbook code format (e.g. LIB-DHIV-01).");
      return;
    }

    setCoins(c => c + 100);
    setXp(x => x + 150);
    setClaimedCodes([...claimedCodes, cleaned]);
    setInputCode('');
    alert(`🎉 Code Claimed Successfully!\nBook: ${matchedBook.title}\n+100 Coins & +150 XP Awarded!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white space-y-2 shadow-md">
        <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
          National & Cambridge E-Library
        </span>
        <h2 className="text-2xl sm:text-3xl font-black">Digital Textbook Catalog</h2>
        <p className="text-emerald-100 text-xs max-w-lg">
          Read prescribed Dhivehi, Islam, and Science textbooks to acquire unique claim codes and redeem Edu Points.
        </p>
      </div>

      {/* Claim Code Redemption Bar */}
      <div className="bg-white border border-emerald-200 p-5 rounded-3xl shadow-xs space-y-2">
        <h3 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
          <Key className="w-4 h-4 text-emerald-600" />
          <span>Redeem Library Book Claim Code</span>
        </h3>
        <form onSubmit={handleClaimCodeSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="e.g. LIB-DHIV-01"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase text-slate-900 font-bold"
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-xs transition">
            Claim Edu Points
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {books.map((book) => (
          <div key={book.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition flex flex-col justify-between">
            <div className="p-5 space-y-3">
              <div className="h-40 bg-slate-100 rounded-2xl overflow-hidden relative border">
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  {book.subject}
                </span>
              </div>

              <div>
                <h3 className={`font-black text-slate-900 text-base ${isRTLSubject(book.subject) ? 'font-dhivehi text-right' : ''}`}>
                  {book.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">By {book.author}</p>
              </div>

              <p className={`text-xs text-slate-600 line-clamp-2 ${isRTLSubject(book.subject) ? 'font-dhivehi text-right' : ''}`}>
                {book.summary}
              </p>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                <span>Reading: {book.reading_hours}h</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Code: {book.claim_code}
                </span>
              </div>
              <button
                onClick={() => { setSelectedBook(book); setPageIndex(0); }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open Digital Reader</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{selectedBook.subject} E-Reader</span>
                <h3 className={`text-lg font-black text-slate-900 ${isRTLSubject(selectedBook.subject) ? 'font-dhivehi text-right' : ''}`}>
                  {selectedBook.title}
                </h3>
              </div>
              <button onClick={() => setSelectedBook(null)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`min-h-[220px] bg-slate-50 border border-slate-200 p-6 rounded-2xl text-slate-800 leading-relaxed text-sm whitespace-pre-line ${
              isRTLSubject(selectedBook.subject) ? 'font-dhivehi text-right text-base' : ''
            }`}>
              {selectedBook.pages[pageIndex] || "End of sample chapter."}
            </div>

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

              {pageIndex + 1 < selectedBook.pages.length ? (
                <button
                  onClick={() => setPageIndex(p => p + 1)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <span>Next Page</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    alert(`📘 Book Finished!\nUse Claim Code "${selectedBook.claim_code}" in the E-Library bar to earn points.`);
                    setSelectedBook(null);
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black shadow-md"
                >
                  Finish & Get Code 🏆
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}