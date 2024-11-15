const data = require("./weekly.json");

// get the data from CTR denormalized

const finalData = {
  INBOUND_SELF_SERVICED: 0,
  INBOUND_TRANSFERRED_TO_AGENT: 0,
  OUTBOUND: 0
};

for (let counter = 0; counter < data.length; counter++) {
  const current = data[counter];

  if (!current.queue_name && current.initiationmethod === "INBOUND") {
    finalData["INBOUND_SELF_SERVICED"] = finalData["INBOUND_SELF_SERVICED"] + 1;
  }

  if (current.queue_name && current.initiationmethod === "OUTBOUND") {
    finalData["OUTBOUND"] = finalData["OUTBOUND"] + 1;
  }

  if (current.queue_name && current.initiationmethod === "INBOUND") {
    finalData["INBOUND_TRANSFERRED_TO_AGENT"] = finalData["INBOUND_TRANSFERRED_TO_AGENT"] + 1;
  }
}

console.log(`Queue disconnect reason counts `, finalData);


