// Legal Practitioners Remuneration Order 2023 - Fee Scales Data

export type StateBand = 1 | 2 | 3;

export interface StateBandInfo {
  band: StateBand;
  states: string[];
}

// State Band Classifications
export const STATE_BANDS: StateBandInfo[] = [
  {
    band: 1,
    states: [
      'Abia', 'Adamawa', 'Anambra', 'Bauchi', 'Borno', 'Ebonyi',
      'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
      'Kebbi', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ]
  },
  {
    band: 2,
    states: [
      'Akwa Ibom', 'Bayelsa', 'Benue', 'Cross River', 'Delta',
      'Edo', 'Ekiti', 'Kwara', 'Kogi', 'Nasarawa', 'Niger', 'Ogun',
      'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers'
    ]
  },
  {
    band: 3,
    states: ['Lagos', 'FCT Abuja']
  }
];

export function getStateBand(state: string): StateBand {
  for (const bandInfo of STATE_BANDS) {
    if (bandInfo.states.includes(state)) {
      return bandInfo.band;
    }
  }
  return 1; // Default to band 1
}

export type ExperienceLevel = 'junior' | 'senior' | 'san';

export interface ExperienceLevelInfo {
  id: ExperienceLevel;
  label: string;
  description: string;
}

export const EXPERIENCE_LEVELS: ExperienceLevelInfo[] = [
  { id: 'junior', label: '0-9 Years Experience', description: 'Legal Practitioners with 9 years post qualification experience or less' },
  { id: 'senior', label: '10+ Years Experience', description: 'Legal practitioners with 10 years post qualification experience or above' },
  { id: 'san', label: 'Senior Advocate (SAN)', description: 'Senior Advocates of Nigeria' }
];

// Scale 1: Consultancy and Legal Opinion
export const SCALE_1_CONSULTANCY = {
  name: 'Consultancy & Legal Opinion',
  scale: 1,
  fees: {
    junior: { band1: 20000, band2: 25000, band3: 30000 },
    senior: { band1: 100000, band2: 150000, band3: 200000 },
    san: { band1: 300000, band2: 400000, band3: 500000 }
  }
};

// Scale 2: Incorporation of Companies and Business Names
export const SCALE_2_INCORPORATION = {
  name: 'Company/Business Name Incorporation',
  scale: 2,
  fees: {
    junior: { band1: 50000, band2: 75000, band3: 100000 },
    senior: { band1: 100000, band2: 150000, band3: 200000 },
    san: { band1: 300000, band2: 400000, band3: 500000 }
  }
};

