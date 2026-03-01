const BIN_ID = "69a4b2cbae596e708f55f571";
const ACCESS_KEY = "$2a$10$Fev/HIw/cTZoUYDdcqQny.QRbGt2rIPuuFmYIcgubh36EH7fqH.0S";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export const logActivity = (newEntry) => {
  return fetch(`${BIN_URL}/latest`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "X-Access-Key": ACCESS_KEY
    }
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
