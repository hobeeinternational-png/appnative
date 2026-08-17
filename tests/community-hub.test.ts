import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getBackRule } from "../lib/back-navigation";
import { isCommunityNotificationRoute, isHobeeNotificationRoute } from "../lib/deep-links";
import { COMMUNITY_ACTIVITIES, COMMUNITY_CLUBS, COMMUNITY_FILTERS, COMMUNITY_JOBS, COMMUNITY_PEOPLE, COMMUNITY_POSTS, COMMUNITY_PROVINCES, COMMUNITY_RECOMMENDATIONS, COMMUNITY_REPORT_REASONS, COMMUNITY_STORIES, COMMUNITY_TRIPS, findCommunitySearchResults, getCommunityActivity, getCommunityClub, getCommunityJob, getCommunityPerson, getCommunityProvinceLabel } from "../lib/community-hub";

const root = resolve(__dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Community Hub presentation contracts", () => {
  it("publishes the core discovery collections with known provinces and without transaction amounts", () => {
    expect(COMMUNITY_PROVINCES.length).toBeGreaterThanOrEqual(5);
    expect(COMMUNITY_FILTERS.map((filter) => filter.id)).toEqual(["all", "story", "club", "activity", "job", "trip"]);
    expect(COMMUNITY_STORIES.length).toBeGreaterThan(0);
    expect(COMMUNITY_CLUBS.length).toBeGreaterThan(0);
    expect(COMMUNITY_ACTIVITIES.length).toBeGreaterThan(0);
    expect(COMMUNITY_JOBS.length).toBeGreaterThan(0);
    expect(COMMUNITY_TRIPS.length).toBeGreaterThan(0);
    expect(COMMUNITY_RECOMMENDATIONS.every((item) => COMMUNITY_PROVINCES.some((province) => province.id === item.province))).toBe(true);
    expect(JSON.stringify({ COMMUNITY_ACTIVITIES, COMMUNITY_JOBS, COMMUNITY_TRIPS })).not.toContain("totalAmount");
  });

  it("keeps feed authors, story references, activity clubs, and lookups internally consistent", () => {
    expect(COMMUNITY_POSTS.length).toBeGreaterThan(0);
    for (const post of COMMUNITY_POSTS) expect(getCommunityPerson(post.authorId)).toBeDefined();
    for (const story of COMMUNITY_STORIES) {
      expect(getCommunityPerson(story.authorId)).toBeDefined();
      expect(story.references.every((reference) => reference.route.startsWith("/"))).toBe(true);
    }
    for (const activity of COMMUNITY_ACTIVITIES) {
      expect(getCommunityActivity(activity.id)).toEqual(activity);
      if (activity.relatedClubId) expect(getCommunityClub(activity.relatedClubId)).toBeDefined();
    }
    for (const job of COMMUNITY_JOBS) expect(getCommunityJob(job.id)).toEqual(job);
  });

  it("supports case-insensitive discovery and preserves an empty-query browse experience", () => {
    expect(findCommunitySearchResults("").length).toBe(COMMUNITY_RECOMMENDATIONS.length + COMMUNITY_PEOPLE.length);
    expect(findCommunitySearchResults("LOCAL").some((item) => item.title.includes("Local"))).toBe(true);
    expect(findCommunitySearchResults("nีซา").length).toBe(0);
    expect(getCommunityProvinceLabel("narathiwat")).toBe("นราธิวาส");
    expect(getCommunityProvinceLabel("other")).toBe("จังหวัดอื่น");
  });

  it("defines every moderation report reason and never marks the presentation feed as removed", () => {
    expect(COMMUNITY_REPORT_REASONS).toHaveLength(8);
    expect(new Set(COMMUNITY_REPORT_REASONS.map((reason) => reason.id)).size).toBe(COMMUNITY_REPORT_REASONS.length);
    expect(COMMUNITY_POSTS.every((post) => post.reportState === "available")).toBe(true);
  });
});

describe("Community Hub navigation safety", () => {
  it("allows only recognised Community notification destinations", () => {
    for (const route of ["/community", "/community/stories", "/community/clubs/club-lens-south", "/community/activities/activity-photo-walk", "/community/jobs/job-local-content", "/community/profile/privacy", "/community/people/creator-nisa"]) {
      expect(isCommunityNotificationRoute(route)).toBe(true);
      expect(isHobeeNotificationRoute(route)).toBe(true);
    }
    for (const route of ["/community/create", "/community/moderation", "/community/../../admin", "/community/jobs/job-local-content/apply", "/admin"]) expect(isCommunityNotificationRoute(route)).toBe(false);
  });

  it("maps Community detail routes to local safe-back fallbacks", () => {
    expect(getBackRule("community/clubs/[id]").fallback).toBe("/community/clubs");
    expect(getBackRule("community/activities/[id]").fallback).toBe("/community/activities");
    expect(getBackRule("community/profile/privacy").fallback).toBe("/community/profile");
    expect(getBackRule("community/moderation").fallback).toBe("/community");
  });

  it("registers Community routes in the root stack and routes Home Community entry directly to the hub", () => {
    const layout = source("app/_layout.tsx");
    for (const route of ["community", "community/search", "community/stories", "community/clubs", "community/activities", "community/jobs", "community/profile", "community/profile/network", "community/profile/privacy", "community/moderation"]) expect(layout).toContain(`name=\"${route}`);
    const home = source("app/(tabs)/index.tsx");
    expect(home).toContain('{ label: "Community", icon: "groups", tone: "#F1E8FF", route: "/community" }');
    expect(home).toContain('id: "service-community"');
    expect(home).toContain('route: "/community" as Href');
  });

  it("keeps network, privacy, and moderation UI outside Supabase mutation calls", () => {
    for (const path of ["app/community/profile/index.tsx", "app/community/profile/network.tsx", "app/community/profile/privacy.tsx", "app/community/moderation.tsx"]) {
      expect(source(path)).not.toContain("supabase");
      expect(source(path)).not.toContain("insert(");
      expect(source(path)).not.toContain("update(");
    }
  });
});
