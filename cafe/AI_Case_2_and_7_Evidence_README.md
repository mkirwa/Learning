# Evidence and Pilot Plan for AI Use Cases 2 and 7

## Purpose

This README provides an evidence-based business-case foundation for two proposed AI use cases:

- **Case 2 — Governed wiki knowledge chatbot:** A chatbot that retrieves information and approved images from fixed, authorized web or wiki pages and returns cited answers.
- **Case 7 — Systems Engineering document assistant:** An AI assistant that helps engineers draft and maintain CONOPS, system descriptions, requirements-related documents, interface descriptions, change-impact analyses, and traceability information.

The estimates in this document are intended for **pilot planning and program-approval decisions**. They are not guaranteed productivity results. Each estimate must be validated using program-specific users, documents, security constraints, and workflows.

---

## Executive Summary

| Use case | Evidence-based conclusion | Recommended planning hypothesis | Required boundary |
|---|---|---|---|
| Case 2: Wiki chatbot | Conversational retrieval can reduce information-seeking time, particularly for summarization and multi-source questions. It can also increase the risk that users accept an incorrect answer. | **25–50% reduction in median time-to-correct-answer**, with a pilot threshold of at least 30%. | The wiki remains authoritative; the chatbot must use approved retrieval, citations, access controls, and escalation. |
| Case 7: SE assistant | AI can substantially accelerate information retrieval and initial drafting, but evidence for improvement across the entire approved-document lifecycle is limited. | **15–25% reduction in median time-to-approved-document** while maintaining quality and traceability. | AI proposes drafts and redlines; engineers retain technical, approval, and configuration-management authority. |

The two most important distinctions are:

1. **Case 2 is not a migration of the wiki into the model.** It is a governed conversational access layer over the authoritative wiki.
2. **Case 7 first-draft speed is not the same as approved-document speed.** Review, correction, engineering judgment, and configuration control remain part of the lifecycle.

---

# Case 2 — Governed Wiki Knowledge Chatbot

## 1. Problem or Opportunity

Users may need to search multiple pages, read long semi-technical documents, follow links, interpret images, and determine whether information is current. Support personnel may repeatedly answer questions that are already addressed in approved content.

This creates several potential costs:

- Time spent locating the correct page or section
- Time spent reading material that is not relevant to the immediate question
- Inconsistent interpretation of policy or technical instructions
- Repeated support requests
- Difficulty retrieving the correct approved image, form, or diagram
- Limited access to assistance outside normal support hours

## 2. Proposed Solution

Add a **governed conversational retrieval layer** over the existing wiki or approved web pages.

The chatbot should:

1. Authenticate the user.
2. Apply user and content access policies.
3. Search only allowlisted pages and repositories.
4. Retrieve relevant text, tables, metadata, and approved images.
5. Generate a concise answer grounded in the retrieved content.
6. Cite the page, section, document version, and retrieval date.
7. State when the evidence is insufficient or conflicting.
8. Escalate policy-sensitive, ambiguous, or out-of-scope questions.
9. Write an audit record without unnecessarily retaining sensitive prompt content.

The source pages remain the **system of record**. The model is not the authoritative repository.

## 3. Evidence

### 3.1 Reading-rate reference class

Brysbaert's meta-analysis of 190 studies and 18,573 participants estimated average English silent reading speed at:

- **238 words per minute for non-fiction**
- A typical adult non-fiction range of approximately **175–300 words per minute** [1]

Approximate reading time is therefore:

| Page length | At 238 WPM | At 175–300 WPM |
|---:|---:|---:|
| 800 words | 3.4 minutes | 2.7–4.6 minutes |
| 1,200 words | 5.0 minutes | 4.0–6.9 minutes |
| 2,000 words | 8.4 minutes | 6.7–11.4 minutes |

These values represent **reading only**. They exclude navigation, searching within a page, following links, comparing pages, interpreting diagrams, and verifying that the information is current.

### 3.2 LLM search versus traditional search

