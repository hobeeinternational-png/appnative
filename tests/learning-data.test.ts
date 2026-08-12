import { describe, expect, it } from "vitest";

import { coursesForWorld, getCourse } from "../lib/learning-data";
import { updateProgress, type LearningProgress } from "../lib/learning-progress";

describe("HOBEE Learning data", () => {
  it("keeps courses in their selected learning world", () => {
    expect(coursesForWorld("business_skills").every((course) => course.world === "business_skills")).toBe(true);
    expect(coursesForWorld("islamic_wisdom").every((course) => course.world === "islamic_wisdom")).toBe(true);
  });

  it("finds the featured Meta Ads course", () => {
    expect(getCourse("meta-ads-mastery")?.hasCertificate).toBe(true);
  });

  it("replaces saved progress for the same course", () => {
    const first: LearningProgress = { courseId: "meta-ads-mastery", lastEpisodeId: "meta-ads-01", completedEpisodeIds: [], completionPercentage: 10, updatedAt: "2026-08-12" };
    const second = { ...first, completionPercentage: 32 };
    expect(updateProgress([first], second)).toEqual([second]);
  });
});
