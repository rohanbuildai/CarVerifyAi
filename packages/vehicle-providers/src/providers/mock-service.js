/**
 * @fileoverview Mock service record provider.
 */

const mockServiceProvider = {
  name: 'mock-service',
  type: 'service',

  async fetch({ queryInput }) {
    await new Promise((r) => setTimeout(r, 250 + Math.random() * 500));

    return {
      data: {
        records: [
          { serviceType: 'regular', description: 'Oil change + filter replacement', serviceDate: '2020-03-10', odometerKm: 15000, cost: 3500 },
          { serviceType: 'regular', description: 'Full service including brake pads', serviceDate: '2021-02-20', odometerKm: 30000, cost: 8500 },
          { serviceType: 'repair', description: 'AC compressor replacement', serviceDate: '2022-06-15', odometerKm: 48000, cost: 18000 },
          { serviceType: 'regular', description: 'Annual service + tire rotation', serviceDate: '2023-01-05', odometerKm: 62000, cost: 6000 },
        ],
      },
      confidence: 0.6,
    };
  },
};

module.exports = { mockServiceProvider };
