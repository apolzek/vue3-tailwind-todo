import type { Activity, NewActivityForm } from '../types/activity.types'

const BASE = '/api'

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export const activitiesApi = {
  list(): Promise<Activity[]> {
    return fetch(`${BASE}/activities`).then(r => json<Activity[]>(r))
  },
  create(data: NewActivityForm): Promise<Activity> {
    return fetch(`${BASE}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => json<Activity>(r))
  },
  updateStatus(id: string, status: 'completed' | 'pending'): Promise<Activity> {
    return fetch(`${BASE}/activities/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(r => json<Activity>(r))
  },
  remove(id: string): Promise<void> {
    return fetch(`${BASE}/activities/${id}`, { method: 'DELETE' }).then(r => {
      if (!r.ok && r.status !== 204) throw new Error(`API ${r.status}`)
    })
  },
}
