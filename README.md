# Field Shift

Field Shift is a climate-adaptive crop planning and soil health decision support web app built for the NASA Space Apps Challenge. It helps farmers, agricultural officers, and administrators explore location-specific adaptation strategies using NASA Earth observation data, district-level agro-ecology profiles, and crop rotation planning logic.

The app is focused on Bangladesh and models conditions across 64 districts, combining climate stress signals with practical soil and crop recommendations.

## Overview

Field Shift is designed to:

- Recommend resilient crop rotation plans by district
- Assess soil health and nutrient balance
- Simulate farm-level climate stress scenarios
- Highlight climate risks such as heat stress, drought, salinity, flooding, and waterlogging
- Provide bilingual (English and Bangla) guidance for users
- Support multiple user roles such as farmers and admin staff

The platform is built with Next.js and uses a single-page dashboard experience to make climate-smart agriculture decisions more accessible.

## Core Features

### Climate-smart crop rotation planning
- District-based recommendations for Bangladesh regions
- Crop suitability scoring by water demand, drought tolerance, heat tolerance, and nutrient impact
- Comparison between traditional and recommended crop plans
- Soil organic matter and resilience projections over time

### NASA data-driven context
- Designed around NASA POWER, SMAP, and ECOSTRESS-inspired decision support concepts
- District baseline data including rainfall, temperature, soil profile, and climate risk
- Location-aware agricultural advisory for agro-ecological conditions

### What-if climate simulator
- Adjust rainfall, temperature, and irrigation constraint inputs
- Compare plan performance under simulated future stress conditions
- Estimate impact on water stress and yield resilience

### Farm profile and soil lab inputs
- Soil texture and pH input controls
- Organic matter indicators
- Water holding capacity and nutrient balance considerations
- Recommendations aligned with local soil conditions

### User experience
- Clean dashboard UI with day/night mode
- English and Bangla language toggle
- 64-district selector for Bangladesh
- Farmer and admin workflow views

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React icons

## Project Structure

```text
.
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── .gitignore
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
├── next-env.d.ts
├── README.md
└── public/ (if added later)
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev     # Start the development server
npm run build   # Build the production app
npm run start   # Run the production build locally
npm run lint    # Run Next.js lint checks
```

## Use Case

This project is especially useful for:

- Farmers making seasonal crop decisions
- Agricultural extension officers planning district-level interventions
- Climate resilience practitioners comparing adaptation scenarios
- Researchers exploring data-informed agricultural decision support in Bangladesh

## Project Notes

The application is a concept and prototype dashboard, not yet connected to a live NASA API or production backend. It demonstrates the decision-support workflow and UI for climate-smart agriculture planning based on district-level modeled inputs.

## License

This project is currently unlicensed unless otherwise specified by the repository owner.

## Acknowledgements

- NASA Space Apps Challenge
- NASA POWER, SMAP, and ECOSTRESS data concepts
- Bangladesh climate and agriculture context
 
