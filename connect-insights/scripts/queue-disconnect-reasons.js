const data = require("./weekly.json");

// get the data from CTR denormalized

const disconnectReason = {};

for (let counter = 0; counter < data.length; counter++) {
  const current = data[counter];

  if (current.queue_name && current.channel) {
    if (disconnectReason[current.disconnectreason]) {
      disconnectReason[current.disconnectreason] = disconnectReason[current.disconnectreason] + 1;
    } else {
      disconnectReason[current.disconnectreason] = 1;
    }
  }
}

console.log(`Queue disconnect reason counts `, disconnectReason);