A randomized CHI 2025 study found that participants using LLM-based search completed decision tasks faster, used fewer but more complex queries, and reported greater satisfaction. Estimated average task durations were **3.4 minutes with traditional search and 1.6 minutes with LLM-based search**, approximately a 50% reduction. When the LLM was correct, decision accuracy was comparable; when it was wrong, users tended to over-rely on the incorrect answer. A visual uncertainty intervention helped users detect errors [2].

A Microsoft study of information retrieval across files, email, and calendars reported that Copilot users finished in **17 minutes 54 seconds**, compared with **24 minutes 18 seconds** without Copilot—approximately **27% faster**—with no statistically significant accuracy change [3]. This study was company-sponsored and involved broader information retrieval rather than a single wiki page, so it should be treated as supporting rather than definitive evidence.

A mixed-method study of IT self-service found higher satisfaction with a chatbot than with a traditional search tool operating over the same large IT knowledge base. Transcript analysis found that **57% of questions were answered in one or two turns**, 22% were quickly abandoned, and 21% required longer multi-turn interaction [4]. This supports keeping search available and designing for clarification and escalation.

## 4. Time-on-Task Model

### Existing wiki process

```text
T_wiki = T_find + (W_page / R_reader) + T_verify
```

### Chatbot process

```text
T_chat = T_prompt + T_response + (W_answer / R_reader) + T_citation_verify + T_escalation
```

Where:

- `W_page` = number of words in the wiki content a user must read
- `W_answer` = number of words in the chatbot answer
- `R_reader` = reader's effective reading speed
- `T_find` = time to locate the correct page and section
- `T_verify` = time to determine whether the wiki information is applicable and current
- `T_citation_verify` = time to inspect the chatbot's cited evidence
- `T_escalation` = expected time associated with unanswered or escalated questions

### Illustrative example

Assume:

- Wiki page: 1,200 words
- Chatbot answer: 160 words
- Reading rate: 238 words per minute
- Wiki navigation: 1.0 minute
- Wiki verification: 0.5 minute
- Chatbot prompt and response: 0.42 minute
- Citation verification: 0.75 minute

Then:

```text
T_wiki = 1.0 + (1,200 / 238) + 0.5 = 6.54 minutes
T_chat = 0.42 + (160 / 238) + 0.75 = 1.84 minutes
Speedup = 6.54 / 1.84 = 3.55x
Time reduction = 1 - (1.84 / 6.54) = 71.9%
```

Only the reading rate in this example comes from the external reference class. The page length, answer length, navigation time, response time, and verification time are **illustrative assumptions**. They must be replaced with local pilot measurements. For program planning, a **25–50% reduction** is more defensible than assuming a 72% reduction.

## 5. Expected Mission and Business Value

- Faster access to approved information
- Reduced time spent reading irrelevant sections
- Better access to approved diagrams, images, and forms
- More consistent answers with visible source provenance
- Reduced repetitive support volume
- Greater availability outside normal support hours
- Search across multiple approved pages through a single interaction
- Structured collection of user information before escalation

## 6. Pilot Design

Create a benchmark of **100–200 representative questions** and classify them before testing:

| Question class | Example | Expected result |
|---|---|---|
| Exact lookup | “Where is Form X?” | Search may already be as fast or faster. |
| Page summarization | “What are the major steps in this procedure?” | Strong chatbot candidate. |
| Multi-page synthesis | “How do these three policies apply together?” | Strong chatbot candidate if sources do not conflict. |
| Image or diagram retrieval | “Show the approved connection diagram.” | Strong candidate if image metadata is maintained. |
| Structured intake | “Which request type applies to my situation?” | Useful when rules and escalation paths are explicit. |
| Policy-sensitive or unsupported | “Can I receive an exception?” | Must escalate to an authorized human. |

Use a randomized crossover design:

1. Participants answer questions using the current wiki/search process.
2. Participants answer comparable questions using the chatbot.
3. Independent subject-matter experts score the answers without knowing which method produced them.
4. Compare time, correctness, verification effort, and user confidence.

### Recommended pilot measures

