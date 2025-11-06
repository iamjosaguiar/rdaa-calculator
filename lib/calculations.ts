// Type definitions
export type MMMValue = 'MMM 1' | 'MMM 2' | 'MMM 3' | 'MMM 4' | 'MMM 5' | 'MMM 6' | 'MMM 7';
export type DegreeLength = '4' | '5' | '6';
export type YesNo = 'Yes' | 'No';
export type CollegeType = 'ACRRM' | 'RACGP';
export type PrimaryCareDays = '47 or less' | '48-95' | '96-143' | '144+';

export interface FormData {
  mmm: MMMValue | '';
  degreeLength: DegreeLength | '';
  helpDebtBalance: string;
  gpRegistrar: YesNo | '';
  collegeType: CollegeType | '';
  trainingPathway: string;
  stateSalaried: YesNo | '';
  vrGp: YesNo | '';
  primaryCareDays: PrimaryCareDays | '';
  advancedSkill: YesNo | '';
  selectedSkills: string[];
  daysWorked: string;
  emergencyCare: YesNo | '';
  emergencyServiceType: string;
  emergencyShifts: string;
}

export interface YearlyPayments {
  year1: number;
  year2: number;
  year3: number;
  year4: number;
  year5: number;
  year6: number;
}

// HELP Reduction Calculations
export function calculateHecsValues(
  mmmValue: string,
  hecsAmount: string,
  degreeLength: string
): number[] {
  const reduction = [0, 0, 0, 0, 0, 0];
  const parsedHecsAmount = parseFloat(hecsAmount) || 0;
  const halfAmount = parsedHecsAmount / 2;

  if (parsedHecsAmount > 0) {
    switch (mmmValue) {
      case 'MMM 3':
      case 'MMM 4':
      case 'MMM 5':
        if (degreeLength === '5') {
          reduction[2] = halfAmount; // Year 3
          reduction[4] = halfAmount; // Year 5
        } else if (degreeLength === '6') {
          reduction[2] = halfAmount; // Year 3
          reduction[5] = halfAmount; // Year 6
        } else {
          reduction[1] = halfAmount; // Year 2
          reduction[3] = halfAmount; // Year 4
        }
        break;
      case 'MMM 6':
      case 'MMM 7':
        if (degreeLength === '5' || degreeLength === '6') {
          reduction[1] = halfAmount; // Year 2
          reduction[2] = halfAmount; // Year 3
        } else {
          reduction[0] = halfAmount; // Year 1
          reduction[1] = halfAmount; // Year 2
        }
        break;
      default:
        break;
    }
  }

  return reduction;
}

// Rural Grants Calculations
export function calculateRuralGrants(
  mmmValue: string,
  selectedSkills: string[],
  emergencyServiceType: string
): number[] {
  const ruralGrants = [0, 0, 0, 0, 0, 0];
  let amount = 0;

  const surgeryIndicator = selectedSkills.includes('Surgery');
  const anaesthesiaIndicator = selectedSkills.includes('Anaesthesia');
  const obstetricsIndicator = selectedSkills.includes('Obstetrics and Gynaecology');

  const medicalIndicator = emergencyServiceType === 'Medical' || emergencyServiceType === 'Both';
  const mentalIndicator = emergencyServiceType === 'Mental Health' || emergencyServiceType === 'Both';

  if (['MMM 3', 'MMM 4', 'MMM 5', 'MMM 6', 'MMM 7'].includes(mmmValue)) {
    if (surgeryIndicator) amount += 20000;
    if (anaesthesiaIndicator) amount += 20000;
    if (obstetricsIndicator) amount += 20000;
    if (medicalIndicator) amount += 6000;
    if (mentalIndicator) amount += 6000;

    return ruralGrants.map(() => amount);
  }

  return ruralGrants;
}

// Registrar Payments Calculations
function calculateAcrrmAgpt(mmmValue: number): number[] {
  const MMMList = [
    [0, 3675.60, 6993.86, 6993.86, 9822.02, 18888.50, 18888.50],
    [0, 3675.60, 6993.86, 6993.86, 9822.02, 18888.50, 18888.50],
  ];
  const returnVal = [0, 0, 0, 0, 0, 0];

  for (let i = 0; i < 2; i++) {
    returnVal[i] = MMMList[i][mmmValue - 1];
  }
  return returnVal;
}

