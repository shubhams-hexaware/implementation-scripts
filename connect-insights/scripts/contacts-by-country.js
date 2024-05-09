const data = require("./weekly.json");
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

// get the data from CTR denormalized

const finalData = {};

for (let counter = 0; counter < data.length; counter++) {
  const current = data[counter];

  if (current.queue_name && current.channel) {
    const customerAddress = current.customerendpoint_address;
    try {
      const number = phoneUtil.parseAndKeepRawInput(customerAddress);
      const regionCode = phoneUtil.getRegionCodeForNumber(number);
      if (finalData[regionCode]) {
        finalData[regionCode] = finalData[regionCode] + 1;
      } else {
        finalData[regionCode] = 1;
      }
    } catch (e) {
      // do nothing
    }

  }
}

console.log(`Contacts by Country counts `, finalData);


