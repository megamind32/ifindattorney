'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  STATE_BANDS,
  getStateBand,
  EXPERIENCE_LEVELS,
  SERVICE_CATEGORIES,
  SCALE_1_CONSULTANCY,
  SCALE_2_INCORPORATION,
  SCALE_3_LITIGATION,
  SCALE_5_HOURLY,
  formatNaira,
  calculatePropertyFee,
  type StateBand,
  type ExperienceLevel
} from '@/lib/fee-scales';

export default function LawyerFeesPage() {
  // Form state
  const [selectedState, setSelectedState] = useState('Lagos');
  const [selectedService, setSelectedService] = useState('consultancy');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('junior');
  const [propertyValue, setPropertyValue] = useState<number>(0);
  const [propertyRole, setPropertyRole] = useState<'primary' | 'secondary'>('primary');
  const [hours, setHours] = useState<number>(1);
  const [hourlyLevel, setHourlyLevel] = useState<'associate' | 'seniorAssociate' | 'partner'>('associate');

  // Computed values
  const [calculatedFee, setCalculatedFee] = useState<number | null>(null);
  const [feeBreakdown, setFeeBreakdown] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  // Get all Nigerian states from all bands
  const allStates = STATE_BANDS.flatMap(band => band.states).sort();

  // Get current service category
  const currentService = SERVICE_CATEGORIES.find(s => s.id === selectedService);

  // Reset subcategory when service changes
  useEffect(() => {
    if (currentService?.subcategories && currentService.subcategories.length > 0) {
      setSelectedSubcategory(currentService.subcategories[0].id);
    } else {
      setSelectedSubcategory('');
    }
    setShowResult(false);
  }, [selectedService]);

  // Calculate fee
  const calculateFee = () => {
    const stateBand = getStateBand(selectedState);
    const bandKey = `band${stateBand}` as 'band1' | 'band2' | 'band3';
    
    let fee = 0;
    let breakdown = '';

    if (selectedService === 'consultancy') {
      const fees = SCALE_1_CONSULTANCY.fees[experienceLevel];
      fee = fees[bandKey];
      breakdown = `Scale 1 - Consultancy & Legal Opinion\n\nMinimum fee for ${EXPERIENCE_LEVELS.find(e => e.id === experienceLevel)?.label} in State Band ${stateBand} (${selectedState}):\n\n${formatNaira(fee)}`;
    } 
    else if (selectedService === 'incorporation') {
      const fees = SCALE_2_INCORPORATION.fees[experienceLevel];
      fee = fees[bandKey];
      breakdown = `Scale 2 - Company/Business Name Incorporation\n\nMinimum fee for ${EXPERIENCE_LEVELS.find(e => e.id === experienceLevel)?.label} in State Band ${stateBand} (${selectedState}):\n\n${formatNaira(fee)}`;
    }
    else if (selectedService === 'litigation' && selectedSubcategory) {
      const category = SCALE_3_LITIGATION.categories[selectedSubcategory as keyof typeof SCALE_3_LITIGATION.categories];
      if (category) {
        const fees = category.fees[experienceLevel];
        fee = fees[bandKey];
        breakdown = `Scale 3 - Litigation (${category.name})\n\nMinimum fee for ${EXPERIENCE_LEVELS.find(e => e.id === experienceLevel)?.label} in State Band ${stateBand} (${selectedState}):\n\n${formatNaira(fee)}`;
      }
    }
    else if (selectedService === 'property' && selectedSubcategory && propertyValue > 0) {
      const propertyType = selectedSubcategory === 'conveyancing' ? 'conveyancing' : 
                          selectedSubcategory === 'mortgage' ? 'mortgage' : 'lease';
      const result = calculatePropertyFee(propertyType, propertyValue, propertyRole);
      fee = result.fee;
      
      const roleLabel = propertyRole === 'primary' 
        ? (propertyType === 'conveyancing' ? 'Assignee/Purchaser' : propertyType === 'mortgage' ? 'Mortgagee/Lender' : 'Lessor/Landlord')
        : (propertyType === 'conveyancing' ? 'Assignor/Vendor' : propertyType === 'mortgage' ? 'Mortgagor/Borrower' : 'Lessee/Tenant');
      
      const valueLabel = propertyType === 'lease' ? 'Annual Rental Value' : 'Property/Mortgage Value';
      
      breakdown = `Scale 4 - Property Transactions (${currentService?.subcategories?.find(s => s.id === selectedSubcategory)?.name})\n\n${valueLabel}: ${formatNaira(propertyValue)}\nRole: ${roleLabel}'s Legal Practitioner\n\nCalculation:\n${result.breakdown}`;
    }
    else if (selectedService === 'commercial') {
      const rates = SCALE_5_HOURLY.rates[hourlyLevel];
      const hourlyRate = rates[bandKey];
      fee = hourlyRate * hours;
      breakdown = `Scale 5 - Commercial Transactions (Hourly Rates)\n\n${rates.name} in State Band ${stateBand} (${selectedState}):\n\nHourly Rate: ${formatNaira(hourlyRate)}\nHours: ${hours}\n\nTotal: ${formatNaira(hourlyRate)} × ${hours} hours = ${formatNaira(fee)}`;
    }

    setCalculatedFee(fee);
    setFeeBreakdown(breakdown);
    setShowResult(true);
  };

  return (
    <main className="min-h-screen bg-white page-transition-enter">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-8 rounded-b-3xl shadow-lg content-transition">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-khand)] mb-2">
            Know Fair Legal Fees
          </h1>
          <p className="text-red-100 text-sm sm:text-base font-[family-name:var(--font-inter)]">
            Calculate minimum fees based on the Legal Practitioners Remuneration Order 2023
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
        {/* Calculator Form */}
        <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-6">
            Fee Calculator
          </h2>

          <div className="space-y-5">
            {/* State Selection */}
            <div>
              <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-2">
                1. Select Your State
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setShowResult(false);
                }}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition bg-white"
              >
                {allStates.map((state) => (
                  <option key={state} value={state}>
                    {state} (Band {getStateBand(state)})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Your state falls under State Band {getStateBand(selectedState)}
              </p>
            </div>

            {/* Service Category */}
            <div>
              <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-2">
                2. Select Legal Service (Scale)
              </label>
              <select
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  setShowResult(false);
                }}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition bg-white"
              >
                {SERVICE_CATEGORIES.map((service) => (
                  <option key={service.id} value={service.id}>
                    Scale {service.scale}: {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory (if applicable) */}
            {currentService?.subcategories && (
              <div>
                <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-2">
                  3. Select Specific Service
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => {
                    setSelectedSubcategory(e.target.value);
                    setShowResult(false);
                  }}
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition bg-white"
                >
                  {currentService.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Experience Level (for non-property, non-hourly services) */}
            {!currentService?.hasPropertyCalculation && !currentService?.hasHourlyRate && (
              <div>
                <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-2">
                  {currentService?.subcategories ? '4' : '3'}. Lawyer&apos;s Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => {
                    setExperienceLevel(e.target.value as ExperienceLevel);
                    setShowResult(false);
                  }}
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition bg-white"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {EXPERIENCE_LEVELS.find(l => l.id === experienceLevel)?.description}
                </p>
              </div>
            )}

            {/* Property Transaction Fields */}
            {currentService?.hasPropertyCalculation && (
              <>
                <div>
                  <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-2">
                    4. {selectedSubcategory === 'lease' ? 'Annual Rental Value (₦)' : 'Property/Mortgage Value (₦)'}
                  </label>
                  <input
                    type="number"
                    value={propertyValue || ''}
                    onChange={(e) => {
                      setPropertyValue(Number(e.target.value));
                      setShowResult(false);
                    }}
                    placeholder="Enter amount in Naira"
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition"
                  />
                  {propertyValue > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {formatNaira(propertyValue)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-2">
                    5. Your Role in Transaction
                  </label>
                  <select
                    value={propertyRole}
                    onChange={(e) => {
                      setPropertyRole(e.target.value as 'primary' | 'secondary');
                      setShowResult(false);
                    }}
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition bg-white"
                  >
                    {selectedSubcategory === 'conveyancing' && (
                      <>
                        <option value="primary">Buyer/Assignee (preparing documents)</option>
                        <option value="secondary">Seller/Assignor (reviewing documents)</option>
                      </>
                    )}
                    {selectedSubcategory === 'mortgage' && (
                      <>
                        <option value="primary">Lender/Mortgagee (preparing documents)</option>
                        <option value="secondary">Borrower/Mortgagor (reviewing documents)</option>
                      </>
                    )}
                    {selectedSubcategory === 'lease' && (
                      <>
                        <option value="primary">Landlord/Lessor (preparing documents)</option>
                        <option value="secondary">Tenant/Lessee (reviewing documents)</option>
                      </>
                    )}
                  </select>
                </div>
              </>
            )}

            {/* Hourly Rate Fields */}
            {currentService?.hasHourlyRate && (
              <>
                <div>
                  <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-2">
                    3. Lawyer&apos;s Experience Level
                  </label>
                  <select
                    value={hourlyLevel}
                    onChange={(e) => {
                      setHourlyLevel(e.target.value as 'associate' | 'seniorAssociate' | 'partner');
                      setShowResult(false);
                    }}
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition bg-white"
                  >
                    <option value="associate">Associate (0-6 years)</option>
                    <option value="seniorAssociate">Senior Associate (6-12 years)</option>
                    <option value="partner">Partner/SAN (12+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-2">
                    4. Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={hours}
                    onChange={(e) => {
                      setHours(Number(e.target.value) || 1);
                      setShowResult(false);
                    }}
                    className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition"
                  />
                </div>
              </>
            )}

            {/* Calculate Button */}
            <button
              onClick={calculateFee}
              disabled={currentService?.hasPropertyCalculation && propertyValue <= 0}
              className="w-full px-4 py-4 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate Minimum Fee
            </button>
          </div>
        </div>

        {/* Results */}
        {showResult && calculatedFee !== null && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 shadow-md mb-6 content-transition">
            <h3 className="text-lg font-bold font-[family-name:var(--font-khand)] text-green-800 mb-4">
              Fee Calculation Result
            </h3>
            
            <div className="bg-white rounded-xl p-4 border border-green-200 mb-4">
              <p className="text-3xl font-bold text-green-700 font-[family-name:var(--font-khand)]">
                {formatNaira(calculatedFee)}
              </p>
              <p className="text-sm text-green-600 mt-1">Minimum Fee</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-green-200">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Breakdown:</h4>
              <pre className="text-sm text-gray-700 font-[family-name:var(--font-inter)] whitespace-pre-wrap">
                {feeBreakdown}
              </pre>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> This is the <strong>minimum</strong> fee as prescribed by the Legal Practitioners Remuneration Order 2023. 
                Actual fees may be higher based on complexity, urgency, and other factors. Always discuss fees with your lawyer before engagement.
              </p>
            </div>
          </div>
        )}

        {/* State Bands Reference */}
        <div className="bg-white border-2 border-red-200 rounded-2xl overflow-hidden shadow-md mb-6">
          <div className="bg-red-600 text-white px-4 sm:px-6 py-4">
            <h2 className="text-lg font-bold font-[family-name:var(--font-khand)]">
              State Band Classifications
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {STATE_BANDS.map((bandInfo) => (
              <div key={bandInfo.band} className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-sm text-gray-900 mb-2">
                  State Band {bandInfo.band} {bandInfo.band === 3 ? '(Highest Fees)' : bandInfo.band === 1 ? '(Lowest Fees)' : ''}
                </h4>
                <p className="text-xs text-gray-600">
                  {bandInfo.states.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6 bg-red-50 rounded-2xl border border-red-200 content-transition">
          <h2 className="text-lg font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-3">
            About the Legal Practitioners Remuneration Order 2023
          </h2>
          <ul className="space-y-2 text-sm text-gray-700 font-[family-name:var(--font-inter)]">
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full mt-1 flex-shrink-0" />
              <span>Signed on <strong>16th May 2023</strong> by the Attorney-General of the Federation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full mt-1 flex-shrink-0" />
              <span>Sets <strong>minimum fees</strong> - lawyers cannot charge less than these amounts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full mt-1 flex-shrink-0" />
              <span>Fees vary by <strong>State Band</strong>, <strong>experience level</strong>, and <strong>service type</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full mt-1 flex-shrink-0" />
              <span>Charging below prescribed fees is <strong>unprofessional conduct</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full mt-1 flex-shrink-0" />
              <span>Additional costs (court fees, filing charges) are separate</span>
            </li>
          </ul>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/">
            <button className="px-6 py-3 text-red-600 font-bold text-sm hover:text-red-700">
              ← Back to Home
            </button>
          </Link>
        </div>
      </section>

      <div className="h-8" />
    </main>
  );
}
