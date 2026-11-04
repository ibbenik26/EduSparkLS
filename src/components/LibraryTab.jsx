import React, { useState } from 'react';
import { BookOpen, Search, Plus, Trash2, Eye, Download } from 'lucide-react';
import { canUserCRUDLibrary, getDhivehiFormat } from '../utils/helpers';

export default function LibraryTab({
  role, books, setBooks, setCoins, setXp, setReadingHours, claimedCodes, setClaimedCodes, showToast, askConfirm
}) {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewBook, setPreviewBook] = useState(null);

  const canEditLibrary = canUserCRUDLibrary(role);

  const filteredBooks = books.filter(b => {
    const matchesSubject = selectedSubject === 'All' || b.subject === selectedSubject;
    const matchesQuery = `${b.title} ${b.subject} ${b.desc}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div className="space-y-2">
          <span className="bg-blue-400/20 border border-blue-300/30 text-blue-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Curriculum E-Library & Reference Vault
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Edusparkls Digital Library</h2>
          <p className="text-blue-100 text-xs max-w-lg">
            Access Ministry-approved textbooks for Dhivehi, Islam, Quran, and Cambridge Science subjects.
          </p>
        </div>
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

          return (
            <div key={book.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3" dir={format.dir}>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 w-fit block">
                  {book.subject} • Grade {book.grade || 'All'}
                </span>

                <h3 className={`font-black text-slate-900 text-base ${format.className}`}>
                  {book.title}
                </h3>

                <p className={`text-xs text-slate-500 leading-relaxed ${format.className}`}>
                  {book.desc || 'Standard curriculum textbook.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setPreviewBook(book)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read Book</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Reading Modal */}
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

                    <button onClick={() => setPreviewBook(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                      ✕
                    </button>
                  </div>

                  <div className="py-6 space-y-4 text-sm leading-loose text-slate-700">
                    <p>{previewBook.desc}</p>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-medium">
                      📖 {previewBook.content || 'މި ފޮތުގެ މުހިންމު ބައިތައް ކިޔުމަށް ސިލެކްޓް ކުރައްވާ.'}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button onClick={() => setPreviewBook(null)} className="bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs">
                      Close Preview
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