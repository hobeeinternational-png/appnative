import AsyncStorage from "@react-native-async-storage/async-storage";

export type LearningProgress = {
  courseId: string;
  lastEpisodeId: string;
  completedEpisodeIds: string[];
  completionPercentage: number;
  updatedAt: string;
};

export const LEARNING_PROGRESS_STORAGE_KEY = "hobee_learning_progress_v1";

export function updateProgress(records: LearningProgress[], next: LearningProgress) {
  return [...records.filter((record) => record.courseId !== next.courseId), next];
}

export async function loadLearningProgress() {
  const raw = await AsyncStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY);
  if (!raw) return [] as LearningProgress[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed as LearningProgress[] : [];
  } catch {
    return [] as LearningProgress[];
  }
}

export async function saveLearningProgress(records: LearningProgress[]) {
  await AsyncStorage.setItem(LEARNING_PROGRESS_STORAGE_KEY, JSON.stringify(records));
}
