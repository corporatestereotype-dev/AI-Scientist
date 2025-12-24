import React from 'react';

const AnalysisSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6 last:mb-0">
        <h4 className="text-md font-semibold text-cyan-400 mb-2">{title}</h4>
        <div className="text-slate-300 space-y-3 text-sm leading-relaxed">
            {children}
        </div>
    </div>
);

const CircularityAnalysis: React.FC = () => {
    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-100 mb-4 pb-2 border-b border-slate-700">
                Deep Analysis of Circularity
            </h3>
            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                <AnalysisSection title="1. Inherent Logical Circularity (Russell's Paradox)">
                    <p>
                        {`This is the core conceptual circularity. The paradox defines a set R as "the set of all sets that do not contain themselves" (\`R = {x | x ∉ x}\`). The circularity arises when determining if R is a member of itself:`}
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>If R is a member of R, then by its definition, it must not contain itself (a contradiction).</li>
                        <li>If R is not a member of R, then by its definition, it must contain itself (also a contradiction).</li>
                    </ul>
                    <p>
                        In computation, this translates to an infinite loop. FØZ does not attempt to "solve" this, but observes this non-termination, modeling the paradox as a computational singularity.
                    </p>
                </AnalysisSection>

                <AnalysisSection title="2. Meta-Level Control (FØZ Finite Budget)">
                    <p>
                        The FØZ framework introduces a meta-level control loop. It monitors the Russell's Paradox computation and uses a "finite budget" to diagnose the infinite loop without crashing the system.
                    </p>
                    <p>
                        This feedback loop transforms a potentially catastrophic unbounded computation into a controlled, diagnosable event. It enforces a practical limit on computational effort for inherently undecidable problems, making the system robust and resilient.
                    </p>
                </AnalysisSection>

                <AnalysisSection title="3. Foundational Correctness (Representational Integrity)">
                    <p>
                        A subtle but critical aspect is ensuring the paradox is correctly represented in code. A naive implementation could easily introduce a syntax error. For example, writing the notation as a raw JavaScript expression inside JSX, like <code>{`... {x | x} ...`}</code>, would be parsed as a bitwise OR operation on an undefined variable <code>x</code>. This would cause a fatal <code>ReferenceError</code> before the simulation even begins.
                    </p>
                    <p>
                        This highlights that even systems designed to handle complex paradoxes rely on a foundation of syntactically correct and well-formed inputs. The paradox must be represented as a complete, static string. FØZ's robustness begins here: ensuring problems are defined correctly so that its advanced mechanisms can engage with the intended conceptual challenge.
                    </p>
                </AnalysisSection>
            </div>
        </div>
    );
};

export default CircularityAnalysis;