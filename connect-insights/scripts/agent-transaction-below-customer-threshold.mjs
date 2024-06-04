import AmazonConnectHelper from "../amazonConnectHelper.js";
import prompt from "async-prompt";

const amazonConnectHelper = new AmazonConnectHelper('http://wickesinsights-710907117.eu-west-2.elb.amazonaws.com/api');

(async function main() {
  const email = await prompt('Enter the email address');

  const ctrDenormalizedResponse = await amazonConnectHelper.getCTRDenormalizedHelper({
    startDateTime: "",
    endDateTime: "",
  });

  const desiredRecord = ctrDenormalizedResponse.find(_d => _d.agent_username === email);

  const contactLensResponse = await amazonConnectHelper.getContactLensDenormalizedHelper({
    startDate: "",
    endDate: "",
  });

  const contactLensRecord = contactLensResponse.find(_d => _d.contactid === desiredRecord.contactid);

  console.log(`Sentiment is ${contactLensRecord.agent_sentiment}`);
})();