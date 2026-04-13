<template>
  <div class="max-w-6xl mx-auto px-6 lg:px-8 py-8 lg:py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">{{ pageTitle }}</h1>
        <p class="mt-1 text-sm text-gray-500">{{ pageSubtitle }}</p>
      </div>
      <button
        @click="isNewActivityModalOpen = true"
        class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        <span class="hidden sm:inline">New Activity</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseSelect
          v-if="!routeCategory"
          v-model="filters.category"
          label="Category"
          :options="[
            { value: '', label: 'All Categories' },
            { value: 'Work', label: 'Work' },
            { value: 'Personal', label: 'Personal' },
            { value: 'Learning', label: 'Learning' },
            { value: 'Health', label: 'Health' },
            { value: 'Other', label: 'Other' },
          ]"
        />
        <BaseSelect
          v-model="filters.status"
          label="Status"
          :options="[
            { value: '', label: 'All Status' },
            { value: 'completed', label: 'Completed' },
            { value: 'pending', label: 'Pending' },
          ]"
        />
        <BaseInput
          v-model="filters.search"
          label="Search"
          placeholder="Search activities..."
          type="search"
        />
      </div>
    </div>

    <div v-if="activityStore.loading && !activityStore.loaded" class="text-center py-12 text-gray-500">
      Loading activities…
    </div>
    <div v-else-if="activityStore.error" class="text-center py-12 text-red-500">
      {{ activityStore.error }}
    </div>

    <!-- Activities List -->
    <div class="space-y-4">
      <div v-if="!activityStore.loading && sortedActivities.length === 0" class="text-center py-12">
        <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No activities</h3>
        <p class="mt-1 text-sm text-gray-500">{{ emptyHint }}</p>
        <div class="mt-6">
          <button
            @click="isNewActivityModalOpen = true"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            New Activity
          </button>
        </div>
      </div>

      <div :key="route.fullPath">
        <BaseListItem
          v-for="activity in sortedActivities"
          :key="activity.id"
          customClass="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow mb-4"
        >
          <template #leading>
            <div
              class="w-3 h-3 mt-1.5 rounded-full flex-shrink-0"
              :class="{
                'bg-blue-500': activity.category === 'Work',
                'bg-green-500': activity.category === 'Personal',
                'bg-purple-500': activity.category === 'Learning',
                'bg-red-500': activity.category === 'Health',
                'bg-gray-500': activity.category === 'Other',
              }"
            ></div>
          </template>

          <template #title>
            <h3 class="text-base font-medium text-gray-900">{{ activity.title }}</h3>
          </template>

          <template #description>
            <p class="mt-1 text-sm text-gray-500">{{ activity.description }}</p>
            <div class="mt-2 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <div class="flex items-center">
                <CalendarIcon class="w-4 h-4 mr-1" />
                {{ formatDate(activity.date) }}
              </div>
              <div class="flex items-center">
                <ClockIcon class="w-4 h-4 mr-1" />
                {{ activity.time }}
              </div>
              <div v-if="activity.location" class="flex items-center">
                <MapPinIcon class="w-4 h-4 mr-1" />
                {{ activity.location }}
              </div>
              <div v-if="activity.tags && activity.tags.length" class="flex items-center gap-1">
                <span
                  v-for="t in activity.tags"
                  :key="t"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="tagBadgeClass(t)"
                >
                  #{{ t }}
                </span>
              </div>
            </div>
          </template>

          <template #actions>
            <div class="flex items-center space-x-2">
              <button
                @click="toggleActivityStatus(activity.id)"
                class="inline-flex items-center px-2.5 py-1.5 text-sm font-medium rounded-md"
                :class="
                  activity.status === 'completed'
                    ? 'text-green-700 bg-green-50 hover:bg-green-100'
                    : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                "
              >
                <CheckIcon v-if="activity.status === 'completed'" class="w-4 h-4 mr-1" />
                {{ activity.status === 'completed' ? 'Completed' : 'Mark Complete' }}
              </button>
              <button @click="deleteActivity(activity.id)" class="text-gray-400 hover:text-red-500">
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </template>
        </BaseListItem>
      </div>
    </div>

    <!-- New Activity Modal -->
    <NewActivityModal
      :is-open="isNewActivityModalOpen"
      :default-category="routeCategory || undefined"
      :default-tag="routeTag || undefined"
      @close="isNewActivityModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckIcon,
  TrashIcon,
  DocumentIcon,
} from '@heroicons/vue/24/outline'
import { useActivityStore } from '@/modules/activities/store/activities.store'
import NewActivityModal from '@/modules/activities/components/NewActivityModal.vue'
import BaseListItem from '@/core/components/BaseListItem.vue'
import type { ActivityCategory, ActivityTag } from '@/modules/activities/types/activity.types'
import BaseSelect from '@/core/components/BaseSelect.vue'
import BaseInput from '@/core/components/BaseInput.vue'

