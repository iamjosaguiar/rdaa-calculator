# Rural Commonwealth Incentives Calculator

A modern Next.js application for calculating eligibility for Australian rural healthcare incentive programs.

## Features

- **8-Question Assessment**: Comprehensive questionnaire to determine individual circumstances
- **Real-time Calculations**: Automatic calculation updates as form values change
- **6-Year Payment Projections**: View projected payments across six years
- **Multiple Payment Streams**:
  - HELP Debt Reduction
  - Rural Grants
  - Registrar Payments
  - WIP Doctor Stream
  - WIP RAS Emergency stream
  - WIP RAS Advance Skill stream
- **Interactive Help Section**: Tabbed interface with detailed information about each payment type
- **Conditional Logic**: Smart form that shows/hides questions based on user responses
- **Modern UI**: Clean, responsive design with Tailwind CSS

## Technology Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd rdaa-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
rdaa-calculator/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main calculator page component
│   └── globals.css         # Global styles
├── lib/
│   └── calculations.ts     # Calculation logic and utilities
└── README.md
```

## Calculation Logic

The calculator implements the following payment calculations:

### HELP Reduction
- Based on MMM location (3-7) and degree length (4-6 years)
- Requires 144+ days per year in primary care
- 50% reduction paid over specific years

### Rural Grants
- Available for MMM 3-7 locations
- Surgery/Anaesthesia/Obstetrics: $20,000/year
- Emergency Medical/Mental Health: $6,000/year

### Registrar Payments
- Based on college (ACRRM/RACGP) and training pathway
- Varies by MMM location
- Paid during training years

### WIP Streams
- **Medical Stream**: Base payments for primary care doctors
- **RAS Emergency stream**: Additional for emergency service provision
- **RAS Advance Skill stream**: Additional for advanced clinical skills

## Migrated from Original Site

This application was migrated from a static HTML/CSS/JavaScript site to a modern Next.js application with:
- Improved type safety with TypeScript
- Better state management with React hooks
- Modern, responsive UI design
- Maintainable component structure
- Real-time calculation updates

## Original Site

The original calculator is hosted at [https://rdaacalculator.com.au/](https://rdaacalculator.com.au/)

## License

This project is for healthcare professionals to calculate their eligibility for government incentive programs.
