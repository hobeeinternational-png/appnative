import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { LearningBookmark, LearningNote } from "@/lib/learning-platform";

const STORAGE_KEY = "hobee_learning_library_v1";
type RecentLearning = { kind: "course" | "teacher" | "event"; id: string; viewedAt: string };
type LearningLibraryState = { bookmarks: LearningBookmark[]; notes: LearningNote[]; savedCourseIds: string[]; recent: RecentLearning[] };
type LearningLibraryValue = LearningLibraryState & { ready: boolean; toggleCourseSaved: (courseId: string) => void; toggleBookmark: (bookmark: Omit<LearningBookmark, "id" | "createdAt">) => void; addNote: (note: Omit<LearningNote, "id" | "createdAt" | "updatedAt">) => void; updateNote: (id: string, body: string) => void; removeNote: (id: string) => void; addRecent: (item: Omit<RecentLearning, "viewedAt">) => void };

const initial: LearningLibraryState = { bookmarks: [], notes: [], savedCourseIds: [], recent: [] };
const LearningLibraryContext = createContext<LearningLibraryValue | null>(null);
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function LearningLibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearningLibraryState>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => { AsyncStorage.getItem(STORAGE_KEY).then((raw) => { if (!raw) return; try { const parsed = JSON.parse(raw) as Partial<LearningLibraryState>; setState({ bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [], notes: Array.isArray(parsed.notes) ? parsed.notes : [], savedCourseIds: Array.isArray(parsed.savedCourseIds) ? parsed.savedCourseIds : [], recent: Array.isArray(parsed.recent) ? parsed.recent : [] }); } catch { setState(initial); } }).finally(() => setReady(true)); }, []);
  useEffect(() => { if (ready) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [ready, state]);
  const toggleCourseSaved = useCallback((courseId: string) => setState((current) => ({ ...current, savedCourseIds: current.savedCourseIds.includes(courseId) ? current.savedCourseIds.filter((id) => id !== courseId) : [...current.savedCourseIds, courseId] })), []);
  const toggleBookmark = useCallback((bookmark: Omit<LearningBookmark, "id" | "createdAt">) => setState((current) => { const match = current.bookmarks.find((item) => item.courseId === bookmark.courseId && item.lessonId === bookmark.lessonId && item.timestampSeconds === bookmark.timestampSeconds); return match ? { ...current, bookmarks: current.bookmarks.filter((item) => item.id !== match.id) } : { ...current, bookmarks: [...current.bookmarks, { ...bookmark, id: makeId("bookmark"), createdAt: new Date().toISOString() }] }; }), []);
  const addNote = useCallback((note: Omit<LearningNote, "id" | "createdAt" | "updatedAt">) => setState((current) => ({ ...current, notes: [...current.notes, { ...note, id: makeId("note"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] })), []);
  const updateNote = useCallback((id: string, body: string) => setState((current) => ({ ...current, notes: current.notes.map((item) => item.id === id ? { ...item, body, updatedAt: new Date().toISOString() } : item) })), []);
  const removeNote = useCallback((id: string) => setState((current) => ({ ...current, notes: current.notes.filter((item) => item.id !== id) })), []);
  const addRecent = useCallback((item: Omit<RecentLearning, "viewedAt">) => setState((current) => ({ ...current, recent: [{ ...item, viewedAt: new Date().toISOString() }, ...current.recent.filter((existing) => existing.kind !== item.kind || existing.id !== item.id)].slice(0, 24) })), []);
  const value = useMemo(() => ({ ...state, ready, toggleCourseSaved, toggleBookmark, addNote, updateNote, removeNote, addRecent }), [state, ready, toggleCourseSaved, toggleBookmark, addNote, updateNote, removeNote, addRecent]);
  return <LearningLibraryContext.Provider value={value}>{children}</LearningLibraryContext.Provider>;
}

export function useLearningLibrary() { const value = useContext(LearningLibraryContext); if (!value) throw new Error("useLearningLibrary must be used within LearningLibraryProvider"); return value; }
