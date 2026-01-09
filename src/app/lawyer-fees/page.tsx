'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LawyerFeesPage() {
  const [selectedState, setSelectedState] = useState('Lagos');

  const nigerianStates = [
    'Lagos',
    'Abuja',
    'Oyo',
    'Kano',
    'Rivers',
    'Kaduna',
    'Katsina',
    'Enugu',
    'Edo',
    'Osun',
    'Bauchi',
    'Benue',
    'Jigawa',
    'Kebbi',
    'Kwara',
    'Niger',
    'Plateau',
    'Taraba',
    'Yobe',
    'Zamfara',
    'Adamawa',
    'Abia',
    'Akwa Ibom',
    'Anambra',
    'Bayelsa',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Imo',
    'Ondo',
    'Ogun',
    'Sokoto',
    'Ekiti',
    'Nasarawa',
  ];

  // Sample fee structure - in production this would come from a database
  const feeStructure: { [key: string]: { transaction: string; minFee: string; maxFee: string }[] } = {
    'Lagos': [
      { transaction: 'Will Preparation & Probate', minFee: '₦50,000', maxFee: '₦150,000' },
      { transaction: 'Property/Real Estate Transaction', minFee: '₦100,000', maxFee: '₦500,000' },
      { transaction: 'Divorce/Family Matters', minFee: '₦75,000', maxFee: '₦250,000' },
      { transaction: 'Contract Drafting', minFee: '₦25,000', maxFee: '₦100,000' },
      { transaction: 'Employment Law Consultation', minFee: '₦30,000', maxFee: '₦100,000' },
      { transaction: 'Company Incorporation', minFee: '₦60,000', maxFee: '₦200,000' },
      { transaction: 'Litigation (per appearance)', minFee: '₦50,000', maxFee: '₦300,000' },
      { transaction: 'IP/Trademark Registration', minFee: '₦40,000', maxFee: '₦150,000' },
    ],
    'Abuja': [
      { transaction: 'Will Preparation & Probate', minFee: '₦45,000', maxFee: '₦130,000' },
      { transaction: 'Property/Real Estate Transaction', minFee: '₦80,000', maxFee: '₦400,000' },
      { transaction: 'Divorce/Family Matters', minFee: '₦60,000', maxFee: '₦200,000' },
      { transaction: 'Contract Drafting', minFee: '₦20,000', maxFee: '₦80,000' },
      { transaction: 'Employment Law Consultation', minFee: '₦25,000', maxFee: '₦80,000' },
      { transaction: 'Company Incorporation', minFee: '₦50,000', maxFee: '₦150,000' },
      { transaction: 'Litigation (per appearance)', minFee: '₦40,000', maxFee: '₦250,000' },
      { transaction: 'IP/Trademark Registration', minFee: '₦35,000', maxFee: '₦120,000' },
    ],
    'default': [
      { transaction: 'Will Preparation & Probate', minFee: '₦40,000', maxFee: '₦120,000' },
      { transaction: 'Property/Real Estate Transaction', minFee: '₦70,000', maxFee: '₦350,000' },
      { transaction: 'Divorce/Family Matters', minFee: '₦50,000', maxFee: '₦180,000' },
      { transaction: 'Contract Drafting', minFee: '₦15,000', maxFee: '₦70,000' },
      { transaction: 'Employment Law Consultation', minFee: '₦20,000', maxFee: '₦70,000' },
      { transaction: 'Company Incorporation', minFee: '₦40,000', maxFee: '₦130,000' },
      { transaction: 'Litigation (per appearance)', minFee: '₦30,000', maxFee: '₦200,000' },
      { transaction: 'IP/Trademark Registration', minFee: '₦30,000', maxFee: '₦100,000' },
    ],
  };

  const currentFees = feeStructure[selectedState] || feeStructure['default'];

  return (
    <main className="min-h-screen bg-white page-transition-enter">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-8 rounded-b-3xl shadow-lg content-transition">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-khand)] mb-2">
            Lawyer Fee Guidelines
          </h1>
          <p className="text-red-100 text-sm sm:text-base font-[family-name:var(--font-inter)]">
            Minimum expected chargeable fees by jurisdiction
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
        {/* State Selector */}
        <div className="mb-8">
          <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-3">
            Select State
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition bg-white"
          >
            {nigerianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Fee Table */}
        <div className="bg-white border-2 border-red-200 rounded-2xl overflow-hidden shadow-md content-transition">
          {/* Table Header */}
          <div className="bg-red-600 text-white px-4 sm:px-6 py-4">
            <h2 className="text-lg font-bold font-[family-name:var(--font-khand)]">
              Fee Structure for {selectedState}
            </h2>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-red-100 bg-red-50">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-900 font-[family-name:var(--font-khand)]">
                    Service Type
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-gray-900 font-[family-name:var(--font-khand)]">
                    Minimum Fee
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-gray-900 font-[family-name:var(--font-khand)]">
                    Maximum Fee
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentFees.map((fee, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-200 hover:bg-red-50 transition ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 font-[family-name:var(--font-inter)] font-semibold">
                      {fee.transaction}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 font-[family-name:var(--font-inter)] text-right">
                      {fee.minFee}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 font-[family-name:var(--font-inter)] text-right font-bold text-red-600">
                      {fee.maxFee}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-200 content-transition">
          <h2 className="text-lg font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-3">
            Important Notes
          </h2>
          <ul className="space-y-2 text-sm text-gray-700 font-[family-name:var(--font-inter)]">
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full mt-1 flex-shrink-0" />
              <span>These are <strong>minimum expected</strong> chargeable fees set by professional bodies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full mt-1 flex-shrink-0" />
              <span>Actual fees may vary based on complexity and experience of the lawyer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full mt-1 flex-shrink-0" />
              <span>Always discuss fees with your lawyer before engaging their services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full mt-1 flex-shrink-0" />
              <span>Some services may require additional costs (court fees, filing charges, etc.)</span>
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
