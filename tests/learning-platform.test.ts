import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { isLearningNotificationRoute } from "../lib/deep-links";
import { COURSE_METADATA, LEARNING_EVENTS, LEARNING_LIVE_CLASSES, LEARNING_MEMBERSHIP_PLANS, LEARNING_ONE_ON_ONE_SERVICES, LEARNING_TEACHERS, TEACHER_LEARNER_BRIDGES, coursesForAccess, coursesForTeacher, getCourseMetadata } from "../lib/learning-platform";

const root = resolve(__dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Learning Platform presentation contracts", () => {
  it("maps every presentation course to access and teacher metadata", () => {
    expect(COURSE_METADATA.length).toBeGreaterThan(0);
    for (const metadata of COURSE_METADATA) { expect(metadata.teacherId).toMatch(/^teacher-/); expect(metadata.tags.length).toBeGreaterThan(0); expect(getCourseMetadata(metadata.courseId)?.dataMode).toBe("presentation"); }
  });
  it("keeps access types distinct without manufacturing a purchase transaction", () => {
    expect(coursesForAccess("free").length).toBeGreaterThan(0); expect(coursesForAccess("paid").length).toBeGreaterThan(0); expect(coursesForAccess("subscription").length).toBeGreaterThan(0); expect(LEARNING_MEMBERSHIP_PLANS.every((plan) => plan.dataMode === "presentation" && plan.price === null)).toBe(true);
  });
  it("maps public teachers to courses and operating boundary records", () => {
    for (const teacher of LEARNING_TEACHERS) { expect(coursesForTeacher(teacher.id).every((course) => teacher.courseIds.includes(course.id))).toBe(true); expect(TEACHER_LEARNER_BRIDGES.find((bridge) => bridge.teacherId === teacher.id)?.publishingSource).toBe("presentation"); }
  });
  it("exposes event, live, and 1-on-1 presentations without ticket or booking state", () => {
    expect(LEARNING_EVENTS.every((event) => event.dataMode === "presentation" && event.capacity === null && event.price === null)).toBe(true); expect(LEARNING_LIVE_CLASSES.every((item) => item.dataMode === "presentation" && item.learnerCount === null)).toBe(true); expect(LEARNING_ONE_ON_ONE_SERVICES.every((item) => item.dataMode === "presentation" && item.price === null)).toBe(true);
  });
});

describe("Learning Platform navigation safety", () => {
  it("allows only recognised Learning notification destinations", () => {
    expect(isLearningNotificationRoute("/learning/events/event-growth-01/ticket")).toBe(true); expect(isLearningNotificationRoute("/learning/live/live-growth-01")).toBe(true); expect(isLearningNotificationRoute("/learning/teacher/teacher-sofiya")).toBe(true); expect(isLearningNotificationRoute("/learning/events/booking/event-growth-01")).toBe(false); expect(isLearningNotificationRoute("/learning/../../admin")).toBe(false);
  });
  it("registers discovery, membership, teacher, event, live, calendar, and session routes in the root stack", () => {
    const layout = source("app/_layout.tsx"); for (const route of ["learning/catalogue", "learning/search", "learning/category/[id]", "learning/membership", "learning/teacher/[id]", "learning/events", "learning/events/[id]", "learning/calendar", "learning/live/[id]", "learning/sessions/[id]"]) expect(layout).toContain(`name="${route}"`);
  });
  it("provides local Learning Library persistence and keeps notes/bookmarks outside payment or enrollment systems", () => {
    const library = source("contexts/learning-library-context.tsx"); expect(library).toContain("hobee_learning_library_v1"); expect(library).toContain("toggleBookmark"); expect(library).toContain("addNote"); expect(library).not.toContain("supabase");
  });
});
