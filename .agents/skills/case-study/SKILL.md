---
name: case-study
description: Write a portfolio case study and publish it as a project entry. Use when the user wants to document a project they worked on as a case study for their portfolio at mattgalvin.dev.
---

# Portfolio Case Study Skill

Write a polished, narrative case study for a portfolio project and publish it to the site via the API.

## What Makes a Good Case Study

A case study for this portfolio should feel like a well-crafted piece of writing — not a resume bullet. The goal is to show how Matt thinks and works, not just what was shipped.

**Voice:** First-person, direct, thoughtful. Not corporate. Not self-congratulatory.

**Structure:** Problem → Context → Approach → What happened → What was learned

**Length:** 600–1000 words in the body. Dense enough to be substantive, tight enough to respect the reader.

**Avoid:**
- Jargon without explanation
- Vague claims ("improved performance", "drove results") without specifics
- Passive voice
- Lists disguised as prose

## Site Context

- Stack: Astro + Cloudflare Pages, content stored in D1 database
- Projects live at `/work/[slug]`
- Body is rendered as markdown (supports headings, bold, italic, blockquotes, code)
- Tags are displayed as chips on the card and detail page
- Hero image is optional but recommended — can be left blank if none available

## Workflow

Make a todo list and work through each step.

### 1. Gather Project Details

If not already provided, ask the user for:
- Project name
- The problem being solved (and why it mattered)
- Matt's role and what he actually did
- Key decisions made and why
- What worked, what didn't, what was learned
- Outcome / measurable results if any
- Relevant technologies or methods used
- Approximate date (month + year)
- Whether to mark as featured

### 2. Draft the Case Study Body

Write the body in markdown. Use this structure as a guide — adapt it to the story:

```markdown
## The Problem

[1–2 paragraphs. What was broken, missing, or unclear? Why did it matter?
Ground it in a real situation, not an abstract challenge.]

## The Approach

[2–3 paragraphs. What did Matt do? Walk through the process honestly —
what was tried, what was learned along the way, key decisions and tradeoffs.]

## The Outcome

[1–2 paragraphs. What changed? Be specific where possible. If there are no
hard metrics, describe the qualitative shift — what could now happen that
couldn't before?]

## What I'd Do Differently

[1 paragraph. Honest reflection. Shows self-awareness and growth mindset.]
```

**Writing guidelines:**
- Open with a scene or specific situation, not a thesis statement
- Name specific tools, frameworks, or methods when relevant
- Show the thinking, not just the conclusion
- Use `>` blockquotes for particularly sharp insights or key quotes
- Use `**bold**` to highlight critical decisions or turning points

### 3. Generate Metadata

From the project details, determine:
- `title`: Clear, specific (e.g., "Rebuilding the Onboarding Experience at Luxury Presence")
- `slug`: kebab-case, no special characters (e.g., `onboarding-rebuild-luxury-presence`)
- `description`: 1–2 sentence summary for the card view (max ~160 chars)
- `tags`: 2–5 relevant tags as an array (e.g., `["Product", "UX", "Onboarding"]`)
- `date`: ISO format YYYY-MM-DD
- `status`: `"active"` unless told otherwise
- `featured`: `true` if this should appear on the homepage (max 3 featured at once)

### 4. Publish via API

The dev server must be running at `http://localhost:4321` for this to work.

Check if it's running:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/
```

If not running, start it in background:
```bash
npm run dev &
sleep 3
```

Post the project:
```bash
curl -s -X POST http://localhost:4321/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "...",
    "slug": "...",
    "description": "...",
    "body": "...",
    "tags": ["...", "..."],
    "type": "projects",
    "status": "active",
    "published": true,
    "featured": false,
    "date": "YYYY-MM-DD",
    "hero_image": ""
  }'
```

Verify the project was created:
```bash
curl -s http://localhost:4321/api/posts/[slug] | jq '.title'
```

### 5. Confirm

Tell the user:
- The project is live at `/work/[slug]`
- Share the full case study body for review
- Note any metadata choices that might need adjustment (e.g., whether to feature it)

## Wrap Up

Summarize:
- Project title and slug
- Whether it's published and featured
- URL where it can be viewed
- Any suggested follow-ups (hero image, tweaks to copy)
