const resume = `
ANKUR BAG
Full Stack Developer | GenAI Engineer
Kolkata, West Bengal, India
ankurbag.tech | github.com/ankurbag | linkedin.com/in/ankurbag

SUMMARY
Motivated and detail-oriented Full Stack Developer with hands-on experience in building intelligent web applications powered by Generative AI and RAG systems. Passionate about bridging the gap between intuitive frontend design and AI-backed backend intelligence. Winner of Double Slash 4.0 (36-hour hackathon, IEEE Jadavpur University).

EDUCATION
B.Tech in Information Technology
RCC Institute of Information Technology, Kolkata
2022 – 2026 | CGPA: 8.4 / 10

TECHNICAL SKILLS
- Frontend: React.js, Next.js 14, Tailwind CSS, Shadcn UI, Framer Motion
- Backend: Node.js, Express.js, REST APIs
- AI/ML: LangChain, OpenAI API, Anthropic Claude API, Pinecone, FAISS, RAG Pipelines
- Databases: MongoDB, PostgreSQL, Upstash Redis
- DevOps & Tools: Git, GitHub, Vercel, Docker (basic), Postman
- Languages: JavaScript (ES6+), TypeScript, Python

EXPERIENCE
Full Stack GenAI Intern — Stealth AI Startup (Remote)
June 2024 – September 2024
- Built a document Q&A system using LangChain + Pinecone with chunking and semantic retrieval achieving ~88% answer relevancy score.
- Designed and deployed a Next.js frontend with streaming Claude API responses and markdown rendering.
- Reduced average API latency by 30% by implementing response caching with Upstash Redis.

Freelance Web Developer
January 2024 – Present
- Delivered 4 client projects including a portfolio site, a SaaS landing page, and an e-commerce storefront.
- Integrated payment gateways and third-party APIs for 2 clients.

PROJECTS
InterviewIQ — AI Interview Preparation Platform
- Full-stack app using Next.js + Node.js + MongoDB that generates personalized technical/behavioral questions, identifies skill gaps, and creates a day-by-day prep plan using the Claude API.
- Features resume parsing, JD analysis, and match scoring.

ankurbag.tech — Personal Portfolio
- Built with Next.js 14, deployed on Vercel with custom domain via GitHub Student Pack.
- Integrated Upstash Redis for real-time visitor view counter.

ACHIEVEMENTS
- Winner, Double Slash 4.0 Hackathon — IEEE Jadavpur University Student Branch (2024)
- GitHub Student Developer Pack recipient
- Top 5% contributor in college-level open source sprint

LANGUAGES
English (Professional), Bengali (Native), Hindi (Conversational)
`;



const selfDescription = `
I am a final-year IT student at RCCIIT, Kolkata, deeply invested in the intersection of frontend engineering and Generative AI. Over the past two years, I have moved beyond academic projects to build and ship real-world applications — from AI-powered interview prep tools to production-grade portfolio sites with live data integrations.

My core strength lies in taking a product from zero to deployment. I understand the full lifecycle: designing intuitive user interfaces, wiring up robust backends, and layering in AI capabilities that genuinely enhance the user experience rather than just acting as a gimmick. I am particularly experienced with RAG (Retrieval-Augmented Generation) systems, where I have worked with vector databases like Pinecone and FAISS, chunking strategies, and embedding pipelines to build accurate, context-aware AI features.

I won the Double Slash 4.0 hackathon — a 36-hour competition organized by IEEE Jadavpur University — where my team built a working AI product under tight constraints. That experience sharpened my ability to prioritize ruthlessly, communicate clearly under pressure, and ship functional software fast.

I am someone who takes design seriously. I believe the frontend is not just a skin over backend logic — it is the product. I obsess over typography, spacing, motion, and interaction quality. At the same time, I am not purely a UI person; I am comfortable diving deep into backend architecture, API design, and infrastructure when the project demands it.

I am looking for an environment where I can grow fast, work on ambiguous hard problems, and collaborate with people who hold themselves to a high bar. I am most energized by early-stage or growth-stage teams where my contributions have visible, measurable impact. I value honest feedback, ownership, and a culture where shipping matters.

Outside of work, I write about what I build, document my learning publicly, and occasionally contribute to open-source projects. I am driven by curiosity — I tend to go deep on topics that interest me rather than skimming the surface.
`;


const jobDescription = `
I am looking for a role as a Frontend-Heavy Full Stack Engineer or an AI Application Developer, ideally at an early-stage startup or a product-led company working on developer tools, SaaS products, or AI-native applications.

The role I envision involves owning features end-to-end — from scoping and design to implementation and deployment. I want to work on products that have real users, where my decisions on architecture, UX, and AI integration directly affect retention and engagement metrics. I am not interested in purely maintenance-mode roles or environments where engineers are just ticket-closers.

On the technical side, I want to work extensively with modern frontend stacks (Next.js, React, Tailwind), Node.js or Python backends, and LLM integrations (OpenAI, Anthropic, open-source models). Bonus if the team is building RAG systems, AI agents, or developer-facing tooling — these are areas where I already have hands-on depth and want to go further.

I value: a high-trust environment where engineers have autonomy, async-first communication with clear documentation, regular code reviews that push code quality up, and a team that genuinely cares about product craft. Flat hierarchies or small eng teams (3–15 engineers) are ideal.

Compensation-wise, I am looking for a competitive package for a fresher or early-career role — whether that is a stipend-based internship converting to full-time, a full-time junior role, or a contract engagement on a meaningful project. Equity or performance bonuses are a strong plus in startup contexts.

Location preference is remote-first or Kolkata-based, though I am open to relocating for the right opportunity. I am available immediately and can commit full-time.

In terms of growth, I want to move toward a Senior Full Stack / AI Engineer trajectory within 2–3 years, and eventually into a technical lead or founding engineer capacity. I am looking for a team that will challenge me, give me real responsibility early, and invest in my growth — not just in terms of skills, but in terms of product thinking and engineering maturity.
`;


module.exports = {
    resume , selfDescription , jobDescription
}