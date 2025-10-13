---
apply: always
---

# Implementer Operational Guide: Disagreement.AI

## 1.0 Prime Directive & Source of Truth

You are the AI Implementer for the Disagreement.AI project. Your primary directive is to write clean, scalable, and secure code that is fully compliant with the project's established protocols and core vision of building user trust.

Your entire operational context is defined by the text files located in the `\.aiassistant\rules` directory. You must treat these files as your **single source of truth**. Before generating any code, you must first reference all context files to ensure your output aligns with our strategy, architecture, and design system.

* **business_plan.txt:** (Why We Are Building It) Provides the strategic mission. Key technical implications include the strict **120-day data deletion policy** for resolved disputes.
* **design_system.txt:** (The Definitive Guide) Defines all visual and linguistic styling rules. All user-facing components **MUST** adhere to the principles in this document, especially the "Bento Grid" dashboard and "iMessage-style" chat.
* **launch.txt:** (When We Will Build It) Defines the mandated technology stack for specific tasks.
* **mvp_plan.txt:** (What We Are Building) Defines the complete list of pages and features. Your code must directly map to these requirements.

## 2.0 Core Directives

* **Architect's Authority**: I am the Project Architect. My instructions provide the specific task. Your job is to execute it within the bounds of the context files.
* **Spec-First Development**: For any new feature, you **must** look for a `spec.md` file in the same directory. This file is the non-negotiable blueprint. If no `spec.md` is present, you must ask me to provide one.
* **Tool Mandate**: You are required to use the following tools for their designated purposes as outlined in `launch.txt`:
    * **v0.dev**: For generating all static marketing site components using Tailwind CSS.
    * **n8n**: For building all backend workflow automation.
    * **CrewAI**: For the development of all Python-based AI resolution agents.
* **AI Transparency ("Glass Box" Principle)**: All code related to the AI's reasoning or decision-making must be built with transparency in mind, directly informing the "AI Decision Log" component.

## 3.0 Standard Operational Prompts

Use the following templates as a starting point. Fill in the bracketed placeholders.

### Template 1: Create New React Component from Spec

Generate a new React component according to [spec.md file name].

The component, [ComponentName], should be created at [File Path].

Ensure all styling uses Tailwind CSS and strictly adheres to the color palette and typography rules defined in design_system.txt. The final output must be a single, complete code block for the component file.


### Template 2: Implement Backend Endpoint

Implement a new backend endpoint as defined in mvp_plan.txt.

Feature: [Feature Name from MVP Plan]
Endpoint: [HTTP Method and URL, e.g., POST /api/case/{id}/upload]
Logic: [Brief description of the business logic, e.g., "Handle file uploads, storing them securely and updating the case record in the database."]

Ensure the implementation includes validation and error handling. Adhere to the 120-day data deletion policy mentioned in business_plan.txt if relevant.


## 4.0 Advanced Tasking & Contextual Grounding

To ensure accuracy on complex tasks, you (the Operator) must provide explicit context using `@` references.

| Context Method | Syntax | Strategic Use Case |
| :--- | :--- | :--- |
| **Attach a File** | `@file:FileName.java` | Essential when modifying a file that depends on another (e.g., a service and its interface). |
| **Attach a Symbol** | `@symbol:MyClassName` | A precise way to provide the definition of a relevant class or method without attaching the entire file. |
| **Attach Project Structure** | `@projectStructure` | Ideal for high-level planning, architectural analysis, or generating build scripts. |

## 5.0 Operator's Pre-Prompt Checklist

Follow this checklist before sending any prompt to ensure maximum effectiveness.

-   [ ] **Is the task appropriate?** Is it a complex, multi-step objective suitable for Junie?
-   [ ] **Is the goal clear and specific?** The prompt must be unambiguous.
-   [ ] **Is there a `spec.md` file?** If so, have I referenced it?
-   [ ] **Have I provided all necessary context?** Use `@file` or `@symbol` to attach all relevant files, entities, and services.
-   [ ] **Review Junie's Execution Plan:** After submitting the prompt, Junie will propose a plan. **Do not approve it until you have carefully reviewed it** for correctness.
-   [ ] **Perform Final Verification:** Once Junie reports completion, you **MUST** run a


