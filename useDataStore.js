// ═══════════════════════════════════════════════════════════════
// useDataStore — centrale data state
// Beheert: Sheet ID, fetch status, data, refresh-timer
// Persisteert Sheet ID in localStorage
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchDashboardData, extractSheetId, isValidSheetId } from '../data/sheetsAdapter.js'
import { buildFallbackData } from '../data/fallbackData.js'

const LS_KEY_SHEET_ID    = 'horeca_sheet_id'
const LS_KEY_SHEET_URL   = 'horeca_sheet_url'
const AUTO_REFRESH_MS    = 5 * 60 * 1000  // 5 minuten

export function useDataStore() {
  const [sheetUrl,  setSheetUrl]  = useState(() => localStorage.getItem(LS_KEY_SHEET_URL) || '')
  const [sheetId,   setSheetId]   = useState(() => localStorage.getItem(LS_KEY_SHEET_ID)  || '')
  const [data,      setData]      = useState(null)
  const [status,    setStatus]    = useState('idle')   // idle | loading | success | error | fallback
  const [error,     setError]     = useState(null)
  const [lastFetch, setLastFetch] = useState(null)
  const timerRef = useRef(null)

  // Laad data — met of zonder Sheet ID
  const load = useCallback(async (id) => {
    setStatus('loading')
    setError(null)
    try {
      const result = await fetchDashboardData(id)
      setData(result)
      setLastFetch(new Date())
      setStatus(result.meta.source === 'google-sheets' ? 'success' : 'fallback')
      if (result.meta.error) setError(result.meta.error)
    } catch (e) {
      setData(buildFallbackData())
      setStatus('error')
      setError(e.message)
    }
  }, [])

  // Sla Sheet URL + ID op en herlaad
  const saveSheet = useCallback((rawUrl) => {
    const id = extractSheetId(rawUrl)
    setSheetUrl(rawUrl)
    setSheetId(id)
    localStorage.setItem(LS_KEY_SHEET_URL, rawUrl)
    localStorage.setItem(LS_KEY_SHEET_ID,  id)
    return id
  }, [])

  // Verbind — sla op en laad meteen
  const connect = useCallback(async (rawUrl) => {
    const id = saveSheet(rawUrl)
    await load(id)
  }, [saveSheet, load])

  // Ontkoppel
  const disconnect = useCallback(() => {
    localStorage.removeItem(LS_KEY_SHEET_ID)
    localStorage.removeItem(LS_KEY_SHEET_URL)
    setSheetUrl('')
    setSheetId('')
    setData(buildFallbackData())
    setStatus('fallback')
    setError(null)
  }, [])

  // Handmatige refresh
  const refresh = useCallback(() => load(sheetId), [load, sheetId])

  // Auto-refresh instellen/verwijderen
  const startAutoRefresh = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load(sheetId)
      }
    }, AUTO_REFRESH_MS)
  }, [load, sheetId])

  // Initieel laden + auto-refresh starten
  useEffect(() => {
    load(sheetId)
    startAutoRefresh()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh bij zichtbaar worden (tab-switch)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && sheetId && status === 'success') {
        load(sheetId)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [sheetId, status, load])

  const isLive     = status === 'success'
  const isFallback = status === 'fallback' || status === 'error'
  const isLoading  = status === 'loading'
  const isConnected = isValidSheetId(sheetId)

  return {
    // Data
    data,
    // Status
    status, error, lastFetch, isLive, isFallback, isLoading, isConnected,
    // Sheet config
    sheetUrl, sheetId,
    // Acties
    connect, disconnect, refresh, saveSheet,
  }
}