function calculateAcrrmRgts(mmmValue: number): number[] {
  const MMMList = [0, 3600, 6850, 6850, 9620, 18500, 18500];
  const returnVal = [0, 0, 0, 0, 0, 0];
  const payment = MMMList[mmmValue - 1];

  returnVal[0] = payment; // Year 1
  returnVal[1] = payment; // Year 2
  returnVal[2] = payment; // Year 3
  returnVal[3] = payment; // Year 4

  return returnVal;
}

function calculateAcrrmRvts(): number[] {
  return [0, 0, 0, 0, 0, 0];
}

function calculateAcrrmIndependent(): number[] {
  return [0, 0, 0, 0, 0, 0];
}

function calculateRacgpAgpt(mmmValue: number): number[] {
  const MMMList = [0, 3675.60, 6993.86, 6993.86, 9822.02, 18888.50, 18888.50];
  const returnVal = [0, 0, 0, 0, 0, 0];

  for (let i = 0; i < 2; i++) {
    returnVal[i] = MMMList[mmmValue - 1];
  }
  return returnVal;
}

function calculateRacgpRvts(): number[] {
  return [0, 0, 0, 0, 0, 0];
}

function calculateRacgpFellowship(): number[] {
  return [0, 0, 0, 0, 0, 0];
}

function calculateAcrrmAmounts(mmmValue: number, trainingPathway: string): number[] {
  switch (trainingPathway) {
    case 'AGPT':
      return calculateAcrrmAgpt(mmmValue);
    case 'RVTS':
      return calculateAcrrmRvts();
    case 'Independent':
      return calculateAcrrmIndependent();
    default:
      return [0, 0, 0, 0, 0, 0];
  }
}

function calculateRacgpAmounts(mmmValue: number, trainingPathway: string): number[] {
  switch (trainingPathway) {
    case 'AGPT':
      return calculateRacgpAgpt(mmmValue);
    case 'RVTS':
      return calculateRacgpRvts();
    case 'Fellowship Support':
      return calculateRacgpFellowship();
    default:
      return [0, 0, 0, 0, 0, 0];
  }
}

export function calculateRegistrarPayments(
  mmmValue: string,
  registrarIndicator: string,
  collegeType: string,
  trainingPathway: string
): number[] {
  const registrarPayments = [0, 0, 0, 0, 0, 0];

  if (registrarIndicator === 'Yes') {
    const mmmValueInt = parseInt(mmmValue.split(' ')[1]);
    let registrarAmounts: number[];

    if (collegeType === 'ACRRM') {
      registrarAmounts = calculateAcrrmAmounts(mmmValueInt, trainingPathway);
    } else if (collegeType === 'RACGP') {
      registrarAmounts = calculateRacgpAmounts(mmmValueInt, trainingPathway);
    } else {
      return registrarPayments;
    }

    return registrarAmounts;
  }

  return registrarPayments;
}

// WIP Medical Stream Calculations
function calculateYesWIPMedicalValues(MMMValue: number): number[] {
  const returnVal = [0, 0, 0, 0, 0, 0];
  const payments = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 4500, 7500, 7500, 12000, 12000],
    [0, 8000, 13000, 13000, 18000, 18000],
    [0, 12000, 17000, 17000, 23000, 23000],
    [16000, 16000, 25000, 25000, 35000, 35000],
    [25000, 25000, 35000, 35000, 60000, 60000],
  ];

  if (0 < MMMValue && MMMValue < 8) {
    for (let i = 0; i < 6; i++) {
      returnVal[i] = payments[MMMValue - 1][i];
    }
  }
  return returnVal;
}

function calculateNoWIPMedicalValues(MMMValue: number): number[] {
  const returnVal = [0, 0, 0, 0, 0, 0];
  const payments = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 3600, 6000, 6000, 9600, 9600],
    [0, 6400, 10400, 10400, 14400, 14400],
    [0, 9600, 13600, 13600, 18400, 18400],
    [12800, 12800, 20000, 20000, 28000, 28000],
    [20000, 20000, 28000, 28000, 48000, 48000],
  ];

  if (0 < MMMValue && MMMValue < 8) {
    for (let i = 0; i < 6; i++) {
      returnVal[i] = payments[MMMValue - 1][i];
    }
  }
  return returnVal;
}

export function calculateWIPMedicalValues(
  mmmValue: string,
  registrarIndicator: string,
  vrIndicator: string
): number[] {
  const MMMValue = parseInt(mmmValue.split(' ')[1]);
  let wipAmounts = [0, 0, 0, 0, 0, 0];

  if (registrarIndicator === 'Yes' || (registrarIndicator === 'No' && vrIndicator === 'Yes')) {
    wipAmounts = calculateYesWIPMedicalValues(MMMValue);
  } else if (registrarIndicator === 'No' && vrIndicator === 'No') {
    wipAmounts = calculateNoWIPMedicalValues(MMMValue);
  }

  return wipAmounts;
}

