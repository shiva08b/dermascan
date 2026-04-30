export type AcneType = "cystic" | "open_comedone" | "closed_comedone" | null;
export type Severity = "mild" | "moderate" | "severe" | null;
export type AIProvider = "gemini" | "groq" | "cohere" | "huggingface" | "openrouter" | "combined" | "consensus";

export interface ScanResult {
  is_acne: boolean;
  acne_type: AcneType;
  confidence: number;
  severity: Severity;
  recommendation_tags: string[];
  raw_scores: {
    screener: number[];
    classifier?: number[];
  };
  skincare_routine: {
    provider: string;
    routine: string;
    status: "success" | "fallback" | "error" | "skipped";
  };
}

export interface ScanRecord {
  id: string;
  user_id: string;
  created_at: string;
  is_acne: boolean;
  acne_type: AcneType;
  confidence: number;
  severity: Severity;
  provider: string;
  routine: string;
  image_url: string | null;
  raw_scores: any;
}

export const SEVERITY_COLORS = {
  mild:     "#4ADE80",
  moderate: "#FB923C",
  severe:   "#F87171",
  null:     "#6B6B7A"
} as const;

export const ACNE_LABELS = {
  cystic:          "Cystic Acne",
  open_comedone:   "Open Comedone (Blackhead)",
  closed_comedone: "Closed Comedone (Whitehead)",
  null:            "No Acne"
} as const;

export const API_URL = "https://dermascan-api-production.up.railway.app";