
import { Instability } from '../types';

export const ATLAS_DATA: Instability[] = [
  {
    id: 'MATH-006',
    canonicalName: 'Infinite Divergence Cancellation',
    domain: 'Topology / Physics',
    description: "Demonstrates how 'Compactification' transforms linear divergences into finite cycles. In theories like Kaluza-Klein or String Theory, extra dimensions are wrapped up, changing the physics of 'infinite' travel.",
    mathematicalFormulation: 'R (Linear) → S1 (Compact Cycle) via x ↦ x mod N',
    simplifiedMathExplanation: "We normally think of a number line going on forever. If we 'roll up' the line into a circle (topology), moving 'infinitely' far just means going around the circle many times. This renders the space finite (compact) without adding boundaries.",
    scientificInterpretation: {
      summary: "This visualizer demonstrates 'Compactification'. By changing the topology of the domain from an infinite line (R) to a finite circle (S1), divergent paths become periodic cycles. This is a standard method in String Theory to handle extra dimensions.",
      mechanismExample: "Periodic Boundary Conditions (x + L = x).",
      resolution: "Compactification",
      homotopyPath: "1. Start with a particle on an infinite line R. \n2. Identify points x and x+L (Quotient Space). \n3. The topology changes from R to S1. \n4. Divergent linear motion becomes bounded cyclic motion. \n5. Energy/momentum states become quantized (discrete)."
    },
    experimentComponent: 'TorsionCancellation'
  },
  {
    id: 'PHY-001',
    canonicalName: 'Black Hole Singularity',
    domain: 'General Relativity',
    description: "The point in spacetime where General Relativity predicts infinite density. Modern Quantum Gravity theories (like Loop Quantum Gravity or String Theory) suggest this is a failure of the classical approximation.",
    mathematicalFormulation: 'R_{μν} - 1/2Rg_{μν} = 8πT_{μν} (Diverges as r→0)',
    simplifiedMathExplanation: "Einstein's math says gravity gets infinitely strong at the center. Quantum mechanics says 'infinity' is impossible. We believe a new physics (Quantum Gravity) takes over at very small scales to prevent this crash.",
    scientificInterpretation: {
      summary: 'Re-interpreted via Effective Field Theory. The "singularity" is likely a mathematical artifact of assuming spacetime is continuous down to zero size. A "Planck Scale Cutoff" or Fuzzball structure likely regularizes the core, capping curvature at a maximum finite value.',
      mechanismExample: 'Planck Length (l_p) acting as a minimum grid size.',
      obstruction: 'Information Loss Paradox',
      resolution: 'Quantum Gravity / String Theory Fuzzball'
    },
    experimentComponent: 'BlackHole'
  },
  {
    id: 'CS-ML-001',
    canonicalName: 'Vanishing/Exploding Gradients',
    domain: 'Machine Learning',
    description: "A numerical instability in deep neural networks where error signals either decay to zero or diverge to infinity during backpropagation, halting learning.",
    mathematicalFormulation: '∏ ||W_i|| → 0 or ∞ as depth → ∞',
    simplifiedMathExplanation: "Multiplying many numbers together can be dangerous. If they are all > 1, the result explodes. If < 1, it vanishes. Neural networks multiply matrices hundreds of times. We need to keep them in the 'Goldilocks zone'.",
    scientificInterpretation: {
      summary: "Modeled as a dynamical stability problem. Techniques like 'Batch Normalization' or 'Residual Connections' act as stabilizers. They constrain the Jacobian spectrum of the network, ensuring the signal norm remains close to 1 (isometry) during propagation.",
      mechanismExample: 'Batch Normalization (centering and scaling layer outputs).',
      resolution: 'Spectral Normalization / Residual Connections'
    },
    experimentComponent: 'GradientFlow'
  },
  {
    id: 'CS-001',
    canonicalName: 'P versus NP (Landscape)',
    domain: 'Computer Science',
    description: "The question of whether difficult search problems (NP) can be solved efficiently (P). We explore this via the 'Landscape Structure' of optimization problems.",
    mathematicalFormulation: 'Cost(x) = Σ Clauses(x). Finding min(Cost) is NP-hard.',
    scientificInterpretation: {
      summary: "While P vs NP remains open, we can tackle NP-hard problems using 'Relaxation'. We convert the discrete, rugged landscape into a continuous, smooth one. By adding 'Regularization' terms, we can help gradient descent avoid shallow local minima, though global convergence is not guaranteed.",
      mechanismExample: 'Continuous Relaxation (converting boolean 0/1 to interval [0,1]).',
      obstruction: 'Rugged Landscape (Spin Glass behavior).',
      resolution: 'Simulated Annealing / Relaxation',
      homotopyPath: "1. Discrete Problem: 2^N states, rugged landscape. \n2. Relax to Continuous Domain: R^N. \n3. Apply Gradient Descent with Noise (Langevin Dynamics). \n4. Slowly reduce noise (Annealing). \n5. If landscape is convex-like, converge to solution."
    },
    experimentComponent: 'SubsetSum'
  },
   {
    id: 'CS-002',
    canonicalName: 'The Subset Sum Problem',
    domain: 'Computer Science',
    description: "Given a set of integers, find a subset that sums to zero. A classic optimization challenge.",
    mathematicalFormulation: 'minimize |x·S| subject to x ∈ {0,1}',
    simplifiedMathExplanation: "We need to pick numbers that add up to zero. Standard computers check every combination. Our approach turns 'picking' into 'tuning dials' smoothly from 0 to 1.",
    scientificInterpretation: {
      summary: 'This experiment treats Subset Sum as a physical energy minimization problem. We apply "Continuous Relaxation" to turn binary choices into continuous variables, and "Penalty Functions" to force them back to 0 or 1 at the end. This maps discrete combinatorics onto a differentiable manifold.',
      mechanismExample: 'Softmax or Penalty terms (x^2(1-x)^2).',
      obstruction: 'Local Minima in the Energy Landscape.',
      resolution: 'Stochastic Optimization'
    },
    experimentComponent: 'SubsetSum'
  },
  {
    id: 'MATH-001',
    canonicalName: "Russell's Paradox",
    domain: 'Set Theory / Logic',
    description: "A logical instability arising from self-reference: 'The set of all sets that do not contain themselves'.",
    mathematicalFormulation: 'R = {x | x ∉ x} ⇒ R ∈ R ⇔ R ∉ R',
    simplifiedMathExplanation: "A vicious cycle in logic. It's like a computer program that says 'If I am running, stop. If I am stopped, run.' It crashes the system.",
    scientificInterpretation: {
      summary: 'In computation, logical paradoxes manifest as "Undecidability" or "Non-termination" (Infinite Loops). We model this by placing a "Computational Budget" (Gas Limit) on the evaluation. The paradox is not "solved" but "contained" by the halting of the evaluator.',
      obstruction: 'Infinite Recursion.',
      resolution: 'Type Theory / Computational Limits'
    },
    experimentComponent: 'RussellsParadox'
  },
  {
    id: 'PHY-006',
    canonicalName: 'Quasiperiodic Synchronization',
    domain: 'Non-linear Dynamics',
    description: "How simple systems with irrational frequency ratios can exhibit complex, non-repeating (quasiperiodic) behavior that mimics infinite patterns.",
    mathematicalFormulation: 'x(t) = A cos(ω₁t) + B cos(ω₂t) where ω₁/ω₂ is irrational.',
    simplifiedMathExplanation: "If you have two clocks running at speeds that never match up (like 1 and the Golden Ratio), they will never repeat the same pattern twice. This creates a pattern that is effectively infinite in variation, despite coming from a finite machine.",
    scientificInterpretation: {
      summary: "This visualizer demonstrates 'Quasiperiodicity'. By coupling oscillators with incommensurate frequencies (based on Fibonacci numbers), we generate trajectories that densely fill the phase space (ergodicity) without ever repeating. This relates to Time Crystals and the stability of the solar system (KAM Theory).",
      mechanismExample: "Incommensurate Frequencies (Golden Ratio).",
      obstruction: "Resonance disasters (Small Divisors problem).",
      resolution: "KAM Theorem (Stability of Quasiperiodic Orbits)"
    },
    experimentComponent: 'FFZClock'
  },
  {
    id: 'MATH-004',
    canonicalName: 'Divergent Series Regularization',
    domain: 'Mathematics',
    description: "Assigning finite values to infinite sums (e.g., 1 - 2 + 3 - 4 + ...) using advanced summation techniques.",
    mathematicalFormulation: 'Σ (-1)^n * n = -1/4 (Abel Summation)',
    simplifiedMathExplanation: "Ideally, adding bigger and bigger numbers should give infinity. But in complex math and physics (Casimir effect), we use 'smoothing' rules to find a hidden finite value underneath the infinity.",
    scientificInterpretation: {
      summary: "Divergence is resolved via 'Analytic Regularization'. Techniques like Abel Summation or Zeta Regularization introduce a smoothing parameter (regulator) ε. We calculate the sum with ε > 0, then analytically continue the result to ε = 0. This extracts the finite 'Casimir energy' part of the sum.",
      mechanismExample: 'Abel Regulator: exp(-εn)',
      obstruction: 'Pole at s=1 (Zeta function).',
      resolution: 'Analytic Continuation'
    },
    experimentComponent: 'FFZKernel'
  },
  {
    id: 'PHY-003',
    canonicalName: 'Cosmological Constant Problem',
    domain: 'Physics',
    description: "The 120-order-of-magnitude mismatch between quantum vacuum energy and the observed expansion of the universe.",
    mathematicalFormulation: 'ρ_vacuum ~ M_Planck^4 vs ρ_observed ~ 10^-120 M_Planck^4',
    scientificInterpretation: {
      summary: "Likely an instability in our application of Quantum Field Theory. We assume zero-point fluctuations gravitate. The resolution likely involves 'Renormalization'—subtracting the divergent high-energy contributions—or a symmetry (Supersymmetry) that cancels them out.",
      mechanismExample: 'Cutoff Regularization.',
      resolution: 'Renormalization / Supersymmetry'
    }
  },
  {
    id: 'CS-ML-003',
    canonicalName: 'GAN Mode Collapse',
    domain: 'Machine Learning',
    description: "When a Generative Adversarial Network fails to capture the full diversity of data, producing only a single type of image.",
    mathematicalFormulation: 'Min-Max Game Equilibrium Instability',
    scientificInterpretation: {
      summary: "Mode collapse is a failure to find the Nash Equilibrium in a non-convex game. We can stabilize this using 'Entropy Regularization' (forcing the generator to be diverse) or 'Wasserstein Gradients' (smoothing the discriminator landscape).",
      mechanismExample: 'Entropy Penalty Term.',
      resolution: 'Regularized Optimization'
    }
  }
];
