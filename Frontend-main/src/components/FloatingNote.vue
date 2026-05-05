<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { noteAPI, type Note } from '../api/note'
import { useAuthStore } from '../store/auth'

type EditorNote = Note & { clientId: string }

const auth = useAuthStore()
const isOpen = ref(false)
const notes = ref<EditorNote[]>([])
const selectedClientId = ref('')
const titleInput = ref('')
const contentInput = ref('')
const isLoading = ref(false)
const isSyncingInputs = ref(false)
const syncError = ref('')
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>()
const DEFAULT_NOTE_TITLE = '새 메모'
const DEFAULT_NOTE_CONTENT = '메모 내용을 입력해 주세요.'

const activeNote = computed(
  () => notes.value.find((note) => note.clientId === selectedClientId.value) ?? null
)

const toEditorNote = (note: Note, index: number): EditorNote => ({
  ...note,
  clientId: note.uuid ?? `note-${index}-${Date.now()}`,
})

const clearSaveTimer = (clientId: string) => {
  const timer = saveTimers.get(clientId)
  if (timer) {
    clearTimeout(timer)
    saveTimers.delete(clientId)
  }
}

const syncInputsFromNote = (note: EditorNote | null) => {
  isSyncingInputs.value = true
  titleInput.value = note?.title ?? ''
  contentInput.value = note?.content ?? ''
  queueMicrotask(() => {
    isSyncingInputs.value = false
  })
}

const selectNote = (clientId: string) => {
  selectedClientId.value = clientId
  const target = notes.value.find((note) => note.clientId === clientId) ?? null
  syncInputsFromNote(target)
}

