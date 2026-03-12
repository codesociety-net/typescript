// Adapter Pattern – Production
// Normalises divergent API response shapes from v1 and v2 endpoints
// into a single canonical User record consumed by the application.

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

// ── Legacy v1 shape ──────────────────────────────────────────────────────────
export interface ApiV1User {
  userId: number;
  first_name: string;
  last_name: string;
  email_address: string;
  profile_pic?: string;
}

// ── Modern v2 shape ──────────────────────────────────────────────────────────
export interface ApiV2User {
  uuid: string;
  displayName: string;
  contactEmail: string;
  avatar: { url: string } | null;
}

// ── Adapter interface ────────────────────────────────────────────────────────
export interface UserAdapter<TRaw> {
  adapt(raw: TRaw): User;
}

// ── V1 Adapter ───────────────────────────────────────────────────────────────
export class V1UserAdapter implements UserAdapter<ApiV1User> {
  adapt(raw: ApiV1User): User {
    return {
      id: String(raw.userId),
      fullName: `${raw.first_name} ${raw.last_name}`.trim(),
      email: raw.email_address,
      avatarUrl: raw.profile_pic ?? null,
    };
  }
}

// ── V2 Adapter ───────────────────────────────────────────────────────────────
export class V2UserAdapter implements UserAdapter<ApiV2User> {
  adapt(raw: ApiV2User): User {
    return {
      id: raw.uuid,
      fullName: raw.displayName,
      email: raw.contactEmail,
      avatarUrl: raw.avatar?.url ?? null,
    };
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────
export function adaptUser(raw: ApiV1User | ApiV2User, version: "v1" | "v2"): User {
  if (version === "v1") return new V1UserAdapter().adapt(raw as ApiV1User);
  return new V2UserAdapter().adapt(raw as ApiV2User);
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // ── Usage ─────────────────────────────────────────────────────────────────────
  const legacyPayload: ApiV1User = {
    userId: 42,
    first_name: "Jane",
    last_name: "Doe",
    email_address: "jane@example.com",
    profile_pic: "https://cdn.example.com/jane.png",
  };
  
  const modernPayload: ApiV2User = {
    uuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    displayName: "John Smith",
    contactEmail: "john@example.com",
    avatar: { url: "https://cdn.example.com/john.png" },
  };
  
  console.log(adaptUser(legacyPayload, "v1"));
  console.log(adaptUser(modernPayload, "v2"));
}