// WIP Emergency Stream Calculations
function getMMMIndex(mmmValue: string): number {
  switch (mmmValue) {
    case 'MMM 1':
    case 'MMM 2':
      return 0;
    case 'MMM 3':
      return 1;
    case 'MMM 4':
    case 'MMM 5':
      return 2;
    case 'MMM 6':
    case 'MMM 7':
      return 3;
    default:
      return 0;
  }
}

function getEmergencyShiftCount(emergencyShifts: string): number {
  const shifts = parseInt(emergencyShifts.split('-')[0], 10);
  if (shifts <= 10) return 0;
  if (shifts <= 21) return 1;
  if (shifts <= 47) return 2;
  return 3;
}

export function calculateWIPEmergencyValues(
  mmmValue: string,
  emergencyIndicator: string,
  emergencyServiceType: string,
  emergencyShifts: string,
  primaryCareDays: string
): number[] {
  if (primaryCareDays === '47 or less') {
    return [0, 0, 0, 0, 0, 0];
  }

  const MMMIndex = getMMMIndex(mmmValue);
  const payscale = [
    [0, 0, 0, 0],
    [0, 4000, 4000, 4000],
    [0, 5000, 7500, 9500],
    [0, 9000, 10500, 10500],
  ];
  const emergencyAmounts = [0, 0, 0, 0, 0, 0];

  if (emergencyIndicator === 'Yes' && (emergencyServiceType === 'Medical' || emergencyServiceType === 'Both')) {
    const emergencyCount = getEmergencyShiftCount(emergencyShifts);
    const amount = payscale[MMMIndex][emergencyCount];
    return emergencyAmounts.map(() => amount);
  }

  return emergencyAmounts;
}

// WIP Advanced Skills Stream Calculations
function getSkillsDaysCount(skillsDays: string): number {
  const days = parseInt(skillsDays.split('-')[0], 10);
  if (days <= 10) return 0;
  if (days <= 21) return 1;
  if (days <= 47) return 2;
  return 3;
}

export function calculateWIPAdvancedSkillsValues(
  mmmValue: string,
  skillsIndicator: string,
  skillsDays: string,
  primaryCareDays: string
): number[] {
  if (primaryCareDays === '47 or less') {
    return [0, 0, 0, 0, 0, 0];
  }

  const MMMIndex = getMMMIndex(mmmValue);
  const payscale = [
    [0, 0, 0, 0],
    [0, 4000, 4000, 4000],
    [0, 5000, 7500, 9500],
    [0, 9000, 10500, 10500],
  ];
  const skillsAmounts = [0, 0, 0, 0, 0, 0];

  if (skillsIndicator === 'Yes') {
    const skillsCount = getSkillsDaysCount(skillsDays);
    const amount = payscale[MMMIndex][skillsCount];
    return skillsAmounts.map(() => amount);
  }

  return skillsAmounts;
}

// Salary Support Calculations
export function calculateSalarySupportValues(
  registrarIndicator: string,
  collegeType: string,
  trainingPathway: string,
  stateSalaried: string
): number[] {
  const salarySupport = [0, 0, 0, 0, 0, 0];

  if (registrarIndicator === 'Yes' && stateSalaried === 'No') {
    // $30,000 in Year 1 for AGPT and RVTS trainees (both ACRRM and RACGP)
    if (trainingPathway === 'AGPT' || trainingPathway === 'RVTS') {
      salarySupport[0] = 30000;
    }
  }

  return salarySupport;
}

// Paid Study Leave Calculations
export function calculatePaidStudyLeaveValues(
  registrarIndicator: string,
  collegeType: string,
  trainingPathway: string,
  stateSalaried: string
): number[] {
  const paidStudyLeave = [0, 0, 0, 0, 0, 0];

  if (registrarIndicator === 'Yes' && stateSalaried === 'No') {
    if (trainingPathway === 'AGPT') {
      // AGPT Trainees
      paidStudyLeave[0] = 2587.42; // Year 1
      paidStudyLeave[1] = 2762.98; // Year 2
    } else if (trainingPathway === 'RVTS') {
      // RVTS Trainees
      paidStudyLeave[0] = 2446.44; // Year 1
      paidStudyLeave[1] = 2762.98; // Year 2
    }
  }

  return paidStudyLeave;
}
