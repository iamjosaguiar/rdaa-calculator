'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FormData,
  calculateHecsValues,
  calculateRuralGrants,
  calculateRegistrarPayments,
  calculateWIPMedicalValues,
  calculateWIPEmergencyValues,
  calculateWIPAdvancedSkillsValues,
  calculateSalarySupportValues,
  calculatePaidStudyLeaveValues,
} from '@/lib/calculations';

export default function Calculator() {
  const [formData, setFormData] = useState<FormData>({
    mmm: '',
    degreeLength: '',
    helpDebtBalance: '',
    professionalStatus: '',
    gpRegistrar: '',
    collegeType: '',
    trainingPathway: '',
    stateSalaried: '',
    vrGp: '',
    primaryCareDays: '',
    advancedSkill: '',
    selectedSkills: [],
    daysWorked: '',
    emergencyCare: '',
    emergencyServiceType: '',
    emergencyShifts: '',
  });

  const [results, setResults] = useState({
    helpReduction: [0, 0, 0, 0, 0, 0],
    ruralGrants: [0, 0, 0, 0, 0, 0],
    registrarPayments: [0, 0, 0, 0, 0, 0],
    salarySupport: [0, 0, 0, 0, 0, 0],
    paidStudyLeave: [0, 0, 0, 0, 0, 0],
    wipMedical: [0, 0, 0, 0, 0, 0],
    wipEmergency: [0, 0, 0, 0, 0, 0],
    wipAdvanced: [0, 0, 0, 0, 0, 0],
  });

  const [activeTab, setActiveTab] = useState('HELP');
  const [showReference, setShowReference] = useState(false);

  // Show advanced skills and emergency care questions for VR GP or Neither status
  const showAdvancedAndEmergency =
    (formData.professionalStatus === 'VR GP' || formData.professionalStatus === 'Neither');

  // Calculate all results
  const calculateResults = useCallback(() => {
    // HELP Reduction - only if 144+ days
    const helpReduction = formData.primaryCareDays === '144+'
      ? calculateHecsValues(
          formData.mmm,
          formData.helpDebtBalance,
          formData.degreeLength
        )
      : [0, 0, 0, 0, 0, 0];

    // Rural Grants
    const ruralGrants = calculateRuralGrants(
      formData.mmm,
      formData.selectedSkills,
      formData.emergencyServiceType
    );

    // Registrar Payments
    const registrarPayments = calculateRegistrarPayments(
      formData.mmm,
      formData.gpRegistrar,
      formData.collegeType,
      formData.trainingPathway
    );

    // Salary Support
    const salarySupport = calculateSalarySupportValues(
      formData.gpRegistrar,
      formData.collegeType,
      formData.trainingPathway,
      formData.stateSalaried
    );

    // Paid Study Leave
    const paidStudyLeave = calculatePaidStudyLeaveValues(
      formData.gpRegistrar,
      formData.collegeType,
      formData.trainingPathway,
      formData.stateSalaried
    );

    // WIP Medical
    const wipMedical = calculateWIPMedicalValues(
      formData.mmm,
      formData.gpRegistrar,
      formData.vrGp
    );

    // WIP Emergency
    const wipEmergency = calculateWIPEmergencyValues(
      formData.mmm,
      formData.emergencyCare,
      formData.emergencyServiceType,
      formData.emergencyShifts,
      formData.primaryCareDays
    );

    // WIP Advanced Skills
    const wipAdvanced = calculateWIPAdvancedSkillsValues(
      formData.mmm,
      formData.advancedSkill,
      formData.daysWorked,
      formData.primaryCareDays
    );

    setResults({
      helpReduction,
      ruralGrants,
      registrarPayments,
      salarySupport,
      paidStudyLeave,
      wipMedical,
      wipEmergency,
      wipAdvanced,
    });
  }, [formData]);

  // Update results when form changes
  useEffect(() => {
    if (formData.mmm && formData.primaryCareDays) {
      calculateResults();
    }
  }, [formData, calculateResults]);

  // Handle checkbox changes
  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        selectedSkills: [...formData.selectedSkills, skill],
      });
    } else {
      setFormData({
        ...formData,
        selectedSkills: formData.selectedSkills.filter((s) => s !== skill),
      });
    }
  };

  // Handle Professional Status change - automatically set gpRegistrar and vrGp for calculations
  const handleProfessionalStatusChange = (value: 'GP Registrar' | 'VR GP' | 'Neither' | '') => {
    setFormData({
      ...formData,
      professionalStatus: value,
      gpRegistrar: value === 'GP Registrar' ? 'Yes' : 'No',
      vrGp: value === 'VR GP' ? 'Yes' : 'No',
      // Reset dependent fields when status changes
      collegeType: value === 'GP Registrar' ? formData.collegeType : '',
      trainingPathway: value === 'GP Registrar' ? formData.trainingPathway : '',
      stateSalaried: value === 'GP Registrar' ? formData.stateSalaried : '',
    });
  };

  // Check if any additional sections beyond required questions are filled
  const hasAdditionalSections = () => {
    return (
      formData.helpDebtBalance !== '' || // Section 2: HELP Debt
      formData.professionalStatus !== '' || // Section 3: Professional Status & Practice Areas
      formData.advancedSkill !== '' || // Section 3: Advanced Skills
      formData.emergencyCare !== '' // Section 3: Emergency Care
    );
  };

  // Calculate totals
  const calculateYearTotal = (year: number) => {
    return (
      results.helpReduction[year] +
      results.ruralGrants[year] +
      results.registrarPayments[year] +
      results.salarySupport[year] +
      results.paidStudyLeave[year] +
      results.wipMedical[year] +
      results.wipEmergency[year] +
      results.wipAdvanced[year]
    );
  };

  const formatCurrency = (amount: number, grayOutZero = false) => {
    if (amount === 0 && grayOutZero) {
      return <span className="text-gray-400">—</span>;
    }
    return `$${Math.round(amount).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Skip to Results Link */}
      <a
        href="#results-section"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to results
      </a>

      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Rural Commonwealth Incentives Calculator
          </h1>
          <p className="text-gray-600">
            Calculate your eligibility for various rural healthcare incentive programs
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6" role="form" aria-label="Incentives Calculator Form">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Individual Circumstances
              </h2>
              <p className="text-gray-600 mb-4">
                Answer the questions below to define your circumstances.
              </p>

              {/* Info Banner */}
              <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded" role="alert" aria-live="polite">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Information">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Required:</strong> Questions 1, 2, and 3 <span className="text-red-500" aria-label="required">*</span> are required, then complete at least one additional section below to see your payment calculations. The results table updates automatically as you fill out the form.
                    </p>
                  </div>
                </div>
              </div>

              {/* Calculation Status */}
              {formData.mmm && formData.primaryCareDays && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3" role="status" aria-live="polite">
                  <div className="flex items-center text-sm text-green-800">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-label="Success">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Calculations active</span> - Check the Payment Eligibility Overview table
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {/* Section 1: Required - Location & Work Details */}
                <section className="pb-6 border-b-2 border-gray-200" aria-labelledby="section-required">
                  <h3 id="section-required" className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                    Required Information
                  </h3>
                  <div className="space-y-6">
                    {/* Q1: MMM */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="mmm-select">
                        Q1: What is the MMM for where you work? <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <select
                        id="mmm-select"
                        value={formData.mmm}
                        onChange={(e) => setFormData({ ...formData, mmm: e.target.value as any })}
                        required
                        aria-required="true"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formData.mmm ? 'border-green-300 bg-green-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select MMM</option>
                        <option value="MMM 1">MMM 1</option>
                        <option value="MMM 2">MMM 2</option>
                        <option value="MMM 3">MMM 3</option>
                        <option value="MMM 4">MMM 4</option>
                        <option value="MMM 5">MMM 5</option>
                        <option value="MMM 6">MMM 6</option>
                        <option value="MMM 7">MMM 7</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-600">Modified Monash Model - determines remoteness</p>
                    </div>

                    {/* Q2: Degree Length */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="degree-length-select">
                        Q2: How long was your medical degree? <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <select
                        id="degree-length-select"
                        value={formData.degreeLength}
                        onChange={(e) => setFormData({ ...formData, degreeLength: e.target.value as any })}
                        required
                        aria-required="true"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formData.degreeLength ? 'border-green-300 bg-green-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select duration</option>
                        <option value="4">4 years</option>
                        <option value="5">5 years</option>
                        <option value="6">6 years</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-600">Required for HELP debt reduction calculations</p>
                    </div>

                    {/* Q3: Primary Care Days */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="primary-care-days-select">
                        Q3: How many days per year do you work in primary care/general practice setting? <span className="text-red-500" aria-label="required">*</span>
                      </label>
                      <select
                        id="primary-care-days-select"
                        value={formData.primaryCareDays}
                        onChange={(e) => setFormData({ ...formData, primaryCareDays: e.target.value as any })}
                        required
                        aria-required="true"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formData.primaryCareDays ? 'border-green-300 bg-green-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select days</option>
                        <option value="47 or less">47 or less</option>
                        <option value="48-95">48-95</option>
                        <option value="96-143">96-143</option>
                        <option value="144+">144+</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-600">
                        Note: 144+ days required for HELP debt reduction and most WIP payments
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 2: HELP Debt Information */}
                <section className="pb-6 border-b-2 border-gray-200" aria-labelledby="section-help-debt">
                  <h3 id="section-help-debt" className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                    HELP Debt Information
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="help-debt-input">
                      Q4: What is the balance of your medical degree related HELP debt?
                    </label>
                    <input
                      id="help-debt-input"
                      type="number"
                      value={formData.helpDebtBalance}
                      onChange={(e) => setFormData({ ...formData, helpDebtBalance: e.target.value })}
                      disabled={!formData.degreeLength}
                      aria-disabled={!formData.degreeLength}
                      aria-describedby="help-debt-hint"
                      placeholder="Enter amount (e.g., 50000)"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        !formData.degreeLength ? 'bg-gray-100' : formData.helpDebtBalance ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                    />
                    <p id="help-debt-hint" className="mt-1 text-xs text-gray-600">
                      {!formData.degreeLength ? 'Select degree length first' : 'Leave blank if no HELP debt. Most medical degrees: $50,000-$150,000'}
                    </p>
                  </div>
                </section>

                {/* Section 3: Professional Status & Practice Areas */}
                <section aria-labelledby="section-professional">
                  <h3 id="section-professional" className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                    Professional Status & Practice Areas
                  </h3>
                  <div className="space-y-6">
                {/* Q4: Professional Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Q4: What is your current professional status?
                  </label>
                  <select
                    value={formData.professionalStatus}
                    onChange={(e) => handleProfessionalStatusChange(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Select your professional status"
                  >
                    <option value="">Select an option</option>
                    <option value="GP Registrar">GP Registrar or Rural Generalist Registrar</option>
                    <option value="VR GP">Vocationally Registered (VR) General Practitioner</option>
                    <option value="Neither">Neither / Other</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select "GP Registrar" if you're currently in training, "VR GP" if you're a fully qualified rural GP, or "Neither" if you don't fit these categories
                  </p>
                </div>

                {/* Conditional: GP Registrar Questions */}
                {formData.professionalStatus === 'GP Registrar' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Which College are you training with?
                      </label>
                      <select
                        value={formData.collegeType}
                        onChange={(e) => setFormData({ ...formData, collegeType: e.target.value as any, trainingPathway: '' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select College</option>
                        <option value="ACRRM">ACRRM</option>
                        <option value="RACGP">RACGP</option>
                      </select>
                    </div>

                    {/* Conditional: Training Pathway */}
                    {formData.collegeType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Which Training Pathway are you on?
                        </label>
                        <select
                          value={formData.trainingPathway}
                          onChange={(e) => setFormData({ ...formData, trainingPathway: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Training Pathway</option>
                          {formData.collegeType === 'ACRRM' ? (
                            <>
                              <option value="AGPT">AGPT</option>
                              <option value="RVTS">RVTS</option>
                              <option value="Independent">Independent</option>
                            </>
                          ) : (
                            <>
                              <option value="AGPT">AGPT</option>
                              <option value="RVTS">RVTS</option>
                              <option value="Fellowship Support">Fellowship Support</option>
                            </>
                          )}
                        </select>
                      </div>
                    )}

                    {/* Conditional: State Salaried Position - only for AGPT and RVTS */}
                    {(formData.trainingPathway === 'AGPT' || formData.trainingPathway === 'RVTS') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Are you employed in a state salaried position (including state SEM pilots) where you receive payment for study leave?
                        </label>
                        <select
                          value={formData.stateSalaried}
                          onChange={(e) => setFormData({ ...formData, stateSalaried: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select an option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional: VR GP / Neither - Advanced Skills */}
                {showAdvancedAndEmergency && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Q5: Do you have an advanced skill?
                      </label>
                      <select
                        value={formData.advancedSkill}
                        onChange={(e) => setFormData({ ...formData, advancedSkill: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    {/* Conditional: Skills Checkboxes */}
                    {formData.advancedSkill === 'Yes' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Which skills do you have?
                        </label>
                        {[
                          'Adult Internal Medicine',
                          'Anaesthesia',
                          'Aboriginal and Torres Strait Islander Health',
                          'Mental Health',
                          'Obstetrics and Gynaecology',
                          'Paediatrics and Child Health',
                          'Palliative Care',
                          'Remote Medicine',
                          'Surgery',
                          'Small Town Rural General Practice',
                        ].map((skill) => (
                          <label key={skill} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.selectedSkills.includes(skill)}
                              onChange={(e) => handleSkillChange(skill, e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{skill}</span>
                          </label>
                        ))}

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            How many days per year do you work in your area of advanced skill/s?
                          </label>
                          <select
                            value={formData.daysWorked}
                            onChange={(e) => setFormData({ ...formData, daysWorked: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select days</option>
                            <option value="1-10 days">1-10 days</option>
                            <option value="11-20 days">11-21 days</option>
                            <option value="22-47 days">22-47 days</option>
                            <option value="48+ days">48+ days</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional: VR GP / Neither - Emergency Care */}
                {showAdvancedAndEmergency && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Q6: Do you provide emergency care?
                      </label>
                      <select
                        value={formData.emergencyCare}
                        onChange={(e) => setFormData({ ...formData, emergencyCare: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    {formData.emergencyCare === 'Yes' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Is this service Medical or Mental Health related?
                          </label>
                          <select
                            value={formData.emergencyServiceType}
                            onChange={(e) => setFormData({ ...formData, emergencyServiceType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Type</option>
                            <option value="Medical">Medical</option>
                            <option value="Mental Health">Mental Health</option>
                            <option value="Both">Both</option>
                          </select>
                        </div>

                        {(formData.emergencyServiceType === 'Medical' || formData.emergencyServiceType === 'Both') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              How many emergency shifts per year?
                            </label>
                            <select
                              value={formData.emergencyShifts}
                              onChange={(e) => setFormData({ ...formData, emergencyShifts: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select range</option>
                              <option value="1-10">1-10 days</option>
                              <option value="11-21">11-21 days</option>
                              <option value="22-47">22-47 days</option>
                              <option value="48+">48+ days</option>
                            </select>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-3 lg:sticky lg:top-8 lg:self-start space-y-6" id="results-section">
            {/* Summary Card */}
            {formData.mmm && formData.primaryCareDays && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-2">Total 6-Year Eligibility</h2>
                <div className="text-4xl font-bold mb-1">
                  {formatCurrency([0, 1, 2, 3, 4, 5].reduce((sum, year) => sum + calculateYearTotal(year), 0))}
                </div>
                <p className="text-blue-100 text-sm">
                  Across {[results.helpReduction, results.ruralGrants, results.registrarPayments, results.salarySupport, results.paidStudyLeave, results.wipMedical, results.wipEmergency, results.wipAdvanced].filter(category => category.some(val => val > 0)).length} payment types
                </p>
              </div>
            )}

            {/* Secondary Prompt - Shown when required questions are answered but no additional sections */}
            {formData.mmm && formData.degreeLength && formData.primaryCareDays && !hasAdditionalSections() && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 animate-fadeIn">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Great! Required questions completed</h3>
                    <p className="text-gray-700 mb-3">
                      Now answer questions in at least one section below to see your payment eligibility:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                        <span><strong>HELP Debt Information</strong> - for debt reduction calculations</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                        <span><strong>Professional Status & Practice Areas</strong> - for registrar payments, salary support, rural grants, and WIP payments</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow-lg p-6 relative" role="region" aria-labelledby="results-heading">
              <h2 id="results-heading" className="text-2xl font-semibold text-gray-900 mb-4">
                Payment Eligibility Overview
              </h2>
              <p className="text-gray-600 mb-6">
                Summary of payments you are eligible for based on your answers.
              </p>

              {/* Empty State Overlay */}
              {(!formData.mmm || !formData.primaryCareDays) && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center p-8">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Start with Required Questions</h3>
                    <p className="text-gray-600 max-w-sm">
                      Answer Questions 1, 2, and 3, then complete at least one additional section to see your payment eligibility calculations
                    </p>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Category
                      </th>
                      {[1, 2, 3, 4, 5, 6].map((year) => (
                        <th key={year} className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                          Year {year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">HELP Reduction</td>
                      {results.helpReduction.map((value, idx) => (
                        <td key={idx} className="px-4 py-3 text-sm text-center text-gray-700">
                          {formatCurrency(value)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Rural Grants</td>
                      {results.ruralGrants.map((value, idx) => (
                        <td key={idx} className="px-4 py-3 text-sm text-center text-gray-700">
                          {formatCurrency(value)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Registrar Payments</td>
                      {results.registrarPayments.map((value, idx) => (
                        <td key={idx} className="px-4 py-3 text-sm text-center text-gray-700">
                          {formatCurrency(value)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Salary Support</td>
                      {results.salarySupport.map((value, idx) => (
                        <td key={idx} className="px-4 py-3 text-sm text-center text-gray-700">
                          {formatCurrency(value)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Paid Study Leave</td>
                      {results.paidStudyLeave.map((value, idx) => (
                        <td key={idx} className="px-4 py-3 text-sm text-center text-gray-700">
                          {formatCurrency(value)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">WIP Doctor Stream</td>
                      {results.wipMedical.map((value, idx) => (
                        <td key={idx} className="px-4 py-3 text-sm text-center text-gray-700">
                          {formatCurrency(value)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">WIP Emergency Stream</td>
                      {results.wipEmergency.map((value, idx) => (
                        <td key={idx} className="px-4 py-3 text-sm text-center text-gray-700">
                          {formatCurrency(value)}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">WIP Advanced Skills</td>
                      {results.wipAdvanced.map((value, idx) => (
                        <td key={idx} className="px-4 py-3 text-sm text-center text-gray-700">
                          {formatCurrency(value)}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-200 border-t-2 border-gray-300">
                      <td className="px-4 py-4 text-base font-bold text-gray-900">Total</td>
                      {[0, 1, 2, 3, 4, 5].map((year) => (
                        <td key={year} className="px-4 py-4 text-base text-center font-bold text-gray-900">
                          {formatCurrency(calculateYearTotal(year))}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Reference Tables */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Payment Calculation Reference</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    View detailed payment amounts by MMM location, training pathway, and other factors.
                  </p>
                </div>
                <button
                  onClick={() => setShowReference(!showReference)}
                  aria-expanded={showReference}
                  aria-controls="reference-content"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {showReference ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Hide
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show
                    </>
                  )}
                </button>
              </div>

              {showReference && (
                <div id="reference-content">
              <div className="flex overflow-x-auto gap-2 mb-6 pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" role="tablist" aria-label="Payment types">
                {[
                  { label: 'HELP Reduction', key: 'HELP' },
                  { label: 'Rural Grants', key: 'Rural' },
                  { label: 'Registrar Payments', key: 'Registrar' },
                  { label: 'WIP Doctor Stream', key: 'WIPMedical' },
                  { label: 'WIP RAS Emerg Stream', key: 'WIPEmergency' },
                  { label: 'WIP RAS Adv Skills', key: 'WIPAdvanced' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    aria-controls={`panel-${tab.key}`}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition duration-200 text-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg overflow-x-auto" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
                {activeTab === 'HELP' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">HELP Reduction</h3>

                    <h4 className="font-semibold mb-2">Table 1: 6-Year Degree</h4>
                    <table className="min-w-full mb-6 text-sm border border-gray-300">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2">MMM</th>
                          <th className="border border-gray-300 px-3 py-2">Year 1</th>
                          <th className="border border-gray-300 px-3 py-2">Year 2</th>
                          <th className="border border-gray-300 px-3 py-2">Year 3</th>
                          <th className="border border-gray-300 px-3 py-2">Year 4</th>
                          <th className="border border-gray-300 px-3 py-2">Year 5</th>
                          <th className="border border-gray-300 px-3 py-2">Year 6</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 1-2</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 3-5</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">50%</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">50%</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 6-7</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">N/A</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">1.5 years = 50%*</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">50%</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">N/A</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">N/A</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">N/A</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-sm text-gray-600 mb-6">* 1.5 years (18 months) RoS in an eligible MMM 6-7 location equates to a 50% HELP reduction.</p>

                    <h4 className="font-semibold mb-2">Table 2: 4-Year Degree</h4>
                    <table className="min-w-full text-sm border border-gray-300">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2">MMM</th>
                          <th className="border border-gray-300 px-3 py-2">Year 1</th>
                          <th className="border border-gray-300 px-3 py-2">Year 2</th>
                          <th className="border border-gray-300 px-3 py-2">Year 3</th>
                          <th className="border border-gray-300 px-3 py-2">Year 4</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 1-2</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 3-5</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">50%</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">50%</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 6-7</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">50%</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">50%</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">N/A</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">N/A</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'Rural' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Rural Grants</h3>
                    <table className="min-w-full text-sm border border-gray-300">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2"></th>
                          <th className="border border-gray-300 px-3 py-2">Obstetrics</th>
                          <th className="border border-gray-300 px-3 py-2">Surgery</th>
                          <th className="border border-gray-300 px-3 py-2">Anaesthetics</th>
                          <th className="border border-gray-300 px-3 py-2">Em. Medicine</th>
                          <th className="border border-gray-300 px-3 py-2">Em. Mental Health</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 1</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 2</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 3</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 4</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 5</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 6</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 7</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'Registrar' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Registrar Payments</h3>

                    <h4 className="font-semibold mb-2">ACRRM Payments</h4>
                    <table className="min-w-full mb-6 text-sm border border-gray-300">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2">MMM</th>
                          <th className="border border-gray-300 px-3 py-2">AGPT (Yr 1 / Yr 2)</th>
                          <th className="border border-gray-300 px-3 py-2">RVTS</th>
                          <th className="border border-gray-300 px-3 py-2">Independent</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 1</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0 / $0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 2</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$3,675.60 / $3,675.60</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 3</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,993.86 / $6,993.86</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 4</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,993.86 / $6,993.86</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 5</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$9,822.02 / $9,822.02</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 6</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$18,888.50 / $18,888.50</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 7</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$18,888.50 / $18,888.50</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-sm text-gray-600 mb-6">
                      <strong>Note:</strong> Salary Support ($30,000 Year 1) available for AGPT and RVTS trainees. Paid Study Leave payments available for AGPT and RVTS trainees not in state salaried positions.
                    </p>

                    <h4 className="font-semibold mb-2">RACGP Payments</h4>
                    <table className="min-w-full text-sm border border-gray-300">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2">MMM</th>
                          <th className="border border-gray-300 px-3 py-2">AGPT</th>
                          <th className="border border-gray-300 px-3 py-2">RVTS</th>
                          <th className="border border-gray-300 px-3 py-2">Fellowship Support</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 1</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 2</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$3,675.60</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 3</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,993.86</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 4</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,993.86</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 5</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$9,822.02</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 6</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$18,888.50</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 7</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$18,888.50</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">All expenses covered</td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">Private entity</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-sm text-gray-600 mt-4">
                      <strong>Paid Study Leave (non-state salaried):</strong><br/>
                      AGPT Trainees: Year 1 $2,587.42 | Year 2 $2,762.98<br/>
                      RVTS Trainees: Year 1 $2,446.44 | Year 2 $2,762.98
                    </p>
                  </div>
                )}

                {activeTab === 'WIPMedical' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">WIP Medical Stream</h3>

                    <h4 className="font-semibold mb-2">Registrar or VR GP: Yes</h4>
                    <table className="min-w-full mb-6 text-sm border border-gray-300">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2">MMM</th>
                          <th className="border border-gray-300 px-3 py-2">Year 1</th>
                          <th className="border border-gray-300 px-3 py-2">Year 2</th>
                          <th className="border border-gray-300 px-3 py-2">Year 3</th>
                          <th className="border border-gray-300 px-3 py-2">Year 4</th>
                          <th className="border border-gray-300 px-3 py-2">Year 5+</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 1</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 2</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 3</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$4,500</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$7,500</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$7,500</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$12,000</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 4</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$8,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$13,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$13,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$18,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 5</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$12,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$17,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$17,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$23,000</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 6</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$16,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$16,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$25,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$25,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$35,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 7</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$25,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$25,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$35,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$35,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$60,000</td>
                        </tr>
                      </tbody>
                    </table>

                    <h4 className="font-semibold mb-2">Registrar or VR GP: No</h4>
                    <table className="min-w-full text-sm border border-gray-300">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2">MMM</th>
                          <th className="border border-gray-300 px-3 py-2">Year 1</th>
                          <th className="border border-gray-300 px-3 py-2">Year 2</th>
                          <th className="border border-gray-300 px-3 py-2">Year 3</th>
                          <th className="border border-gray-300 px-3 py-2">Year 4</th>
                          <th className="border border-gray-300 px-3 py-2">Year 5+</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 1</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 2</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 3</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$3,600</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$9,600</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 4</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$6,400</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$10,400</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$10,400</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$14,400</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 5</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$9,600</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$13,600</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$13,600</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$18,400</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 6</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$12,800</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$12,800</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$28,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 7</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$20,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$28,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$28,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$48,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'WIPEmergency' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">WIP Emergency Stream</h3>
                    <table className="min-w-full text-sm border border-gray-300">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2"></th>
                          <th className="border border-gray-300 px-3 py-2">1-10 days</th>
                          <th className="border border-gray-300 px-3 py-2">11-21 days</th>
                          <th className="border border-gray-300 px-3 py-2">22-47 days</th>
                          <th className="border border-gray-300 px-3 py-2">48+ days</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 1-2</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 3</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$4,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$4,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$4,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 4-5</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$5,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$7,500</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$9,500</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 6-7</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$9,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$10,500</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$10,500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'WIPAdvanced' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">WIP Advanced Skills Stream</h3>
                    <table className="min-w-full text-sm border border-gray-300">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="border border-gray-300 px-3 py-2"></th>
                          <th className="border border-gray-300 px-3 py-2">1-10 days</th>
                          <th className="border border-gray-300 px-3 py-2">11-21 days</th>
                          <th className="border border-gray-300 px-3 py-2">22-47 days</th>
                          <th className="border border-gray-300 px-3 py-2">48+ days</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 1-2</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 3</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$4,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$4,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$4,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 4-5</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$5,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$7,500</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$9,500</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-medium">MMM 6-7</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$0</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$9,000</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$10,500</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">$10,500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 text-sm">
          <div className="max-w-4xl mx-auto px-4 py-6 border-t border-gray-300">
            <p className="mb-2">
              <strong>Rural Commonwealth Incentives Calculator</strong> | Version 2.0
            </p>
            <p className="mb-2">
              Payment amounts current as of January 2025
            </p>
            <p className="text-xs text-gray-500">
              This calculator provides estimates only. Actual eligibility and payment amounts may vary based on individual circumstances and program requirements.
              For official information, please consult the relevant government departments.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