| Measure | Definition | Recommended gate |
|---|---|---|
| Time to correct answer | Time from question presentation to a correct, verified answer | Median reduction of at least 30% |
| Answer correctness | Percentage of answers judged correct by an SME | No worse than current method |
| Grounded answer rate | Answers whose material claims are supported by approved sources | At least 90% before broader release |
| Citation correctness | Citations that actually support the associated claim | At least 95% |
| Image retrieval correctness | Correct approved image returned for the task | Threshold set by operational criticality |
| Abandonment | User ends interaction without an answer or escalation | No worse than current method |
| Appropriate escalation | Unsupported or sensitive questions correctly routed | At least 95% |
| Unauthorized disclosure or action | Successful access or action outside authorization | Zero high-severity events |
| User verification time | Time spent validating the answer and citations | Track separately from generation time |

## 7. Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Hallucinated answer | A polished response may appear authoritative even when unsupported. | Retrieval grounding, citations, claim-level validation, confidence indicators, and escalation. |
| Overreliance | Research shows that users may accept incorrect LLM output. | Require source inspection for sensitive decisions; train users; display uncertainty and conflicting evidence. |
| Stale content | The chatbot can faithfully reproduce an obsolete page. | Show version and retrieval date; synchronize indexes; remove superseded content; assign content owners. |
| Access-control leakage | Indexing can accidentally separate content from its permissions. | Enforce authorization during retrieval, not only at the user interface. |
| Search is faster for simple facts | Chat adds overhead for known, exact queries. | Retain conventional search and route exact lookups appropriately. |
| Incorrect image retrieval | A visually similar but wrong diagram may create operational risk. | Retrieve only approved images; preserve image IDs, captions, versions, and source links. |
| Unsupported benefit claim | Reading-time estimates do not prove ticket reduction or mission improvement. | Measure time-to-correct-answer and support deflection separately. |

## 8. Case 2 Approval Statement

> Evidence indicates that conversational retrieval can reduce information-seeking time, particularly for summarization and multi-source questions. The program will use a 25–50% planning range and require a pilot-demonstrated reduction of at least 30% in median time-to-correct-answer, with no reduction in accuracy, access control, or source traceability.

---

# Case 7 — Systems Engineering Document Assistant

## 1. Problem or Opportunity

CONOPS, system descriptions, interface documents, requirements artifacts, verification documents, and trace matrices can become stale as requirements, risks, software, and designs change. Engineers spend significant time:

- Locating authoritative evidence
- Recreating standard document structure
- Drafting and revising routine sections
- Comparing versions
- Checking terminology and references
- Identifying affected documents after a change
- Maintaining requirement, design, and verification traceability

## 2. Proposed Solution

Deploy a retrieval-grounded Systems Engineering assistant that can:

- Draft content using approved templates
- Retrieve evidence from authorized baselines
- Produce redlines rather than silently changing approved content
- Identify potentially stale or inconsistent sections
- Suggest requirement-to-design and requirement-to-test trace links
- Check document structure and required metadata
- Summarize change impact
- Produce a review package with citations and an audit record

The assistant may **propose** content. It may not approve engineering decisions, invent missing performance values, or change an authoritative baseline.

## 3. Evidence in Favor

An IEEE study evaluated GPT-4 and CodeLlama for generating and reviewing Software Requirements Specifications. The authors found that the models could produce structured drafts comparable to an entry-level engineer for the evaluated academic use case and could significantly reduce generation time [5]. This is evidence for first-draft assistance, not autonomous engineering approval.

A 2024 MBSE experiment divided systems engineers among normal workflow, open LLM assistance, and AI-provided draft material. Subject-matter experts evaluated completeness, consistency, correctness, simplicity, and traceability. The authors concluded that LLMs were not replacements for trained systems engineers, but could generate a significant portion of a minimum viable model in a fraction of the time and reduce external research effort [6].

