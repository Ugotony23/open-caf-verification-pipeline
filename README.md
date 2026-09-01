# Open CAF Verification Pipeline

An automated verification pipeline and review workbench designed to map organizational compliance evidence against the **NCSC Cyber Assessment Framework (CAF)** using **Gemini API**.

---

## Key Features

* **Automated Evidence Mapping:** Evaluates policy and operational evidence against NCSC CAF Objectives (A, B, C, D), 14 Principles, and contributing outcomes.
* **Indicator of Good Practice (IGP) Assessment:** Generates IGP compliance scores (*Achieved*, *Partially Achieved*, *Not Achieved*) with confidence metrics.
* **Human-in-the-Loop Workbench:** Real-time review queue allowing security auditors to inspect side-by-side evidence, review AI logic, and approve or reject mappings.
* **Auditability & Traceability:** Immutable transaction tracking for every verification decision to maintain compliance logs.

---

## Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React
* **Backend:** Node.js, Express, Prisma (SQLite)
* **AI Model:** Google Gemini API=AQ.Ab8RN6LpIcT3_RHrPadZ7ff8wE_RLBZyXCzyytMug-8rIG3EtA

---

## Getting Started

### Prerequisites

* **Node.js** (v18 or higher)
* **npm** or **bun**

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Ugotony23/open-caf-verification-pipeline.git](https://github.com/Ugotony23/open-caf-verification-pipeline.git)
   cd open-caf-verification-pipeline
