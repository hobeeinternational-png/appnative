import { describe, expect, it } from "vitest";

import { formatShippingAddress } from "../lib/address-format";

describe("shipping address formatting", () => {
  it("formats populated optional address fields without empty separators", () => {
    expect(formatShippingAddress({
      line1: "1 ถนนตัวอย่าง", line2: null,
      subdistrict: null, district: "เมือง", province: "นราธิวาส", postal_code: "96000",
    })).toBe("1 ถนนตัวอย่าง · เมือง · นราธิวาส · 96000");
  });
});
