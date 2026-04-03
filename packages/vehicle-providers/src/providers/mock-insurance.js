/**
 * @fileoverview Mock insurance claim provider.
 */

const mockInsuranceProvider = {
  name: 'mock-insurance',
  type: 'insurance',

  async fetch({ queryInput }) {
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));

    // Simulate varying insurance claim data
    const hash = queryInput.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const hasClaims = hash % 3 !== 0;

    if (!hasClaims) {
      return { data: { claims: [] }, confidence: 0.7 };
    }

    const claims = [];
    if (hash % 5 === 0) {
      claims.push({ claimType: 'accident', severity: 'major', claimDate: '2021-08-15', claimAmount: 85000, settled: true });
    }
    if (hash % 7 === 0) {
      claims.push({ claimType: 'accident', severity: 'minor', claimDate: '2022-12-03', claimAmount: 15000, settled: true });
    }
    if (hash % 11 === 0) {
      claims.push({ claimType: 'flood', severity: 'moderate', claimDate: '2023-07-20', claimAmount: 45000, settled: false });
    }
    if (claims.length === 0) {
      claims.push({ claimType: 'accident', severity: 'minor', claimDate: '2022-05-10', claimAmount: 12000, settled: true });
    }

    return { data: { claims }, confidence: 0.65 };
  },
};

module.exports = { mockInsuranceProvider };
