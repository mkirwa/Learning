# AI-Assisted Coding: Delivery-Impact Evidence and Pilot Model

## Purpose

This README explains and evaluates a proposed method for estimating how AI-assisted coding could affect end-to-end software delivery. It is intended to support program leadership, engineering, and governance decisions.

The approach uses:

- External or **reference-class evidence** from comparable AI-assisted development studies
- **Amdahl's Law** to translate task-level coding improvement into total delivery improvement
- A more realistic model that includes adoption, task eligibility, and AI-related overhead
- A controlled local pilot to replace broad industry assumptions with program-specific evidence

---

## Bottom Line

Amdahl's Law is a sound first-order way to explain why faster coding does not produce an equal improvement in total software delivery. Coding is only one part of delivery; planning, investigation, review, integration, testing, security, approval, and release may remain unchanged or become new bottlenecks.

The proposed **5–15% end-to-end delivery improvement** is plausible as a planning range, but existing external evidence does not prove that result for this program.

The defensible leadership position is:

> External evidence suggests meaningful but highly variable gains. The program will use 5–15% as a planning hypothesis—not a guaranteed benefit—and validate it through a controlled pilot measuring accepted delivery, quality, rework, adoption, and cost.

---

# 1. Reference-Class Evidence

## What it means

Reference-class evidence uses results from comparable situations rather than relying only on expectations about the current program. It is the **outside view**:

> What happened when other development organizations used similar AI tools on similar work?

Examples:

- **Inside view:** “Our developers believe AI will make them 30% faster.”
- **Reference-class view:** “Comparable studies found results ranging from slowdowns to substantial gains, depending on the task, developer, measurement method, and codebase.”

## Why the current reference class is imperfect

The cited studies do not evaluate one consistent population or outcome:

| Study or evidence source | Population or environment | Primary outcome |
|---|---|---|
| METR | Experienced open-source developers working in familiar repositories | Time to complete selected repository tasks |
| Anthropic | Mostly junior developers learning a Python library | Task time and knowledge/mastery |
| NBER working paper | Broad GitHub activity | Commits, projects, and releases |
| Stanford AI Impact work | Enterprise repository activity | Productivity estimates based on the researchers' model |
| Management Science field experiments | Developers at Microsoft, Accenture, and another Fortune 100 company | Completed tasks |

These sources are useful for bounding expectations, but they measure different:

- Developers
- Tasks
- Organizations
- AI tools
- Outcomes
- Time periods
- Quality controls

Therefore, the evidence should be described as a **plausible prior range**, not a validated program forecast.

---

# 2. Greenfield and Brownfield Work

“Greenfield” and “brownfield” describe how much existing software, architecture, and operational behavior constrain the work. They do not, by themselves, describe complexity.

| Work class | Plain-language meaning | Example |
|---|---|---|
| Simple greenfield | New, isolated, and clearly bounded | Create a REST endpoint that validates input and writes to a new table |
| Complex greenfield | New system with difficult architecture or mission constraints | Design a resilient event-processing system with security and performance requirements |
| Simple brownfield | Limited change following established patterns in an existing system | Add a field to an existing screen and database object |
| Complex brownfield | Change to an established system with dependencies, hidden assumptions, and regression risk | Modify authentication in a 15-year-old application used by several services and databases |

## Why the distinction matters

AI will probably not produce one uniform productivity effect.

Simple greenfield tasks are often more favorable because:

- Requirements are bounded.
- Common implementation patterns exist.
- There are fewer hidden dependencies.
- The generated code can be tested in relative isolation.

Complex brownfield tasks are harder because the developer and AI must understand:

- Undocumented business rules
- Cross-repository interactions
- Legacy libraries and custom frameworks
- Security and authorization assumptions
- Why apparently unnecessary code still exists
- Interface and regression consequences

Greenfield does not automatically mean easy, and brownfield does not automatically mean old. The pilot must classify both **codebase maturity** and **task complexity**.

---

# 3. Amdahl's Law

