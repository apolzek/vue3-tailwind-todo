<script setup lang="ts">
import { onMounted } from 'vue'
import { useActivityStore } from '@/modules/activities/store/activities.store'

const activityStore = useActivityStore()
onMounted(() => {
  activityStore.fetchActivities()
})
</script>

<template>
  <router-view></router-view>
</template>
