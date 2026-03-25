# EduMentor AI — Frontend

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.local` and set your backend URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/register` | Register page |
| `/dashboard` | Subject cards, stats overview |
| `/upload` | Drag & drop PDF notes upload |
| `/quiz` | AI quiz generation + timed quiz + results |
| `/doubt` | AI chat doubt solver |
| `/explain` | Concept explainer with history |
| `/performance` | Score trend chart, weak topics, study plan generator |
| `/studyplan` | Day-by-day study calendar |

## Tech Stack

- **Next.js 14** (App Router)
- **TailwindCSS** for utility classes
- **Custom CSS variables** for the design system (teal + cream theme)
- **axios** for API calls with JWT interceptor
- **react-hook-form** for form validation
- **react-dropzone** for PDF upload
- **Fonts**: Playfair Display (headings) + DM Sans (body)

## Design

Inspired by the "Circle" education platform:
- Warm teal-to-blush gradient background
- Cream/beige rounded cards
- Clean editorial typography