// Scale 3: Litigation
export const SCALE_3_LITIGATION = {
  name: 'Litigation',
  scale: 3,
  categories: {
    labour: {
      name: 'Labour Disputes',
      fees: {
        junior: { band1: 200000, band2: 300000, band3: 400000 },
        senior: { band1: 500000, band2: 600000, band3: 700000 },
        san: { band1: 2000000, band2: 2500000, band3: 3000000 }
      }
    },
    contractual: {
      name: 'Contractual Disputes',
      fees: {
        junior: { band1: 300000, band2: 400000, band3: 500000 },
        senior: { band1: 500000, band2: 600000, band3: 700000 },
        san: { band1: 2000000, band2: 2500000, band3: 3000000 }
      }
    },
    maritime: {
      name: 'Maritime & Aviation Disputes',
      fees: {
        junior: { band1: 400000, band2: 500000, band3: 600000 },
        senior: { band1: 600000, band2: 700000, band3: 800000 },
        san: { band1: 3000000, band2: 3500000, band3: 4000000 }
      }
    },
    energy: {
      name: 'Energy & Mining Disputes',
      fees: {
        junior: { band1: 500000, band2: 600000, band3: 700000 },
        senior: { band1: 700000, band2: 800000, band3: 900000 },
        san: { band1: 3000000, band2: 3500000, band3: 4000000 }
      }
    },
    miscellaneous: {
      name: 'Miscellaneous (Land, Chieftaincy, etc.)',
      fees: {
        junior: { band1: 400000, band2: 500000, band3: 600000 },
        senior: { band1: 600000, band2: 700000, band3: 800000 },
        san: { band1: 3000000, band2: 3500000, band3: 4000000 }
      }
    },
    bail: {
      name: 'Bail Application',
      fees: {
        junior: { band1: 100000, band2: 100000, band3: 150000 },
        senior: { band1: 150000, band2: 250000, band3: 250000 },
        san: { band1: 500000, band2: 600000, band3: 750000 }
      }
    },
    misdemeanor: {
      name: 'Misdemeanors (Criminal)',
      fees: {
        junior: { band1: 200000, band2: 250000, band3: 300000 },
        senior: { band1: 300000, band2: 400000, band3: 500000 },
        san: { band1: 1000000, band2: 1500000, band3: 2000000 }
      }
    },
    felony: {
      name: 'Felonies (Criminal)',
      fees: {
        junior: { band1: 300000, band2: 350000, band3: 400000 },
        senior: { band1: 400000, band2: 500000, band3: 600000 },
        san: { band1: 2000000, band2: 2500000, band3: 3000000 }
      }
    },
    appealHighCourt: {
      name: 'Appeals - High Court',
      fees: {
        junior: { band1: 400000, band2: 500000, band3: 600000 },
        senior: { band1: 600000, band2: 700000, band3: 800000 },
        san: { band1: 3000000, band2: 3500000, band3: 4000000 }
      }
    },
    appealSharia: {
      name: 'Appeals - Sharia/Customary Court',
      fees: {
        junior: { band1: 400000, band2: 500000, band3: 600000 },
        senior: { band1: 600000, band2: 700000, band3: 800000 },
        san: { band1: 3000000, band2: 3500000, band3: 4000000 }
      }
    },
    appealCourtOfAppeal: {
      name: 'Appeals - Court of Appeal',
      fees: {
        junior: { band1: 500000, band2: 600000, band3: 700000 },
        senior: { band1: 700000, band2: 800000, band3: 1000000 },
        san: { band1: 4000000, band2: 5000000, band3: 6000000 }
      }
    },
    appealSupremeCourt: {
      name: 'Appeals - Supreme Court',
      fees: {
        junior: { band1: 600000, band2: 700000, band3: 800000 },
        senior: { band1: 800000, band2: 900000, band3: 1500000 },
        san: { band1: 5000000, band2: 6000000, band3: 7000000 }
      }
    }
  }
};

// Scale 4: Property Transactions
export const SCALE_4_PROPERTY = {
  name: 'Property Transactions',
  scale: 4,
  conveyancing: {
    description: 'Conveyancing and Assignments (public or private auctions)',
    tiers: [
      {
        range: 'Up to ₦50,000,000',
        assigneeFee: '5% of property value',
        assignorFee: '2.5% of property value (reviewing draft)'
      },
      {
        range: '₦50,000,000 - ₦100,000,000',
        assigneeFee: '₦5,000,000 for first ₦50m + 3% of subsequent amount',
        assignorFee: 'Half of Assignee fee'
      },
      {
        range: 'Above ₦100,000,000',
        assigneeFee: '₦7,500,000 for first ₦100m + negotiated rate',
        assignorFee: 'Half of Assignee fee'
      }
    ]
  },
  mortgages: {
    description: 'Mortgages',
    tiers: [
      {
        range: 'Up to ₦50,000,000',
        mortgageeFee: '3% of mortgage value',
        mortgagorFee: '1.5% of mortgage value (reviewing draft)'
      },
      {
        range: '₦50,000,000 - ₦100,000,000',
        mortgageeFee: '₦2,000,000 for first ₦50m + 2% of subsequent amount',
        mortgagorFee: 'Half of Mortgagee fee'
      },
      {
        range: 'Above ₦100,000,000',
        mortgageeFee: '₦4,500,000 for first ₦100m + negotiated rate',
        mortgagorFee: 'Half of Mortgagee fee'
      }
    ]
  },
  leases: {
    description: 'Leases and Tenancies',
    tiers: [
      {
        range: 'Up to ₦5,000,000 annual rent',
        lessorFee: '10% of annual rental value',
        lesseeFee: '5% of annual rental value'
      },
      {
        range: '₦5,000,000 - ₦10,000,000 annual rent',
        lessorFee: '₦500,000 for first ₦5m + 5% of subsequent amount',
        lesseeFee: 'Half of Lessor fee'
      },
      {
        range: 'Above ₦10,000,000 annual rent',
        lessorFee: '₦750,000 for first ₦10m + negotiated rate',
        lesseeFee: 'Half of Lessor fee'
      }
    ]
  },
  rules: [
    'Both parties representation: 10% of property value (contribution rate agreed with both parties)',
    'Lessor prepares + Lessee reviews: Lessor gets 7.5%, Lessee gets 2.5%',
    'Multiple parties with distinct interests: 5% per party',
    'Same documents at same time: charged per rule 3'
  ]
};

