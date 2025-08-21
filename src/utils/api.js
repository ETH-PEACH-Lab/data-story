const BIN_ID = "68a4305ed0ea881f405d34c8";
const ACCESS_KEY = "$2a$10$oUEWVMQNpfuMwMgYuwOrM.PKWw3XuZh..5RbeMhlSUePigOg5ZC1u";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export const logActivity = (newEntry) => {
  return fetch(`${BIN_URL}/latest`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
  .then(response => response.json())
  .then(data => {
    const currentBin = data.record;       
		console.log(data)
    currentBin.log.push(newEntry);       
    return currentBin;
  })
  .then(updatedBin => {
    return fetch(BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Key": ACCESS_KEY        
      },
      body: JSON.stringify(updatedBin)
    });
  })
  .then(response => response.json())
  .then(result => {
    console.log("Entry added:", result);
    return result;
  })
  .catch(error => console.error("Error adding log:", error));
}
