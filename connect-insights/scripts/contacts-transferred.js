const data = require("./weekly.json");

// get the data from CTR denormalized

let contactsTransferredCount = 0;

for (let counter = 0; counter < data.length; counter++) {
  const current = data[counter];
  const contactId = current.contactid;
  const nextContactId = data.find(_data => _data.nextcontactid === contactId);

  if (current.initiationmethod === "TRANSFER" && nextContactId) {
    console.log(contactId, nextContactId);
    contactsTransferredCount++;
  }
}

console.log(`Number of contacts transferred is `, contactsTransferredCount);