## Plain-language explanation

Amdahl's Law says that improving one portion of a process produces only a limited improvement in the total process. The portions that do not improve eventually become the bottleneck.

The original principle applies to computer processing, but it can be used as a first-order approximation for a software-delivery workflow [1].

## Basic equation

```text
S_total = 1 / [(1 - P) + (P / S_task)]
```

Where:

- `P` = fraction of baseline elapsed delivery time affected by AI
- `1 - P` = fraction of delivery time not affected by AI
- `S_task` = speedup within the AI-assisted portion
- `S_total` = resulting end-to-end delivery speedup

`P` should represent **elapsed cycle time**, not only developer effort. Developer work, review, testing, and approval may overlap; adding labor hours does not necessarily produce the actual delivery duration.

## Worked example

Assume one work item normally takes 100 elapsed hours:

- Coding-related work: 35 hours, so `P = 0.35`
- Everything else: 65 hours
- AI makes the coding portion 1.4 times as fast, so `S_task = 1.4`

```text
S_total = 1 / [(1 - 0.35) + (0.35 / 1.4)]
S_total = 1 / [0.65 + 0.25]
S_total = 1 / 0.90
S_total = 1.111x
```

Operationally:

- Coding decreases from 35 hours to `35 / 1.4 = 25 hours`.
- The remaining work still takes 65 hours.
- Total duration decreases from 100 to 90 hours.
- Cycle time decreases by 10%.
- Delivery throughput increases by approximately 11.1%.

Therefore, a 40% increase in coding rate produces only an 11.1% increase in overall delivery rate in this example.

## Maximum possible improvement

If coding represents 35% of elapsed delivery time, even infinitely fast coding cannot eliminate the remaining 65%:

```text
S_max = 1 / (1 - 0.35)
S_max = 1.538x
```

The theoretical ceiling is:

- 53.8% more throughput, or
- 35% less total cycle time

Real improvement would be lower because AI is not infinitely fast and introduces prompting, review, correction, and operational overhead.

---

# 4. Speedup, Throughput Increase, and Time Reduction

These terms are related but not interchangeable.

```text
Throughput increase = S - 1
Time reduction = 1 - (1 / S)
```

| Speed multiplier | Throughput increase | Time reduction |
|---:|---:|---:|
| 1.13x | 13% | 11.5% |
| 1.25x | 25% | 20.0% |
| 1.40x | 40% | 28.6% |
| 2.50x | 150% | 60.0% |

For clarity:

- `2.5x` means performance is 250% **of baseline**.
- It means a 150% **increase** in performance.
- It means a 60% **reduction in time** for the accelerated task.

Leadership material should always state which interpretation is being used.

---

# 5. Sigma, Not Omega

The symbol used in the probability model is lowercase sigma:

```text
σ
```

It is not omega (`ω`). Sigma represents the assumed standard deviation—the amount of variability or uncertainty in a probability distribution.

For a normal distribution centered at `1.0x` with `σ = 0.2`:

- The center is `1.0x`, meaning no improvement.
- Roughly 68% of an untruncated normal distribution falls between `0.8x` and `1.2x`.
- A result below `1.0x` indicates a slowdown.
- A result above `1.0x` indicates an improvement.

A **truncated normal distribution** is a bell-shaped distribution cut off at defined minimum or maximum values.

If the model uses a log-normal distribution with `σ = 0.7`, sigma is measured in log space. It cannot be interpreted as “plus or minus 70%.” To reproduce the curve, the analysis must provide:

- Location parameter
- Scale parameter
- Shift, if any
- Minimum and maximum bounds
- Random seed
- Number of simulations

---

# 6. How to Read the Delivery-Speedup Graph

## Horizontal axis

The horizontal axis is the estimated overall delivery multiplier:

- `1.00x` = no improvement
- `1.10x` = approximately 10% more delivered output
- `1.25x` = approximately 25% more delivered output
- Below `1.00x` = delivery is slower than the baseline

## Curves

