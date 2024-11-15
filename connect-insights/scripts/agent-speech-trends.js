import AmazonConnectHelper from "../amazonConnectHelper.js";
import prompt from "async-prompt";

const amazonConnectHelper = new AmazonConnectHelper('http://wickesinsights-710907117.eu-west-2.elb.amazonaws.com/api');

(async function main() {
  const ctrDenormalizedResponse = await amazonConnectHelper.getCTRDenormalizedHelper({
    startDateTime: "",
    endDateTime: "",
  });

  const contactIds = ctrDenormalizedResponse.map(_data => _data.contactid);


})();