// Scale 5: Hourly Rates for Commercial Transactions
export const SCALE_5_HOURLY = {
  name: 'Commercial Transactions (Hourly Rates)',
  scale: 5,
  rates: {
    associate: {
      name: 'Associates (0-6 years experience)',
      band1: 10000,
      band2: 20000,
      band3: 30000
    },
    seniorAssociate: {
      name: 'Senior Associates (6-12 years experience)',
      band1: 20000,
      band2: 80000,
      band3: 120000
    },
    partner: {
      name: 'Partners (12+ years including SANs)',
      band1: 50000,
      band2: 150000,
      band3: 200000
    }
  }
};

// All service categories for dropdown
export interface ServiceCategory {
  id: string;
  name: string;
  scale: number;
  subcategories?: { id: string; name: string }[];
  hasPropertyCalculation?: boolean;
  hasHourlyRate?: boolean;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'consultancy',
    name: 'Consultancy & Legal Opinion',
    scale: 1
  },
  {
    id: 'incorporation',
    name: 'Company/Business Name Incorporation',
    scale: 2
  },
  {
    id: 'litigation',
    name: 'Litigation',
    scale: 3,
    subcategories: [
      { id: 'labour', name: 'Labour Disputes' },
      { id: 'contractual', name: 'Contractual Disputes' },
      { id: 'maritime', name: 'Maritime & Aviation Disputes' },
      { id: 'energy', name: 'Energy & Mining Disputes' },
      { id: 'miscellaneous', name: 'Miscellaneous (Land, Chieftaincy, etc.)' },
      { id: 'bail', name: 'Bail Application' },
      { id: 'misdemeanor', name: 'Misdemeanors (Criminal)' },
      { id: 'felony', name: 'Felonies (Criminal)' },
      { id: 'appealHighCourt', name: 'Appeals - High Court' },
      { id: 'appealSharia', name: 'Appeals - Sharia/Customary Court' },
      { id: 'appealCourtOfAppeal', name: 'Appeals - Court of Appeal' },
      { id: 'appealSupremeCourt', name: 'Appeals - Supreme Court' }
    ]
  },
  {
    id: 'property',
    name: 'Property Transactions',
    scale: 4,
    subcategories: [
      { id: 'conveyancing', name: 'Conveyancing & Assignments' },
      { id: 'mortgage', name: 'Mortgages' },
      { id: 'lease', name: 'Leases & Tenancies' }
    ],
    hasPropertyCalculation: true
  },
  {
    id: 'commercial',
    name: 'Commercial Transactions (Hourly)',
    scale: 5,
    hasHourlyRate: true
  }
];

// Helper function to format currency
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('NGN', '₦');
}

