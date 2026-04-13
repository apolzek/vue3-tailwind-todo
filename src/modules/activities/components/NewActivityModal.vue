<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                New Activity
              </DialogTitle>

              <form @submit.prevent="handleSubmit" class="mt-4 space-y-6">
                <BaseInput
                  v-model="form.title"
                  label="Title"
                  required
                  placeholder="Enter activity title"
                />

                <BaseTextarea
                  v-model="form.description"
                  label="Description"
                  :rows="3"
                  placeholder="Enter activity description"
                />

                <BaseSelect
                  v-model="form.category"
                  label="Category"
                  :options="[
                    { value: 'Work', label: 'Work' },
                    { value: 'Personal', label: 'Personal' },
                    { value: 'Learning', label: 'Learning' },
                    { value: 'Health', label: 'Health' },
                    { value: 'Other', label: 'Other' },
                  ]"
                  required
                />

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="t in ALL_TAGS"
                      :key="t.value"
                      type="button"
                      @click="toggleTag(t.value)"
                      class="px-3 py-1 rounded-full text-xs font-medium border transition"
                      :class="
                        form.tags.includes(t.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      "
                    >
                      #{{ t.label }}
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <BaseInput v-model="form.date" type="date" label="Date" required />
                  <BaseInput v-model="form.time" type="time" label="Time" required />
                </div>

                <BaseInput
                  v-model="form.location"
                  label="Location (Optional)"
                  placeholder="Enter location"
                />

                <div v-if="error" class="text-sm text-red-600">{{ error }}</div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="closeModal"
                    class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="saving"
                    class="rounded-lg bg-[#2564CF] px-4 py-2 text-sm font-medium text-white hover:bg-[#215ABB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2564CF] disabled:opacity-60"
                  >
                    {{ saving ? 'Saving…' : 'Add Activity' }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useActivityStore } from '../store/activities.store'
import type { ActivityCategory, ActivityTag, NewActivityForm } from '../types/activity.types'
import BaseInput from '@/core/components/BaseInput.vue'
import BaseTextarea from '@/core/components/BaseTextarea.vue'
import BaseSelect from '@/core/components/BaseSelect.vue'

const props = defineProps<{
  isOpen: boolean
  defaultCategory?: ActivityCategory
  defaultTag?: ActivityTag
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const activityStore = useActivityStore()

const ALL_TAGS: { value: ActivityTag; label: string }[] = [
  { value: 'priority', label: 'priority' },
  { value: 'meeting', label: 'meeting' },
  { value: 'deadline', label: 'deadline' },
  { value: 'errand', label: 'errand' },
]

const makeInitial = (): NewActivityForm => ({
  title: '',
  description: '',
  category: props.defaultCategory ?? 'Work',
  date: new Date().toISOString().split('T')[0],
  time: '12:00',
  location: '',
  tags: props.defaultTag ? [props.defaultTag] : [],
})

const form = ref<NewActivityForm>(makeInitial())
const saving = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      form.value = makeInitial()
      error.value = null
    }
  }
)

const toggleTag = (tag: ActivityTag) => {
  const idx = form.value.tags.indexOf(tag)
  if (idx >= 0) form.value.tags.splice(idx, 1)
  else form.value.tags.push(tag)
}

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  saving.value = true
  error.value = null
  try {
    await activityStore.addActivity(form.value)
    closeModal()
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    saving.value = false
  }
}
</script>
