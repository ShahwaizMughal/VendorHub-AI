/**
 * Adapter for the team's shared AI Service Layer.
 * Developer 6 can replace the internals while the RFQ module keeps the same contract.
 */
async function rankVendors() {
  throw new Error("Shared AI vendor matching service is not configured");
}

async function recommendQuote() {
  throw new Error("Shared AI quote recommendation service is not configured");
}

module.exports = { rankVendors, recommendQuote };
