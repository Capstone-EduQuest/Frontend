<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { noteAPI, type Note } from '../api/note'
import { useAuthStore } from '../store/auth'

type EditorNote = Note & { clientId: string }

const auth = useAuthStore()
const isOpen = ref(false)
const notes = ref<EditorNote[]>([])
const selectedNoteId = ref('')
const isLoading = ref(false)
const syncError = ref('')
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>()

const activeNote = computed(
  () => notes.value.find((note) => note.clientId === selectedNoteId.value) ?? notes.value[0] ?? null
)

const toEditorNote = (note: Note, index: number): EditorNote => ({
  ...note,
  clientId: note.uuid ?? `server-note-${index}-${note.title}-${note.content}`,
})

const clearSaveTimer = (clientId: string) => {
  const timer = saveTimers.get(clientId)
  if (timer) {
    clearTimeout(timer)
    saveTimers.delete(clientId)
  }
}

const loadNotes = async () => {
  if (!auth.state.isLoggedIn) {
    notes.value = []
    selectedNoteId.value = ''
    return
  }

  isLoading.value = true
  syncError.value = ''

  try {
    const response = await noteAPI.getNoteList({
      page: 1,
      size: 30,
      sort: 'updated_at',
      is_asc: false,
    })

    const mappedNotes = response.results.map(toEditorNote)
    notes.value = mappedNotes
    selectedNoteId.value = mappedNotes[0]?.clientId ?? ''
  } catch (error) {
    console.error('failed to load notes:', error)
    syncError.value = '메모를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const persistNote = (note: EditorNote) => {
  if (!note.uuid) {
    return
  }

  clearSaveTimer(note.clientId)
  const nextTimer = setTimeout(async () => {
    try {
      await noteAPI.updateNote(note.uuid!, {
        title: note.title,
        content: note.content,
      })
    } catch (error) {
      console.error('failed to update note:', error)
      syncError.value = '메모 저장에 실패했습니다.'
    } finally {
      saveTimers.delete(note.clientId)
    }
  }, 400)

  saveTimers.set(note.clientId, nextTimer)
}

const handleAddNote = () => {
  if (!auth.state.isLoggedIn) {
    syncError.value = '로그인 후 메모를 사용할 수 있습니다.'
    return
  }

  void (async () => {
    syncError.value = ''
    try {
      await noteAPI.createNote({
        title: `새 메모 ${notes.value.length + 1}`,
        content: '',
      })
      await loadNotes()
    } catch (error) {
      console.error('failed to create note:', error)
      syncError.value = '메모를 생성하지 못했습니다.'
    }
  })()
}

const handleUpdateNote = (clientId: string, updatedFields: Partial<EditorNote>) => {
  syncError.value = ''
  notes.value = notes.value.map((note) =>
    note.clientId === clientId
      ? { ...note, ...updatedFields, updated_at: new Date().toISOString() }
      : note
  )

  const updatedNote = notes.value.find((note) => note.clientId === clientId)
  if (updatedNote) {
    persistNote(updatedNote)
  }
}

const handleDeleteNote = (clientId: string) => {
  const targetNote = notes.value.find((note) => note.clientId === clientId)
  if (!targetNote) {
    return
  }

  clearSaveTimer(clientId)

  void (async () => {
    try {
      if (targetNote.uuid) {
        await noteAPI.deleteNote(targetNote.uuid)
      }

      const nextNotes = notes.value.filter((note) => note.clientId !== clientId)
      notes.value = nextNotes

      if (selectedNoteId.value === clientId) {
        selectedNoteId.value = nextNotes[0]?.clientId ?? ''
      }
    } catch (error) {
      console.error('failed to delete note:', error)
      syncError.value = '메모를 삭제하지 못했습니다.'
    }
  })()
}

onMounted(async () => {
  await auth.restoreAuth(window.location.pathname)
  await loadNotes()
})

onBeforeUnmount(() => {
  saveTimers.forEach((timer) => clearTimeout(timer))
  saveTimers.clear()
})
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    <div
      v-if="isOpen"
      class="flex h-[32rem] max-h-[calc(100vh-4rem)] w-96 max-w-[90vw] flex-col rounded-3xl border-4 border-gray-900 bg-white p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
    >
      <div class="mb-3 flex items-center justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.35em] text-gray-500">메모 공간</p>
          <h2 class="text-lg font-black text-gray-900">빠른 노트</h2>
        </div>
        <button
          type="button"
          class="text-gray-500 transition-colors hover:text-gray-900"
          @click="isOpen = false"
        >
          X
        </button>
      </div>

      <div class="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="note in notes"
          :key="note.clientId"
          type="button"
          class="shrink-0 rounded-2xl border px-3 py-2 text-sm font-bold transition-colors"
          :class="note.clientId === activeNote?.clientId ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'"
          @click="selectedNoteId = note.clientId"
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
          @click="handleDeleteNote(activeNote.clientId)"
        >
          삭제
        </button>
      </div>

      <div
        v-if="isLoading"
        class="flex-1 rounded-3xl border border-gray-300 bg-gray-50 p-6 text-sm text-gray-500"
      >
        메모를 불러오는 중입니다.
      </div>
      <div v-else-if="activeNote" class="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <input
          :value="activeNote.title"
          class="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-base font-bold text-gray-900 outline-none focus:border-[#e8472a] focus:ring-2 focus:ring-orange-200"
          @input="handleUpdateNote(activeNote.clientId, { title: ($event.target as HTMLInputElement).value })"
        >
        <textarea
          :value="activeNote.content"
          placeholder="메모 내용을 입력하세요."
          class="min-h-0 flex-1 resize-none rounded-3xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-900 outline-none focus:border-[#e8472a] focus:ring-2 focus:ring-orange-200"
          @input="handleUpdateNote(activeNote.clientId, { content: ($event.target as HTMLTextAreaElement).value })"
        />
      </div>
      <div
        v-else
        class="flex-1 rounded-3xl border border-gray-300 bg-gray-50 p-6 text-sm text-gray-500"
      >
        새 메모를 추가해 주세요.
      </div>

      <p v-if="syncError" class="mt-3 text-xs font-bold text-red-600">{{ syncError }}</p>
      <p class="mt-3 text-xs text-gray-500">입력한 메모는 자동으로 서버에 저장됩니다.</p>
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
