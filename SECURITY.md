# SiteSync Security Architecture & Threat Model

## 1. Multi-Tenant Project Isolation
Every database query, in-memory filter, citation lookup, and conversation message enforces `projectId` boundaries.
- Attempts to query across tenant boundaries are rejected with `Unauthorized project scope`.
- All citations verify that the underlying entity belongs to the active project.

## 2. Strict Read-Only Copilot Policy
The Copilot conversational interface is strictly read-only.
- Destructive/mutative verbs (`approve`, `delete`, `change date`, `mark complete`, `drop`) are rejected before LLM inference.
- Authoritative mutations are exclusively performed via explicit planner actions in the Review Queue workstation.

## 3. Prompt Injection Defense
Field progress reports (DPRs) submitted by external contractors are treated as untrusted data.
- System prompt instructions are immutable and isolated from retrieved context.
- Retrieved documents are quarantined inside data blocks and cannot alter agent instructions.

## 4. Cryptographic Audit Trail
All planner review actions emit tamper-evident audit logs with `userId`, `action`, `beforeState`, `afterState`, and `timestamp`.