- **Pessimistic curve:** Outcomes cluster around `1.00x`, with little benefit and some possibility of slowdown.
- **Data-aligned curve:** Outcomes cluster near a modest improvement, but a long right tail permits larger benefits.
- **Optimistic curve:** Outcomes cluster around a larger improvement.

The width of a curve represents uncertainty:

- Narrow curve = assumed outcomes are relatively consistent.
- Wide curve = outcomes could vary substantially.

Overlapping curves mean that the scenarios cannot be cleanly distinguished. An optimistic implementation can still produce a modest result, while a data-aligned implementation can occasionally produce a larger result.

## Graph corrections needed

- Identify whether each dotted line is the **mean, median, or mode**.
- If the curves are continuous densities, label the vertical axis **Probability density**, not “Probability (%)”.
- If the graph shows percentages by simulation bin, state the bin width.
- Do not infer that one scenario is more likely because its curve is taller. Separate scenario probabilities must be assigned for that conclusion.

---

# 7. Evidence and Model Problems

## 7.1 METR is misstated

The cited METR update does not establish an average 20% coding-speed gain. METR's earlier randomized experiment found that experienced developers working in repositories they knew took approximately **19% longer** with AI. METR described later self-selected data as difficult to interpret because of participant selection, task selection, and time-measurement issues [2].

## 7.2 Anthropic's 80% figure is being combined with a different experiment

Anthropic's “up to 80%” figure came from a separate observational analysis. In the cited randomized study of 52 mostly junior developers:

- The AI group completed the task about two minutes faster.
- The time difference was not statistically significant.
- The AI group scored 17 percentage points lower on mastery [3].

The productivity observation and randomized learning experiment should be reported separately.

## 7.3 NBER measures are not coding-time speedups

The NBER working paper reported large increases in commits and smaller increases in projects and releases. Its abstract reported approximately 240% more commits but about 30% more releases [4].

These are counts, while Amdahl's `S_task` requires a time-based speedup for completing the same amount and quality of work. A commit-count increase cannot be inserted directly into the equation as a coding-time multiplier.

## 7.4 The Stanford link is not the underlying reproducible study

The Stanford research page describes broad ongoing research across more than 120,000 engineers, but the public page does not provide enough methodology to reproduce a specific 0–40% range [5]. The result should be cited as preliminary or unpublished unless a full study or methodology package is available.

## 7.5 The model uses effort where elapsed time is required

Amdahl's Law operates on the fraction of baseline duration affected by the change. Labor effort and elapsed time are not necessarily equal because activities can overlap.

## 7.6 The workflow is not fully serial

Real software delivery includes parallel work and queues:

- Developers wait for requirements or environment access.
- Pull requests wait for reviewers.
- Automated tests run concurrently.
- Security and approval queues introduce delay.
- Faster coding may create a larger review backlog.

Amdahl's Law is useful as a sanity check. Queueing analysis or discrete-event simulation is more appropriate for detailed sprint-throughput forecasting.

## 7.7 The data-driven scenario prohibits slowdowns

Shifting a distribution so its minimum is `1.0x` assumes that AI cannot slow work. This conflicts with METR and with common operational costs such as:

- Bad suggestions
- Prompting overhead
- Debugging generated code
- Review burden
- Security remediation
- Rework

The model must allow values below `1.0x`.

## 7.8 Coding fraction and AI effectiveness are treated as independent

In practice, they are related to task type:

- Simple greenfield work may combine a large coding fraction with high AI effectiveness.
- Complex brownfield work may combine more investigation and coordination with lower AI effectiveness and greater rework.

Independent sampling can generate unrealistic combinations. Model these inputs conditionally by task class.

## 7.9 Adoption and eligibility are missing

Not every developer will consistently use AI, and not every task may be eligible because of data classification, tool limitations, or technical risk. The model should not assume that the entire coding fraction receives the full AI speedup.

## 7.10 Quality gates do not prevent rework

