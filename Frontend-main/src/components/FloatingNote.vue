<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { noteApi, type NoteItem } from '../api/mockApi'

const isOpen = ref(false)
const notes = ref<NoteItem[]>([])
const selectedNoteId = ref('')
const isLoaded = ref(false)

const activeNote = computed(() => notes.value.find((note) => note.id === selectedNoteId.value) ?? notes.value[0] ?? null)

onMounted(async () => {
  const savedNotes = await noteApi.fetchNotes()
  notes.value = savedNotes
  selectedNoteId.value = savedNotes[0]?.id ?? ''
  isLoaded.value = true
})

watch(
  notes,
  async (value) => {
    if (!isLoaded.value) {
      return
    }
    await noteApi.saveNotes(value)
  },
  { deep: true }
)

const handleAddNote = () => {
  const nextNote: NoteItem = {
    id: Date.now().toString(),
    title: `새 노트 ${notes.value.length + 1}`,
    content: '',
    updatedAt: new Date().toISOString(),
  }
  notes.value = [...notes.value, nextNote]
  selectedNoteId.value = nextNote.id
}

const handleUpdateNote = (id: string, updatedFields: Partial<NoteItem>) => {
  notes.value = notes.value.map((note) =>
    note.id === id ? { ...note, ...updatedFields, updatedAt: new Date().toISOString() } : note
  )
}

const handleDeleteNote = (id: string) => {
  const nextNotes = notes.value.filter((note) => note.id !== id)
  notes.value = nextNotes
  if (selectedNoteId.value === id) {
    selectedNoteId.value = nextNotes[0]?.id ?? ''
  }
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    <div
      v-if="isOpen"
      class="flex h-[32rem] max-h-[calc(100vh-4rem)] w-96 max-w-[90vw] flex-col rounded-3xl border-4 border-gray-900 bg-white p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
    >
      <div class="mb-3 flex items-center justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.35em] text-gray-500">실시간 쓰기</p>
          <h2 class="text-lg font-black text-gray-900">메모 전용 공간</h2>
        </div>
        <button type="button" class="text-gray-500 transition-colors hover:text-gray-900" @click="isOpen = false">×</button>
      </div>

      <div class="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="note in notes"
          :key="note.id"
          type="button"
          class="shrink-0 rounded-2xl border px-3 py-2 text-sm font-bold transition-colors"
          :class="note.id === activeNote?.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'"
          @click="selectedNoteId = note.id"
        >
          {{ note.title }}
        </button>
        <button
          type="button"
          class="shrink-0 rounded-2xl border border-dashed border-gray-400 bg-white px-3 py-2 text-sm font-black text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
          @click="handleAddNote"
        >
          +
        </button>
        <button
          v-if="activeNote"
          type="button"
          class="shrink-0 rounded-2xl border border-red-500 bg-red-50 px-3 py-2 text-sm font-black text-red-700 transition-colors hover:bg-red-100"
          @click="handleDeleteNote(activeNote.id)"
        >
          삭제
        </button>
      </div>

      <div v-if="activeNote" class="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <input
          :value="activeNote.title"
          class="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-base font-bold text-gray-900 outline-none focus:border-[#e8472a] focus:ring-2 focus:ring-orange-200"
          @input="handleUpdateNote(activeNote.id, { title: ($event.target as HTMLInputElement).value })"
        >
        <textarea
          :value="activeNote.content"
          placeholder="노트 내용을 입력하세요..."
          class="min-h-0 flex-1 resize-none rounded-3xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-900 outline-none focus:border-[#e8472a] focus:ring-2 focus:ring-orange-200"
          @input="handleUpdateNote(activeNote.id, { content: ($event.target as HTMLTextAreaElement).value })"
        />
      </div>
      <div v-else class="flex-1 rounded-3xl border border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
        새 노트를 추가해 주세요.
      </div>

      <p class="mt-3 text-xs text-gray-500">작성한 메모는 자동으로 저장됩니다.</p>
    </div>

    <button
      type="button"
      class="inline-flex items-center justify-center rounded-full border-2 border-gray-900 bg-[#e8472a] px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
      @click="isOpen = !isOpen"
    >
      {{ isOpen ? '메모 닫기' : '빠른 노트' }}
    </button>
  </div>
</template>
