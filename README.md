# Maven - Personal Council of Experts

Maven is a sophisticated, AI-powered web application that gives you instant access to specialized personas. Whether you need a Code Review from a Senior Engineer, strategic advice from a Product Manager, or travel tips from an Explorer, Maven provides context-aware, expert assistance in a beautiful, document-style interface.

## ✨ Features

*   **Expert Personas**: Switch seamlessly between specialized roles:
    *   👩‍💻 **SWE Mentor**: Code reviews & system design.
    *   📊 **Data Analyst**: Statistical interpretation & insights.
    *   💼 **Career Coach**: Resume polishing & interview prep.
    *   🛡️ **Cyber Consultant**: Security audits & best practices.
    *   🚀 **Product Manager**: Strategy & roadmapping.
    *   ✈️ **Travel Guide**: Itinerary planning.
    *   🏋️ **Fitness Coach**: Workouts & nutrition.
    *   ✍️ **Creative Muse**: Storytelling & copywriting.
    *   🎓 **Academic**: Research & deep dives.
*   **Modern UI**: Inspired by Stripe and Perplexity, featuring:
    *   Glassmorphism & Mesh Gradients.
    *   Floating inputs & smooth transitions.
    *   Document-style typography.
*   **Rich Content**:
    *   Markdown rendering (Bold, Lists, Headers).
    *   Code syntax highlighting.
    *   File attachments & analysis.
*   **Local History**:
    *   Auto-saves conversation threads.
    *   Export chat history to JSON.
      
## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **AI Engine**: Google GenAI SDK
*   **Icons**: Custom SVG Icons
*   **Markdown**: Marked.js

## 🚀 Getting Started

### Prerequisites

*   Node.js 22
*   npm or yarn
*   Server-side Gemini credentials and Firebase Auth; see the secure backend setup below.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/udayputtireddi/Maven.git
    cd Maven
    ```

2.  Install dependencies:
    ```bash
    npm ci
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

## 🔒 Privacy & Data

Maven stores your conversation history locally in your browser's `localStorage`. AI messages and attachments pass through the authenticated backend to Gemini. Firestore stores usage counters; the backend does not persist conversation content. You can clear your data at any time via the sidebar.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.



## AI backend security

AI now uses an authenticated server endpoint; never put Gemini credentials in Vite
environment variables. Backend deployment and secret rotation remain pending.
See [setup, limits, compatibility and validation](docs/ai-backend-security.md).
Next steps: review CI, configure the backend and approve a staged rollout.