Quality gates detect problems; they do not prevent AI-generated defects from occurring. More generated code may create:

- More review comments
- More test failures
- More security findings
- Greater maintenance burden

These costs must be represented explicitly.

## 7.11 The 5–15% conclusion is not statistically derived

If scenario centers are approximately 0%, 13%, and 25%, selecting 5–15% as “midway” is not a statistical decision rule. The model must explain:

- Scenario weights
- Relevant percentiles
- Why optimistic results are discounted
- Probability of exceeding 5%, 10%, and 15%
- Probability of a slowdown

---

# 8. Improved First-Order Equation

Retain the Amdahl structure but add adoption, eligibility, and overhead:

```text
S_total = 1 / {(1 - P) + P[(1 - a) + (a / S_task)] + r}
```

Where:

- `P` = fraction of baseline elapsed delivery time associated with coding work
- `a` = proportion of coding work eligible for AI and actually performed with AI
- `S_task` = speedup on the AI-assisted portion
- `r` = additional prompting, review, rework, or operational overhead as a fraction of baseline delivery time
- `S_total` = overall delivery speedup

## Improved worked example

Assume:

- `P = 0.35`
- `S_task = 1.4`
- `a = 0.70`
- `r = 0.02`

```text
S_total = 1 / {0.65 + 0.35[(1 - 0.70) + (0.70 / 1.4)] + 0.02}
S_total = 1 / {0.65 + 0.35[0.30 + 0.50] + 0.02}
S_total = 1 / 0.95
S_total = 1.053x
```

After accounting for partial applicability and overhead, the estimate becomes approximately **5.3% greater throughput**, rather than 11.1%.

This still assumes a primarily serial workflow. A more mature estimate should model review queues, testing capacity, parallel work, task mix, and release cadence.

---

# 9. Recommended Validation Approach

## Phase 1 — Establish a 6–8 Week Baseline

Measure:

- Time actively spent coding
- Time waiting for review
- Review effort
- Testing and integration time
- Security review and remediation
- Release delay
- Rework
- Escaped defects
- Rollbacks
- Completed accepted work

Use elapsed timestamps for cycle time and labor hours for cost. Do not combine them into one measure.

## Phase 2 — Stratify the Work

Classify every pilot item as:

- Simple greenfield
- Complex greenfield
- Simple brownfield
- Complex brownfield

Also record:

- Developer experience with the codebase
- Task type
- Security or data classification
- AI eligibility
- Model and tool used
- Amount of repository context available to the tool

## Phase 3 — Run an 8–12 Week Controlled Pilot

Use one of the following designs where practical:

- Matched work items
- Randomized crossover
- Stepped-wedge rollout
- Difference-in-differences comparison between pilot and control teams

Avoid comparing a highly motivated pilot team only against an unrelated historical average.

## Phase 4 — Measure Accepted Delivery

Primary measures should include:

| Category | Measure |
|---|---|
| Delivery | Lead time to accepted or released work |
| Throughput | Completed and accepted work items |
| Review | Review wait time and reviewer labor |
| Quality | Rework hours and escaped defects |
| Security | Findings attributable to AI-generated or AI-modified code |
| Reliability | Failed deployments and rollbacks |
| Adoption | AI usage rate and task eligibility |
| Effectiveness | Suggestion acceptance and retained-code rate |
| Cost | Cost per accepted work item |
| Knowledge | Code-understanding assessment for critical work |

Do not use lines of code, commits, or pull-request counts as the primary productivity outcome.

## Phase 5 — Preserve Engineering Understanding

For junior developers and critical components, require code-understanding checks. The Anthropic experiment shows that faster task completion can coexist with weaker mastery [3].

Possible controls include:

- Developer explanation of the change during review
- Tests written or reviewed independently of generated code
- Short design rationale
- Required identification of failure modes and security implications
- Reviewer confirmation that the developer understands the retained solution

## Phase 6 — Update the Forecast

After the pilot, report:

