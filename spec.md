# Pay Refixation Calculator

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- 4-step wizard UI: Employee Details → 5th CPC Scale → 6th & 7th CPC → Results
- Employee details form: name, ID, designation, department, date of appointment (1998 only), basic pay at appointment
- 5th CPC pay scale selector (S-1 through S-34) with min/increment/max display
- 6th CPC pay band selector (PB-1 to APEX) with associated grade pays
- 7th CPC pay matrix level selector (levels 1–18) with minimum pay values
- Year-wise pay progression table (1998 to present) with Due/Drawn columns for Basic Pay, DA, TA, and Total
- Inline editing of Drawn values per year
- Override fields for refixed amounts at 2006 and 2016 transitions
- Summary boxes: 5th CPC pay as of 2006, 6th CPC refixed amount, 7th CPC refixed amount, Total Arrears
- Arrears panel: component-wise (Basic, DA, TA) and era-wise (5th/6th/7th CPC) breakdown
- Records tab: localStorage-based saved calculations table with delete option
- Print support: printable Pay Fixation Statement with Government of India header
- Step indicator with done/active/pending states
- CPC era badge labels in results table
- Color-coded difference cells (red = arrears due, green = zero difference)
- Sticky table header, monospace fonts for numbers

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan

### Backend (Motoko)
- Store saved pay fixation records: employee details + calculation results
- CRUD: save record, list records, delete record by ID
- No auth required (public app, localStorage also used as fallback)

### Frontend
- Data constants: all 34 5th CPC scales, 6th CPC pay bands with grade pays, 7th CPC levels with min pay
- DA rates hardcoded per year: 5th CPC era (1998–2005), 6th CPC era (2006–2015), 7th CPC era (2016–present)
- TA slabs per CPC regime
- Calculation engine:
  - 5th CPC: increment on scale each year, apply DA %, compute TA by slab
  - 6th CPC refixation: pay × 1.86, round up to nearest 10, min of pay band; annual 3% increment on (basic + grade pay) rounded to nearest 10
  - 7th CPC refixation: pay × 2.57, round up to nearest 100, min of level; annual 3% increment rounded to nearest 100
- Wizard state machine: 4 steps with validation
- Results table with inline editing of Drawn column
- Arrears computation: sum of (Due − Drawn) per component per era
- localStorage persistence of records
- Print CSS for clean Government of India formatted statement