The Carnegie Mellon Software Engineering Institute conducted an AI-augmented SysML v2 experiment extending from CONOPS to generated code. Generated components interoperated and automated tests passed, with traceability to requirements and verification cases. The experiment also found that a well-formed model could still be incomplete, behavior could be partially implemented, and the AI could invent values where requirements left numbers unstated [7].

## 4. Evidence Requiring Caution

A systematic review of **238 publications from 2019–2025** found that GenAI requirements-engineering research was concentrated in analysis and elicitation, while requirements management was underexplored. Reported challenges included:

- Reproducibility: 66.8%
- Hallucinations: 63.4%
- Interpretability: 57.1%
- More than 90% of studies at an early stage
- Only 1.3% reaching production-level integration [8]

A mixed-method Systems Engineering study compared LLM-produced capability-description content with a human-expert benchmark. Quantitative similarity methods could sometimes make the artifacts appear comparable, while expert qualitative review identified serious failure modes:

- Premature conversion of concepts into requirements
- Unsupported numerical estimates
- Overspecification [9]

This finding is especially important for defense and other mission-critical engineering: polished language and high text similarity do not demonstrate technical correctness.

## 5. Lifecycle Benefit Model

The correct business metric is not only “time to first draft.” It is **time from authorized tasking to an approved, configuration-controlled artifact**.

Use an Amdahl-style model:

```text
S_total = 1 / [(1 - P) + (P / S_AI) + R_AI]
```

Where:

- `P` = fraction of the approved-document lifecycle that AI can accelerate
- `S_AI` = speedup for those AI-assisted activities
- `R_AI` = additional verification and rework as a fraction of the original cycle
- `S_total` = total approved-document lifecycle speedup

### Illustrative example

Assume:

- AI can accelerate 45% of the lifecycle: evidence retrieval, drafting, and cross-reference checking.
- Those activities become 3 times faster.
- AI verification and correction add 5% of the original lifecycle.

```text
S_total = 1 / [(1 - 0.45) + (0.45 / 3) + 0.05]
S_total = 1 / [0.55 + 0.15 + 0.05]
S_total = 1.33x
Time reduction = 1 - (1 / 1.33) = approximately 25%
```

The example shows why a large drafting speedup can translate into a much smaller end-to-end improvement. The values are planning assumptions and must be replaced with actual program data.

## 6. Recommended Operating Boundaries

### Appropriate initial uses

- Evidence retrieval and summarization
- Template-based first drafts
- Proposed redlines
- Terminology and acronym consistency checks
- Required-section and metadata checks
- Candidate trace-link suggestions
- Change-impact candidate identification
- Stale-section detection
- Editorial cleanup

### Uses that remain under human authority

- Requirements approval
- Architecture and trade decisions
- Safety and mission-assurance conclusions
- Threshold and objective values
- Cost, schedule, performance, and reliability assumptions
- Verification sufficiency determinations
- Interface commitments
- Risk acceptance
- Configuration-control and baseline approval

## 7. Deterministic Checks Versus AI Judgment

A **deterministic check** follows an explicit rule and should produce the same result from the same input. Examples include:

- Every requirement has a unique ID.
- Every required document section is present.
- Every interface entry includes units.
- Every cited requirement ID exists in the approved baseline.
- Every acronym is defined on first use.
- Every changed requirement is linked to at least one verification method.

An AI judgment evaluates meaning or context and may vary between runs. Examples include:

- Whether a CONOPS scenario is operationally complete
- Whether a requirement is sufficiently unambiguous
- Whether a design rationale is convincing
- Whether two statements are semantically inconsistent

Use deterministic tools whenever an explicit rule is available. Use AI for suggestions and semantic analysis, then require human review for consequential decisions.

## 8. Pilot Design

Select **8–12 representative artifacts or tasks**, such as:

- New CONOPS section
- CONOPS revision
- System-description update
- Interface-description update
- Requirement change-impact analysis
- Verification cross-reference update
- Stale-section detection task
- Requirement-to-test traceability task

Compare AI-assisted work with historical baselines or matched human-only work. Independent reviewers should score the artifacts without knowing which workflow produced them when practicable.

### Recommended pilot measures

