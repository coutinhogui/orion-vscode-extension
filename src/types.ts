export interface GeneratedFile {
  readonly relativePath: string;
  readonly content: string;
}

export interface ReviewResult {
  readonly fileName: string;
  readonly critical: string[];
  readonly medium: string[];
  readonly suggestions: string[];
  readonly governance: string[];
  readonly performance: string[];
  readonly security: string[];
  readonly productionChecklist: string[];
}

