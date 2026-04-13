import { useEffect, useState } from 'react';
import { noteApi } from '../api/mockApi';
import type { NoteItem } from '../api/mockApi';

const FloatingNote = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadNotes = async () => {
      const savedNotes = await noteApi.fetchNotes();
      setNotes(savedNotes);
      setSelectedNoteId(savedNotes[0]?.id ?? '');
      setIsLoaded(true);
    };

    loadNotes();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    noteApi.saveNotes(notes);
  }, [notes, isLoaded]);

  const activeNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0];

  const handleAddNote = () => {
    const nextNote: NoteItem = {
      id: Date.now().toString(),
      title: `새 노트 ${notes.length + 1}`,
      content: '',
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, nextNote]);
    setSelectedNoteId(nextNote.id);
  };

  const handleUpdateNote = (id: string, updatedFields: Partial<NoteItem>) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updatedFields, updatedAt: new Date().toISOString() } : note)));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-96 max-w-[90vw] h-[32rem] max-h-[calc(100vh-4rem)] rounded-3xl border-4 border-gray-900 bg-white p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gray-500">실시간 필기</p>
              <h2 className="text-lg font-black text-gray-900">메모 저장 공간</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {notes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => setSelectedNoteId(note.id)}
                className={`shrink-0 rounded-2xl border px-3 py-2 text-sm font-bold transition-colors ${note.id === activeNote?.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
              >
                {note.title}
              </button>
            ))}
            <button
              type="button"
              onClick={handleAddNote}
              className="shrink-0 rounded-2xl border border-dashed border-gray-400 bg-white px-3 py-2 text-sm font-black text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              +
            </button>
          </div>

          {activeNote ? (
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              <input
                value={activeNote.title}
                onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-base font-bold text-gray-900 outline-none focus:border-[#e8472a] focus:ring-2 focus:ring-orange-200"
              />
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateNote(activeNote.id, { content: e.target.value })}
                placeholder="노트 내용을 입력하세요..."
                className="flex-1 min-h-0 resize-none rounded-3xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-900 outline-none focus:border-[#e8472a] focus:ring-2 focus:ring-orange-200"
              />
            </div>
          ) : (
            <div className="flex-1 rounded-3xl border border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
              새로운 노트를 추가해주세요.
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500">작성한 메모는 자동으로 저장됩니다.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center justify-center rounded-full bg-[#e8472a] px-6 py-3 text-sm font-black text-white border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform"
      >
        {isOpen ? '메모 닫기' : '필기 노트'}
      </button>
    </div>
  );
};

export default FloatingNote;
