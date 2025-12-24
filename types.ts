
export interface ScientificAnalysisResult {
  diagnosis: string;
  scientific_proposal?: {
    mechanism: string; // e.g., "Regularization", "Renormalization", "Phase Transition"
    mathematical_basis: string; // e.g., "Analytic Continuation", "Mean Field Theory"
    conceptual_map: string; // How standard theory maps to this specific problem
  };
  groundingSources?: { title: string; uri: string }[];
  falsifiability?: {
    failure_condition: string;
    critical_experiment: string;
    confidence_score: number;
  };
}

// Alias for backward compatibility if needed, though we try to replace usage
export type FozAnalysisResult = ScientificAnalysisResult;

export interface Instability {
  id: string;
  canonicalName: string;
  domain: string;
  description: string;
  mathematicalFormulation: string;
  simplifiedMathExplanation?: string;
  scientificInterpretation: {
    summary: string;
    mechanismExample?: string; // e.g., "Cutoff scale epsilon"
    obstruction?: string;
    resolution?: string; // e.g. "Effective Field Theory"
    homotopyPath?: string; // Kept as "Conceptual Path" or "Renormalization Flow"
  };
  experimentComponent?: 'SubsetSum' | 'BlackHole' | 'GradientFlow' | 'RussellsParadox' | 'FFZClock' | 'FFZKernel' | 'TorsionCancellation';
}
