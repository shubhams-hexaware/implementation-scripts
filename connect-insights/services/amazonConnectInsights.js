const httpClient = require('../utils/httpClient');

async function getCTRDenormalizedService({ startTimestamp, endTimestamp, queueName }) {
  const payload = { startTimestamp, endTimestamp };

  if (queueName) {
    payload.queueName = queueName;
  }

  return await httpClient.post(
    '/historical-stats/ctr-denormalized',
    payload,
  );
}

async function getAgentLoginLogoutService({ }) {}

async function getContactLensConsolidatedDataService() {}

async function getContactLensDenormalizedService() {}