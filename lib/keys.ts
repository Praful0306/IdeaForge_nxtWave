// NagarNetra AI Key Management & Rotation
// Supports round-robin across up to 4 keys per provider with automatic 429/quota cooling

export type AIProvider = "groq" | "gemini";

interface KeySlot {
  key: string;
  slot: number; // 1-based index (1..4)
}

// In-memory cooling timestamps: Map<"provider:slot", coolingUntilMs>
const coolingMap = new Map<string, number>();

// In-memory round-robin pointer per provider
const pointerMap: Record<AIProvider, number> = {
  groq: 0,
  gemini: 0,
};

/**
 * Loads all configured non-empty keys for a given provider.
 * Never logs or exposes raw key strings.
 */
export function getProviderKeys(provider: AIProvider): KeySlot[] {
  const keys: KeySlot[] = [];
  const prefix = provider === "groq" ? "GROQ_API_KEY_" : "GEMINI_API_KEY_";

  for (let i = 1; i <= 4; i++) {
    const val = process.env[`${prefix}${i}`]?.trim();
    if (val) {
      keys.push({ key: val, slot: i });
    }
  }

  return keys;
}

/**
 * Checks if a specific key slot is currently in a cooling period.
 */
export function isSlotCooling(provider: AIProvider, slot: number): boolean {
  const expire = coolingMap.get(`${provider}:${slot}`);
  if (!expire) return false;
  if (Date.now() > expire) {
    coolingMap.delete(`${provider}:${slot}`);
    return false;
  }
  return true;
}

/**
 * Marks a key slot as cooling on 429, 401, or quota exhaustion.
 */
export function markCooling(provider: AIProvider, slot: number, retryAfterSec: number = 60) {
  const until = Date.now() + Math.max(retryAfterSec, 5) * 1000;
  coolingMap.set(`${provider}:${slot}`, until);
  console.warn(`[AI Key Rotation] Marked ${provider} slot ${slot} cooling for ${retryAfterSec}s`);
}

/**
 * Resets cooling state (used for testing and recovery).
 */
export function resetCooling() {
  coolingMap.clear();
  pointerMap.groq = 0;
  pointerMap.gemini = 0;
}

/**
 * Returns the next available non-cooling key for the provider in round-robin order.
 * Returns null if all keys for this provider are currently cooling or no keys configured.
 */
export function nextKey(provider: AIProvider): KeySlot | null {
  const allKeys = getProviderKeys(provider);
  if (allKeys.length === 0) return null;

  const total = allKeys.length;
  const startIndex = pointerMap[provider] % total;

  for (let offset = 0; offset < total; offset++) {
    const candidateIdx = (startIndex + offset) % total;
    const candidate = allKeys[candidateIdx];

    if (!isSlotCooling(provider, candidate.slot)) {
      // Advance round-robin pointer for next request
      pointerMap[provider] = (candidateIdx + 1) % total;
      return candidate;
    }
  }

  // All keys are currently cooling
  return null;
}