const activityStore = useActivityStore()
const route = useRoute()
const isNewActivityModalOpen = ref(false)

onMounted(() => activityStore.fetchActivities())

const CATEGORY_MAP: Record<string, { category: ActivityCategory; label: string }> = {
  work:     { category: 'Work',     label: 'Work' },
  personal: { category: 'Personal', label: 'Personal' },
  health:   { category: 'Health',   label: 'Health & Fitness' },
  learning: { category: 'Learning', label: 'Learning' },
}

const TAG_MAP: Record<string, { tag: ActivityTag; label: string }> = {
  priority: { tag: 'priority', label: 'Priority' },
  meeting:  { tag: 'meeting',  label: 'Meetings' },
  deadline: { tag: 'deadline', label: 'Deadlines' },
  errand:   { tag: 'errand',   label: 'Errands' },
}

const routeCategory = computed<ActivityCategory | null>(() => {
  if (route.name !== 'category') return null
  const key = String(route.params.category || '').toLowerCase()
  return CATEGORY_MAP[key]?.category ?? null
})

const routeTag = computed<ActivityTag | null>(() => {
  if (route.name !== 'tag') return null
  const key = String(route.params.tag || '').toLowerCase()
  return TAG_MAP[key]?.tag ?? null
})

const isCompletedView = computed(() => route.name === 'completed')

const pageTitle = computed(() => {
  if (routeCategory.value) {
    const key = String(route.params.category || '').toLowerCase()
    return CATEGORY_MAP[key]?.label ?? 'Activities'
  }
  if (routeTag.value) {
    const key = String(route.params.tag || '').toLowerCase()
    return TAG_MAP[key]?.label ?? 'Activities'
  }
  if (isCompletedView.value) return 'Completed'
  if (route.name === 'upcoming') return 'Upcoming'
  return 'All Activities'
})

const pageSubtitle = computed(() => {
  if (routeCategory.value) return `Activities in ${pageTitle.value}`
  if (routeTag.value) return `Activities tagged as ${pageTitle.value.toLowerCase()}`
  if (isCompletedView.value) return 'Everything you have finished'
  if (route.name === 'upcoming') return 'What is coming next'
  return 'View and manage all your activities'
})

const emptyHint = computed(() => {
  if (routeCategory.value) return `No activities in ${pageTitle.value} yet.`
  if (routeTag.value) return `No activities tagged #${routeTag.value} yet.`
  return 'Get started by creating a new activity.'
})

const filters = ref({
  category: '',
  status: '',
  search: '',
})

const sortBy = ref<'date' | 'category' | 'status'>('date')

const filteredActivities = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return activityStore.activities.filter(activity => {
    if (routeCategory.value && activity.category !== routeCategory.value) return false
    if (routeTag.value && !(activity.tags || []).includes(routeTag.value)) return false
    if (isCompletedView.value && activity.status !== 'completed') return false
    if (route.name === 'upcoming' && activity.date < today) return false

    const matchesCategory = !filters.value.category || activity.category === filters.value.category
    const matchesStatus = !filters.value.status || activity.status === filters.value.status
    const q = filters.value.search.toLowerCase()
    const matchesSearch =
      !q ||
      activity.title.toLowerCase().includes(q) ||
      activity.description.toLowerCase().includes(q)
    return matchesCategory && matchesStatus && matchesSearch
  })
})

const sortedActivities = computed(() => {
  return [...filteredActivities.value].sort((a, b) => {
    switch (sortBy.value) {
      case 'date':
        return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()
      case 'category':
        return a.category.localeCompare(b.category)
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const tagBadgeClass = (tag: string) => {
  switch (tag) {
    case 'priority': return 'bg-red-50 text-red-700'
    case 'meeting':  return 'bg-blue-50 text-blue-700'
    case 'deadline': return 'bg-purple-50 text-purple-700'
    case 'errand':   return 'bg-green-50 text-green-700'
    default:         return 'bg-gray-50 text-gray-700'
  }
}

const toggleActivityStatus = (id: string) => {
  const activity = activityStore.activities.find(a => a.id === id)
  if (activity) {
    activityStore.updateActivityStatus(
      id,
      activity.status === 'completed' ? 'pending' : 'completed'
    )
  }
}

const deleteActivity = (id: string) => {
  activityStore.deleteActivity(id)
}
</script>