- P10, P50, and P90 outcomes
- Probability of exceeding 5%, 10%, and 15%
- Probability of a slowdown
- Results by task class
- Results by developer experience
- Review and rework effects
- Cost per accepted work item
- Quality and security effects

Replace the original planning inputs with observed program data.

---

# 10. Recommended Approval Gates

## Gate 1 — Pilot Approval

Approve a controlled pilot when:

- Baseline measures and task classifications are defined.
- Approved AI tools, repositories, and data boundaries are identified.
- Security and intellectual-property controls are in place.
- Pilot and control groups are comparable.
- Quality and knowledge-preservation checks are approved.
- Success and stop criteria are documented before the pilot begins.

## Gate 2 — Limited Operational Adoption

Proceed when the pilot demonstrates:

- Improved accepted-work throughput or cycle time
- No material increase in defects, security findings, or rollback rate
- No unacceptable decline in developer understanding
- Manageable review and rework burden
- Positive value after tooling and governance cost

## Gate 3 — Portfolio-Scale Decision

Expand only after determining:

- Which task classes benefit
- Which task classes slow down or create quality risk
- Whether review and testing capacity can absorb faster code production
- Whether the benefit survives beyond early adopter enthusiasm
- Whether enterprise licensing and operating costs are justified
- Whether results transfer to other teams and codebases

---

# 11. Leadership-Ready Conclusion

> AI coding assistance may improve software delivery, but task-level generation speed should not be confused with end-to-end delivery performance. External studies show both gains and slowdowns and use different populations, tasks, and outcome measures. The program will therefore treat a 5–15% delivery improvement as a planning hypothesis. A controlled pilot will measure accepted delivery, quality, rework, security, adoption, knowledge retention, and cost before any portfolio-scale commitment.

---

# References

1. Amdahl, G. M. (1967). **Validity of the Single Processor Approach to Achieving Large-Scale Computing Capabilities.** *AFIPS Conference Proceedings.* DOI: [https://doi.org/10.1145/1465482.1465560](https://doi.org/10.1145/1465482.1465560)

2. METR. (2026). **Uplift Update: Wider Adoption of AI Has Made It More Difficult to Measure Task-Level Productivity.** [https://metr.org/blog/2026-02-24-uplift-update/](https://metr.org/blog/2026-02-24-uplift-update/)

3. Anthropic. (2026). **AI Assistance and Coding Skills.** [https://www.anthropic.com/research/AI-assistance-coding-skills](https://www.anthropic.com/research/AI-assistance-coding-skills)

4. National Bureau of Economic Research. (2026). **Working Paper 35275.** [https://www.nber.org/papers/w35275](https://www.nber.org/papers/w35275)

5. Stanford Software Engineering Productivity. **AI Impact Research.** [https://softwareengineeringproductivity.stanford.edu/ai-impact](https://softwareengineeringproductivity.stanford.edu/ai-impact)

6. Cui, Z., Demirer, M., Jaffe, S., Musolff, L., Peng, S., & Salz, T. (2025). **The Effects of Generative AI on High-Skilled Work: Evidence from Three Field Experiments with Software Developers.** *Management Science.* DOI: [https://doi.org/10.1287/mnsc.2025.00535](https://doi.org/10.1287/mnsc.2025.00535)

---

## Evidence Limitations

- The cited studies do not evaluate this program's exact developers, repositories, review process, security constraints, or definition of accepted work.
- Some findings are preliminary, observational, self-selected, vendor-produced, or based on outcomes that are not directly comparable.
- AI performance varies by model, tool configuration, task, repository context, developer experience, and codebase maturity.
- The equations are decision-support models, not proof of future results.
- External research should establish initial assumptions; local evidence should determine the operational decision.

## Document Status

- **Purpose:** Program leadership decision support and pilot planning
- **Scope:** AI-assisted coding and end-to-end software delivery
- **Planning hypothesis:** 5–15% delivery improvement
- **Decision principle:** Measure accepted delivery, not code volume
- **Evidence current through:** November 2, 2026