// Calculate property transaction fee
export function calculatePropertyFee(
  type: 'conveyancing' | 'mortgage' | 'lease',
  value: number,
  role: 'primary' | 'secondary' // primary = assignee/mortgagee/lessor, secondary = assignor/mortgagor/lessee
): { fee: number; breakdown: string } {
  let fee = 0;
  let breakdown = '';

  if (type === 'conveyancing') {
    if (value <= 50000000) {
      const rate = role === 'primary' ? 0.05 : 0.025;
      fee = value * rate;
      breakdown = `${rate * 100}% of ₦${value.toLocaleString()} = ${formatNaira(fee)}`;
    } else if (value <= 100000000) {
      if (role === 'primary') {
        const baseAmount = 50000000 * 0.05; // ₦2.5m for first ₦50m
        const remainingAmount = (value - 50000000) * 0.03;
        fee = baseAmount + remainingAmount;
        breakdown = `₦2,500,000 (5% of first ₦50m) + ${formatNaira(remainingAmount)} (3% of ₦${(value - 50000000).toLocaleString()}) = ${formatNaira(fee)}`;
      } else {
        const primaryFee = (50000000 * 0.05) + ((value - 50000000) * 0.03);
        fee = primaryFee / 2;
        breakdown = `Half of Assignee's fee: ${formatNaira(fee)}`;
      }
    } else {
      if (role === 'primary') {
        const baseAmount = 7500000; // ₦7.5m for first ₦100m
        const remainingAmount = (value - 100000000) * 0.02; // 2% estimate for amounts above
        fee = baseAmount + remainingAmount;
        breakdown = `₦7,500,000 (for first ₦100m) + ${formatNaira(remainingAmount)} (estimated 2% of ₦${(value - 100000000).toLocaleString()}) = ${formatNaira(fee)}`;
      } else {
        const primaryFee = 7500000 + ((value - 100000000) * 0.02);
        fee = primaryFee / 2;
        breakdown = `Half of Assignee's fee: ${formatNaira(fee)}`;
      }
    }
  } else if (type === 'mortgage') {
    if (value <= 50000000) {
      const rate = role === 'primary' ? 0.03 : 0.015;
      fee = value * rate;
      breakdown = `${rate * 100}% of ₦${value.toLocaleString()} = ${formatNaira(fee)}`;
    } else if (value <= 100000000) {
      if (role === 'primary') {
        const baseAmount = 2000000; // ₦2m for first ₦50m
        const remainingAmount = (value - 50000000) * 0.02;
        fee = baseAmount + remainingAmount;
        breakdown = `₦2,000,000 (for first ₦50m) + ${formatNaira(remainingAmount)} (2% of ₦${(value - 50000000).toLocaleString()}) = ${formatNaira(fee)}`;
      } else {
        const primaryFee = 2000000 + ((value - 50000000) * 0.02);
        fee = primaryFee / 2;
        breakdown = `Half of Mortgagee's fee: ${formatNaira(fee)}`;
      }
    } else {
      if (role === 'primary') {
        const baseAmount = 4500000; // ₦4.5m for first ₦100m
        const remainingAmount = (value - 100000000) * 0.015;
        fee = baseAmount + remainingAmount;
        breakdown = `₦4,500,000 (for first ₦100m) + ${formatNaira(remainingAmount)} (estimated 1.5% of ₦${(value - 100000000).toLocaleString()}) = ${formatNaira(fee)}`;
      } else {
        const primaryFee = 4500000 + ((value - 100000000) * 0.015);
        fee = primaryFee / 2;
        breakdown = `Half of Mortgagee's fee: ${formatNaira(fee)}`;
      }
    }
  } else if (type === 'lease') {
    // Annual rental value
    if (value <= 5000000) {
      const rate = role === 'primary' ? 0.10 : 0.05;
      fee = value * rate;
      breakdown = `${rate * 100}% of annual rent ₦${value.toLocaleString()} = ${formatNaira(fee)}`;
    } else if (value <= 10000000) {
      if (role === 'primary') {
        const baseAmount = 500000; // ₦500k for first ₦5m
        const remainingAmount = (value - 5000000) * 0.05;
        fee = baseAmount + remainingAmount;
        breakdown = `₦500,000 (for first ₦5m) + ${formatNaira(remainingAmount)} (5% of ₦${(value - 5000000).toLocaleString()}) = ${formatNaira(fee)}`;
      } else {
        const primaryFee = 500000 + ((value - 5000000) * 0.05);
        fee = primaryFee / 2;
        breakdown = `Half of Lessor's fee: ${formatNaira(fee)}`;
      }
    } else {
      if (role === 'primary') {
        const baseAmount = 750000; // ₦750k for first ₦10m
        const remainingAmount = (value - 10000000) * 0.03;
        fee = baseAmount + remainingAmount;
        breakdown = `₦750,000 (for first ₦10m) + ${formatNaira(remainingAmount)} (estimated 3% of ₦${(value - 10000000).toLocaleString()}) = ${formatNaira(fee)}`;
      } else {
        const primaryFee = 750000 + ((value - 10000000) * 0.03);
        fee = primaryFee / 2;
        breakdown = `Half of Lessor's fee: ${formatNaira(fee)}`;
      }
    }
  }

  return { fee, breakdown };
}
