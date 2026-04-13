export type ActivityCategory = 'Work' | 'Personal' | 'Learning' | 'Health' | 'Other'

export type ActivityTag = 'priority' | 'meeting' | 'deadline' | 'errand'

export interface Activity {
  id: string
  title: string
  description: string
  category: ActivityCategory
  date: string
  time: string
  location?: string
  status: 'completed' | 'pending'
  tags: ActivityTag[]
  createdAt: string
}

export interface NewActivityForm {
  title: string
  description: string
  category: ActivityCategory
  date: string
  time: string
  location?: string
  tags: ActivityTag[]
}
