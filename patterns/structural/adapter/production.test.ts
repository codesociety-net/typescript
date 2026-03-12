import { describe, it, expect } from "vitest";
import {
  V1UserAdapter,
  V2UserAdapter,
  adaptUser,
  type ApiV1User,
  type ApiV2User,
} from "./production";

describe("Adapter (Production)", () => {
  const v1Payload: ApiV1User = {
    userId: 42,
    first_name: "Jane",
    last_name: "Doe",
    email_address: "jane@example.com",
    profile_pic: "https://cdn.example.com/jane.png",
  };

  const v2Payload: ApiV2User = {
    uuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    displayName: "John Smith",
    contactEmail: "john@example.com",
    avatar: { url: "https://cdn.example.com/john.png" },
  };

  describe("V1UserAdapter", () => {
    it("converts userId to string id", () => {
      const user = new V1UserAdapter().adapt(v1Payload);
      expect(user.id).toBe("42");
    });

    it("combines first_name and last_name into fullName", () => {
      const user = new V1UserAdapter().adapt(v1Payload);
      expect(user.fullName).toBe("Jane Doe");
    });

    it("maps email_address to email", () => {
      const user = new V1UserAdapter().adapt(v1Payload);
      expect(user.email).toBe("jane@example.com");
    });

    it("maps profile_pic to avatarUrl", () => {
      const user = new V1UserAdapter().adapt(v1Payload);
      expect(user.avatarUrl).toBe("https://cdn.example.com/jane.png");
    });

    it("returns null avatarUrl when profile_pic is missing", () => {
      const noAvatar: ApiV1User = { ...v1Payload, profile_pic: undefined };
      const user = new V1UserAdapter().adapt(noAvatar);
      expect(user.avatarUrl).toBeNull();
    });
  });

  describe("V2UserAdapter", () => {
    it("maps uuid to id directly", () => {
      const user = new V2UserAdapter().adapt(v2Payload);
      expect(user.id).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    });

    it("maps displayName to fullName", () => {
      const user = new V2UserAdapter().adapt(v2Payload);
      expect(user.fullName).toBe("John Smith");
    });

    it("maps contactEmail to email", () => {
      const user = new V2UserAdapter().adapt(v2Payload);
      expect(user.email).toBe("john@example.com");
    });

    it("extracts avatar url to avatarUrl", () => {
      const user = new V2UserAdapter().adapt(v2Payload);
      expect(user.avatarUrl).toBe("https://cdn.example.com/john.png");
    });

    it("returns null avatarUrl when avatar is null", () => {
      const noAvatar: ApiV2User = { ...v2Payload, avatar: null };
      const user = new V2UserAdapter().adapt(noAvatar);
      expect(user.avatarUrl).toBeNull();
    });
  });

  describe("adaptUser factory", () => {
    it("delegates to V1UserAdapter when version is v1", () => {
      const user = adaptUser(v1Payload, "v1");
      expect(user.id).toBe("42");
      expect(user.fullName).toBe("Jane Doe");
    });

    it("delegates to V2UserAdapter when version is v2", () => {
      const user = adaptUser(v2Payload, "v2");
      expect(user.id).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
      expect(user.fullName).toBe("John Smith");
    });
  });
});
