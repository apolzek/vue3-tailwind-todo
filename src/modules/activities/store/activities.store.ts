import { defineStore } from 'pinia'
import type { Activity, NewActivityForm } from '../types/activity.types'
import { activitiesApi } from '../api/activities.api'

export const useActivityStore = defineStore('activities', {
  state: () => ({
    activities: [] as Activity[],
    loading: false,
    loaded: false,
    error: null as string | null,
  }),

  getters: {
    getActivitiesByDate: state => (date: string) => {
      return state.activities.filter(activity => activity.date === date)
    },
    getActivitiesByCategory: state => (category: string) => {
      return state.activities.filter(activity => activity.category === category)
    },
    getActivitiesByTag: state => (tag: string) => {
      return state.activities.filter(activity => activity.tags?.includes(tag as never))
    },
    getActivityStats: state => {
      const stats = {
        total: state.activities.length,
        completed: state.activities.filter(a => a.status === 'completed').length,
        pending: state.activities.filter(a => a.status === 'pending').length,
        byCategory: {} as Record<string, number>,
      }

      state.activities.forEach(activity => {
        stats.byCategory[activity.category] = (stats.byCategory[activity.category] || 0) + 1
      })

      return stats
    },
  },

  actions: {
    async fetchActivities(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      this.error = null
      try {
        const rows = await activitiesApi.list()
        this.activities = rows.map(r => ({ ...r, tags: r.tags ?? [] }))
        this.loaded = true
      } catch (e) {
        this.error = (e as Error).message
      } finally {
        this.loading = false
      }
    },

    async addActivity(activity: NewActivityForm) {
      try {
        const created = await activitiesApi.create({ ...activity, tags: activity.tags ?? [] })
        this.activities.push({ ...created, tags: created.tags ?? [] })
      } catch (e) {
        this.error = (e as Error).message
        throw e
      }
    },

    async updateActivityStatus(id: string, status: 'completed' | 'pending') {
      try {
        const updated = await activitiesApi.updateStatus(id, status)
        const i = this.activities.findIndex(a => a.id === id)
        if (i >= 0) this.activities[i] = { ...updated, tags: updated.tags ?? [] }
      } catch (e) {
        this.error = (e as Error).message
        throw e
      }
    },

    async deleteActivity(id: string) {
      try {
        await activitiesApi.remove(id)
        this.activities = this.activities.filter(a => a.id !== id)
      } catch (e) {
        this.error = (e as Error).message
        throw e
      }
    },
  },
})