| Measure | Purpose | Recommended interpretation |
|---|---|---|
| Time to first draft | Measures generation benefit | Report separately; do not present as total lifecycle benefit. |
| Time to approved draft | Measures actual program benefit | Target 15–25% reduction. |
| SME review hours | Identifies whether effort merely shifts to reviewers | Should decrease or remain stable. |
| Major and minor defects | Prevents speed from masking quality loss | No increase in severity-weighted defects. |
| Unsupported facts or values | Detects invented engineering content | Zero accepted unsupported values. |
| Trace-link precision | Correct suggested links divided by all suggested links | Establish per artifact and criticality. |
| Trace-link recall | Correct links found divided by all required links | Establish per artifact and criticality. |
| Rework hours | Captures downstream correction cost | No increase; preferably reduced. |
| Required-section compliance | Validates deterministic document structure | 100% for mandatory sections. |
| Unauthorized baseline changes | Protects configuration management | Zero. |

## 9. Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Unsupported engineering values | Plausible numbers can be technically or operationally dangerous. | Require “not specified” behavior; block uncited quantitative claims; require SME approval. |
| Premature requirements | The model may turn concepts or goals into unjustified “shall” statements. | Separate lifecycle artifact types; use artifact-specific prompts, schemas, and review criteria. |
| Overspecification | AI may constrain the solution without trade evidence. | Flag design commitments and verify them against approved decisions. |
| Polished but incorrect text | Readability and semantic similarity can conceal defects. | Use domain review, source citations, deterministic checks, and scenario-based validation. |
| Stochastic output | The same prompt may produce different answers. | Version the model, prompt, template, retrieval corpus, parameters, and output; evaluate repeated runs. |
| Increased review burden | Fast generation may create more material than engineers can validate. | Limit scope, require evidence, measure review hours, and optimize for reviewability rather than volume. |
| Knowledge erosion | Engineers may accept content without understanding it. | Require document owners to explain and approve substantive decisions. |
| Sensitive data exposure | Engineering artifacts may contain controlled information. | Use approved deployment boundaries, encryption, least privilege, logging, and data-retention controls. |
| Baseline corruption | Automated edits could bypass configuration control. | Read-only access during the pilot; produce redlines; require normal configuration-management approval. |

## 10. Case 7 Approval Statement

> Research indicates that generative AI can substantially accelerate first-draft creation, but evidence for full Systems Engineering lifecycle improvement remains limited. The program will use a conservative 15–25% planning range for time-to-approved-document and retain human engineering, review, approval, and configuration-management authority.

---

# Recommended Decision Gates

## Gate 1 — Limited Pilot Approval

Approve a controlled pilot if:

- Data sources and classifications are identified.
- Content and document owners are assigned.
- Access control is enforced during retrieval.
- The model cannot write to authoritative baselines.
- Evaluation questions and acceptance criteria are approved before testing.
- Audit, incident-response, and shutdown procedures are defined.

## Gate 2 — Operational Trial

Proceed only if:

- Case 2 demonstrates faster time-to-correct-answer without reduced accuracy.
- Case 7 demonstrates faster time-to-approved-document without increased defects or review burden.
- High-severity unauthorized disclosures or actions remain zero.
- Citation, traceability, accessibility, privacy, and security requirements are met.

## Gate 3 — Portfolio-Scale Decision

A portfolio-scale decision determines whether the capability should:

- Remain a limited pilot
- Expand to additional teams or content collections
- Become a shared enterprise service
- Be redesigned and retested
- Be discontinued because benefits do not justify cost and risk

This decision should use measured value, risk, operating cost, support burden, model portability, reuse across programs, and governance maturity—not only user enthusiasm or demonstration quality.

---

# References

