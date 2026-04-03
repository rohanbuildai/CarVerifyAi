/**
 * @fileoverview Mock parts pricing provider.
 */

const mockPartsProvider = {
  name: 'mock-parts',
  type: 'parts',

  async fetch({ queryInput }) {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));

    return {
      data: {
        parts: [
          { partName: 'Brake Pads (Front)', category: 'suspension', oemPriceInr: 3200, aftermktPrice: 1800, avgLifeKm: 40000 },
          { partName: 'Clutch Plate', category: 'engine', oemPriceInr: 5500, aftermktPrice: 3000, avgLifeKm: 60000 },
          { partName: 'Battery (55Ah)', category: 'electrical', oemPriceInr: 7000, aftermktPrice: 4500, avgLifeKm: 50000 },
          { partName: 'Timing Belt', category: 'engine', oemPriceInr: 4000, aftermktPrice: 2200, avgLifeKm: 80000 },
          { partName: 'AC Compressor', category: 'electrical', oemPriceInr: 22000, aftermktPrice: 12000, avgLifeKm: 100000 },
          { partName: 'Radiator', category: 'engine', oemPriceInr: 8500, aftermktPrice: 4500, avgLifeKm: 120000 },
          { partName: 'Shock Absorbers (Pair)', category: 'suspension', oemPriceInr: 6000, aftermktPrice: 3500, avgLifeKm: 80000 },
        ],
      },
      confidence: 0.75,
    };
  },
};

module.exports = { mockPartsProvider };
