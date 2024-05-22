import AmazonConnectHelper from "../helpers/amazonConnectHelper.js";

const amazonConnectHelper = new AmazonConnectHelper('http://luminareinsights-1062819735.us-east-1.elb.amazonaws.com/api');

const SENTIMENT_KEY = 'customer_sentiment';

(async function main() {
  const ctrDenormalizedResponse = await amazonConnectHelper.getCTRDenormalizedHelper({
    startDateTime: '2024-05-11 00:00:00',
    endDateTime: '2024-05-11 23:59:59',
  });

  const filteredCtrResponse = ctrDenormalizedResponse.filter(_data =>
    _data.queue_name && _data.channel && (_data.connectedtosystemtimestamp || _data.initiationtimestamp));

  const contactLensResponse = await amazonConnectHelper.getContactLensDenormalizedHelper({
    startDate: '2024-05-11',
    endDate: '2024-05-11',
  });

  let sentiment = 0;
  let recordsConsidered = 0;
  for (let counter = 0; counter < filteredCtrResponse.length; counter++) {
    const current = filteredCtrResponse[counter];
    const contactId = current.contactid;

    const contactLensRecord = contactLensResponse.find(_data => _data.contactid === contactId);

    if (contactLensRecord && contactLensRecord[SENTIMENT_KEY] && contactLensRecord[SENTIMENT_KEY] !== 0) {
      sentiment += contactLensRecord[SENTIMENT_KEY];
      recordsConsidered++;
    }
  }

  console.log(`total sentiment is ${sentiment}`);
  console.log(`total records considered is ${recordsConsidered}`);
  console.log(`average ${SENTIMENT_KEY} is ${sentiment / recordsConsidered}`);
})();