const loadNotes = async () => {
  if (!auth.state.isLoggedIn) {
    notes.value = []
    selectedClientId.value = ''
    syncInputsFromNote(null)
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

    const mapped = response.results.map(toEditorNote)
    notes.value = mapped

    if (mapped.length > 0) {
      selectNote(mapped[0].clientId)
    } else {
      selectedClientId.value = ''
      syncInputsFromNote(null)
    }
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

  if (!note.title.trim() || !note.content.trim()) {
    clearSaveTimer(note.clientId)
    return
  }

  const noteUuid = note.uuid
  clearSaveTimer(note.clientId)

  const timer = setTimeout(async () => {
    try {
      await noteAPI.updateNote(noteUuid, {
        title: note.title,
        content: note.content,
      })
    } catch (error) {
      console.error('failed to update note:', error)
      syncError.value = '메모 저장에 실패했습니다.'
    } finally {
      saveTimers.delete(note.clientId)
    }
  }, 350)

  saveTimers.set(note.clientId, timer)
}

const updateActiveNote = (fields: Partial<EditorNote>) => {
  const current = activeNote.value
  if (!current) {
    return
  }

  syncError.value = ''
  notes.value = notes.value.map((note) =>
    note.clientId === current.clientId
      ? { ...note, ...fields, updated_at: new Date().toISOString() }
      : note
  )

  const updated = notes.value.find((note) => note.clientId === current.clientId)
  if (updated) {
    persistNote(updated)
  }
}

const handleAddNote = async () => {
  if (!auth.state.isLoggedIn) {
    syncError.value = '로그인 후 메모를 사용할 수 있습니다.'
    return
  }

  syncError.value = ''

  try {
    await noteAPI.createNote({
      title: `${DEFAULT_NOTE_TITLE} ${notes.value.length + 1}`,
      content: DEFAULT_NOTE_CONTENT,
    })
    await loadNotes()
  } catch (error) {
    console.error('failed to create note:', error)
    syncError.value = '메모를 생성하지 못했습니다.'
  }
}

const handleDeleteNote = async () => {
  const current = activeNote.value
  if (!current?.uuid) {
    return
  }

  clearSaveTimer(current.clientId)
  syncError.value = ''

  try {
    await noteAPI.deleteNote(current.uuid)
    await loadNotes()
  } catch (error) {
    console.error('failed to delete note:', error)
    syncError.value = '메모를 삭제하지 못했습니다.'
  }
}

watch(titleInput, (value) => {
  if (isSyncingInputs.value || !activeNote.value) {
    return
  }

  updateActiveNote({ title: value })
})

watch(contentInput, (value) => {
  if (isSyncingInputs.value || !activeNote.value) {
    return
  }

  updateActiveNote({ content: value })
})

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
      class="flex h-[34rem] max-h-[calc(100vh-4rem)] w-[26rem] max-w-[92vw] flex-col rounded-[28px] border-4 border-[#1A2A4F] bg-white p-4 shadow-[8px_8px_0_0_rgba(26,42,79,1)]"
    >
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.28em] text-[#1A2A4F]/55">Quick Memo</p>
          <h2 class="mt-1 text-lg font-black text-[#1A2A4F]">빠른 메모</h2>
        </div>
        <button
          type="button"
          class="rounded-full border-2 border-[#1A2A4F] bg-[#FFF2EF] px-3 py-1 text-sm font-black text-[#1A2A4F]"
          @click="isOpen = false"
        >
          닫기
        </button>
      </div>

      <div class="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="note in notes"
          :key="note.clientId"
          type="button"
          class="shrink-0 rounded-[16px] border-2 px-3 py-2 text-sm font-black transition"
          :class="note.clientId === selectedClientId ? 'border-[#1A2A4F] bg-[#1A2A4F] text-white' : 'border-[#1A2A4F] bg-[#FFF2EF] text-[#1A2A4F] hover:bg-[#FFDBB6]'"
          @click="selectNote(note.clientId)"
        >
          {{ note.title || '제목 없음' }}
        </button>

        <button
          type="button"
          class="shrink-0 rounded-[16px] border-2 border-dashed border-[#1A2A4F] bg-white px-3 py-2 text-sm font-black text-[#1A2A4F] hover:bg-[#FFDBB6]"
          @click="handleAddNote"
        >
          + 새 메모
        </button>
      </div>

      <div
        v-if="isLoading"
        class="flex flex-1 items-center justify-center rounded-[24px] border-2 border-[#1A2A4F] bg-[#FFF2EF] text-sm font-bold text-[#1A2A4F]/70"
      >
        메모를 불러오는 중입니다.
      </div>

      <div
        v-else-if="activeNote"
        class="flex min-h-0 flex-1 flex-col gap-3"
      >
        <div>
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[#1A2A4F]/55">Title</label>
          <input
            v-model="titleInput"
            type="text"
            placeholder="메모 제목을 입력해 주세요"
            class="w-full rounded-[18px] border-2 border-[#1A2A4F] bg-[#FFF2EF] px-4 py-3 text-base font-black text-[#1A2A4F] outline-none focus:bg-white"
          >
        </div>

        <div class="flex min-h-0 flex-1 flex-col">
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[#1A2A4F]/55">Content</label>
          <textarea
            v-model="contentInput"
            placeholder="메모 내용을 입력해 주세요"
            class="min-h-0 flex-1 resize-none rounded-[22px] border-2 border-[#1A2A4F] bg-[#FFF2EF] p-4 text-sm font-medium text-[#1A2A4F] outline-none focus:bg-white"
          />
        </div>

        <div class="flex justify-between gap-3">
          <button
            type="button"
            class="rounded-[16px] border-2 border-[#1A2A4F] bg-[#F7A5A5] px-4 py-2 text-sm font-black text-[#7A1D1D] shadow-[4px_4px_0_0_rgba(26,42,79,1)]"
            @click="handleDeleteNote"
          >
            삭제
          </button>
          <p class="self-center text-xs font-bold text-[#1A2A4F]/55">입력 내용은 자동 저장됩니다.</p>
        </div>
      </div>

      <div
        v-else
        class="flex flex-1 flex-col items-center justify-center rounded-[24px] border-2 border-[#1A2A4F] bg-[#FFF2EF] p-6 text-center"
      >
        <p class="text-sm font-bold text-[#1A2A4F]/70">아직 메모가 없습니다.</p>
        <button
          type="button"
          class="mt-4 rounded-[16px] border-2 border-[#1A2A4F] bg-[#FFDBB6] px-4 py-2 text-sm font-black text-[#1A2A4F] shadow-[4px_4px_0_0_rgba(26,42,79,1)]"
          @click="handleAddNote"
        >
          첫 메모 만들기
        </button>
      </div>

      <p v-if="syncError" class="mt-3 text-xs font-bold text-red-600">{{ syncError }}</p>
    </div>

    <button
      type="button"
      class="inline-flex items-center justify-center rounded-full border-2 border-[#1A2A4F] bg-[#F7A5A5] px-6 py-3 text-sm font-black text-[#1A2A4F] shadow-[4px_4px_0_0_rgba(26,42,79,1)] transition-transform hover:-translate-y-1"
      @click="isOpen = !isOpen"
    >
      {{ isOpen ? '메모 닫기' : '빠른 메모' }}
    </button>
  </div>
</template>