1. Brysbaert, M. (2019). **How many words do we read per minute? A review and meta-analysis of reading rate.** *Journal of Memory and Language, 109*, 104047. DOI: [https://doi.org/10.1016/j.jml.2019.104047](https://doi.org/10.1016/j.jml.2019.104047)

2. Spatharioti, S. E., Rothschild, D., Goldstein, D. G., & Hofman, J. (2025). **Effects of LLM-based Search on Decision Making: Speed, Accuracy, and Overreliance.** *Proceedings of the 2025 CHI Conference on Human Factors in Computing Systems.* DOI: [https://doi.org/10.1145/3706598.3714082](https://doi.org/10.1145/3706598.3714082)

3. Microsoft WorkLab. (2023). **What Can Copilot's Earliest Users Teach Us About AI at Work?** [https://www.microsoft.com/en-us/worklab/work-trend-index/copilots-earliest-users-teach-us-about-generative-ai-at-work](https://www.microsoft.com/en-us/worklab/work-trend-index/copilots-earliest-users-teach-us-about-generative-ai-at-work)

4. Kim, A., Sachdeva, A., & Dennis, A. R. (2025). **From self-service to AI-assisted service: A mixed-method study of IT support service provision using search tools and chatbots.** *International Journal of Information Management.* DOI: [https://doi.org/10.1016/j.ijinfomgt.2025.102938](https://doi.org/10.1016/j.ijinfomgt.2025.102938)

5. Krishna, M., Gaur, B., Verma, A., & Jalote, P. (2024). **Using LLMs in Software Requirements Specifications: An Empirical Evaluation.** *2024 IEEE 32nd International Requirements Engineering Conference.* DOI: [https://doi.org/10.1109/RE59067.2024.00056](https://doi.org/10.1109/RE59067.2024.00056). Open preprint: [https://arxiv.org/abs/2404.17842](https://arxiv.org/abs/2404.17842)

6. Crabb, E. S., & Jones, M. T. (2024). **Accelerating Model-Based Systems Engineering by Harnessing Generative AI.** *2024 19th Annual System of Systems Engineering Conference.* DOI: [https://doi.org/10.1109/SOSE62659.2024.10620975](https://doi.org/10.1109/SOSE62659.2024.10620975)

7. Dempsey, C. (2026). **From ConOps to Running Code: An MBSE-in-Practice Experiment using AI-Augmented SysML v2 Modeling.** Carnegie Mellon University Software Engineering Institute. [https://sei.cmu.edu/library/from-conops-to-running-code-an-mbse-in-practice-experiment-using-ai-augmented-sysml-v2-modeling/](https://sei.cmu.edu/library/from-conops-to-running-code-an-mbse-in-practice-experiment-using-ai-augmented-sysml-v2-modeling/)

8. Cheng, H., Husen, J. H., Lu, Y., Racharak, T., Yoshioka, N., Ubayashi, N., & Washizaki, H. (2026). **Generative AI for Requirements Engineering: A Systematic Literature Review.** *Software: Practice and Experience.* DOI: [https://doi.org/10.1002/spe.70029](https://doi.org/10.1002/spe.70029)

9. Topcu, T. G., et al. (2025). **Trust at Your Own Peril: A Mixed Methods Exploration of the Ability of Large Language Models to Generate Expert-Like Systems Engineering Artifacts and a Characterization of Failure Modes.** *Systems Engineering.* DOI: [https://doi.org/10.1002/sys.21810](https://doi.org/10.1002/sys.21810)

---

## Evidence Limitations

- The studies do not evaluate this program's exact users, wiki, security constraints, engineering domain, or approval process.
- Several positive studies measure first drafts, laboratory tasks, or prototype workflows rather than deployed mission outcomes.
- Vendor-sponsored evidence may not generalize to all models or environments.
- Research results can change with the model, prompt, retrieval configuration, corpus quality, task type, and reviewer expertise.
- Therefore, external studies should establish a plausible range—not substitute for a controlled local pilot.

## Document Status

- **Purpose:** Program leadership approval support and pilot planning
- **Scope:** AI Use Cases 2 and 7
- **Evidence current through:** November 2, 2026
- **Recommended review owners:** Systems Engineering, Software Engineering, Cybersecurity, Privacy, Accessibility, Configuration Management, Legal/Contracts, and Mission/Product Ownership
