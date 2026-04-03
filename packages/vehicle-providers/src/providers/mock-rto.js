/**
 * @fileoverview Mock RTO/Vahan provider for development and testing.
 */

const MOCK_VEHICLES = {
  'MH02AB1234': { make: 'Maruti Suzuki', model: 'Swift', year: 2019, fuelType: 'Petrol', color: 'White', engineCapacityCc: 1197, bodyType: 'Hatchback', state: 'Maharashtra', rtoCode: 'MH02', owners: [ { ownerIndex: 1, ownerType: 'individual', state: 'Maharashtra', city: 'Mumbai', transferDate: '2019-03-15' }, { ownerIndex: 2, ownerType: 'individual', state: 'Maharashtra', city: 'Pune', transferDate: '2022-07-20' } ] },
  'DL01CD5678': { make: 'Hyundai', model: 'Creta', year: 2020, fuelType: 'Diesel', color: 'Blue', engineCapacityCc: 1493, bodyType: 'SUV', state: 'Delhi', rtoCode: 'DL01', owners: [ { ownerIndex: 1, ownerType: 'individual', state: 'Delhi', city: 'New Delhi', transferDate: '2020-01-10' } ] },
};

const mockRtoProvider = {
  name: 'mock-rto',
  type: 'rto',

  /** @param {{ queryInput: string, queryType: string }} params */
  async fetch({ queryInput }) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 500));

    const vehicle = MOCK_VEHICLES[queryInput];
    if (vehicle) {
      return { data: vehicle, confidence: 0.85 };
    }

    // Generate realistic mock data for unknown vehicles
    return {
      data: {
        make: 'Unknown', model: 'Sedan', year: 2018, fuelType: 'Petrol',
        color: 'Silver', engineCapacityCc: 1200, bodyType: 'Sedan',
        state: queryInput.slice(0, 2), rtoCode: queryInput.slice(0, 4),
        owners: [
          { ownerIndex: 1, ownerType: 'individual', state: 'Unknown', transferDate: '2018-06-01' },
          { ownerIndex: 2, ownerType: 'individual', state: 'Unknown', transferDate: '2021-03-15' },
          { ownerIndex: 3, ownerType: 'individual', state: 'Unknown', transferDate: '2023-11-01' },
        ],
      },
      confidence: 0.5,
    };
  },
};

module.exports = { mockRtoProvider };
