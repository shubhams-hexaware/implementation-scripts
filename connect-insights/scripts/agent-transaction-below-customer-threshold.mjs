import AmazonConnectHelper from "../helpers/amazonConnectHelper.js";

const amazonConnectHelper = new AmazonConnectHelper('http://luminareinsights-1062819735.us-east-1.elb.amazonaws.com/api');

(async function main() {
  const email = '1000067752@hexaware.com';

  const ctrDenormalizedResponse = await amazonConnectHelper.getCTRDenormalizedHelper({
    startDateTime: "2024-05-10 00:00:00",
    endDateTime: "2024-05-16 23:59:59",
  });

  const contactIds = ctrDenormalizedResponse.filter(_d => _d.queue_name && _d.channel && _d.agent_username === email)
    .map(_d => _d.contactid);

  const contactLensResponse = await amazonConnectHelper.getContactLensDenormalizedHelper({
    startDate: "2024-05-10",
    endDate: "2024-05-16",
  });

  let total = 0;
  for (let counter = 0; counter < contactIds.length; counter++) {
    const current = contactIds[counter];
    const callRecord = contactLensResponse.find(_d => _d.contactid === current);
    if (callRecord && callRecord.agent_sentiment > 0 && callRecord.agent_sentiment <= 2) {
      total++;
    }
  }

  console.log(`Total records below threshold for ${email} is ${total}`);
})();