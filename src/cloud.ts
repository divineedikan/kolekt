import { useSyncExternalStore } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'
import { actions, subscribe, type State } from './store'

// Cloud backup is optional: without these two values (set in .env.local at build time) the app stays phone-only.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const cloudEnabled = Boolean(url && key)
// Email-code sign-in avoids redirect links, which break when Gmail opens them in a different browser.
const supabase = cloudEnabled ? createClient(url!, key!, { auth: { persistSession: true, detectSessionInUrl: false } }) : null

export interface CloudState {
  session: Session | null
  proUntil: string | null
  lastSync: string | null
  syncing: boolean
  error: string
}

const SYNC_KEY = 'kolekt:lastSync'
let cloud: CloudState = { session: null, proUntil: null, lastSync: localStorage.getItem(SYNC_KEY), syncing: false, error: '' }
const listeners = new Set<() => void>()
const set = (patch: Partial<CloudState>) => {
  cloud = { ...cloud, ...patch }
  listeners.forEach((l) => l())
}

export function useCloud(): CloudState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => cloud,
  )
}

export const isProActive = (c: CloudState) => !!c.proUntil && c.proUntil >= new Date().toISOString().slice(0, 10)

async function loadProfile() {
  if (!supabase || !cloud.session) return
  const { data, error } = await supabase.from('profiles').select('pro_until').eq('id', cloud.session.user.id).maybeSingle()
  if (error) return set({ error: 'Could not check your plan. Check your internet.' })
  set({ proUntil: data?.pro_until ?? null, error: '' })
}

export async function sendCode(email: string) {
  if (!supabase) return 'Cloud backup is not set up yet.'
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
  return error ? error.message : ''
}

export async function verifyCode(email: string, token: string) {
  if (!supabase) return 'Cloud backup is not set up yet.'
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  return error ? 'That code is wrong or expired. Request a new one.' : ''
}

export async function signOut() {
  await supabase?.auth.signOut()
  set({ session: null, proUntil: null })
}

export async function pushBackup(): Promise<string> {
  if (!supabase || !cloud.session) return 'Sign in first.'
  if (!isProActive(cloud)) return 'Cloud backup is a Pro feature.'
  set({ syncing: true })
  const now = new Date().toISOString()
  const { error } = await supabase.from('backups').upsert({ user_id: cloud.session.user.id, data: actions.snapshot(), updated_at: now })
  if (error) {
    set({ syncing: false, error: 'Backup failed. It will retry when you are online.' })
    return error.message
  }
  localStorage.setItem(SYNC_KEY, now)
  set({ syncing: false, lastSync: now, error: '' })
  return ''
}

export async function fetchBackup(): Promise<{ data: State; updatedAt: string } | null> {
  if (!supabase || !cloud.session) return null
  const { data } = await supabase.from('backups').select('data, updated_at').eq('user_id', cloud.session.user.id).maybeSingle()
  return data ? { data: data.data as State, updatedAt: data.updated_at as string } : null
}

export function restoreBackup(b: { data: State; updatedAt: string }) {
  actions.replaceAll(b.data)
  localStorage.setItem(SYNC_KEY, b.updatedAt)
  set({ lastSync: b.updatedAt })
}

// Push a few seconds after the last change, so typing a sale doesn't fire a request per keystroke.
let timer: ReturnType<typeof setTimeout> | undefined
function scheduleBackup() {
  if (!cloud.session || !isProActive(cloud)) return
  clearTimeout(timer)
  timer = setTimeout(() => void pushBackup(), 4000)
}

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    set({ session: data.session })
    void loadProfile()
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    set({ session })
    if (session) void loadProfile()
  })
  subscribe(scheduleBackup)
  window.addEventListener('online', scheduleBackup)
}
