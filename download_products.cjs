const fs = require('fs');

async function downloadProducts() {
  console.log("Fetching products (`rehbar-archive-collection.base44.app`)...");
  try {
    const response = await fetch("https://rehbar-archive-collection.base44.app/api/entities/Product", {
      method: "GET",
      headers: {
        "api_key": "d63650b204c14dbcaff1323b887c7bc9",
        "Content-Type": "application/json"
      }
    });
    
    const data = await response.json();
    
    // Save it as a JSON file locally
    fs.writeFileSync('rehbar_products.json', JSON.stringify(data, null, 2));
    console.log("Success! Your products are saved in rehbar_products.json");
    console.log(`Downloaded ${Array.isArray(data) ? data.length : 'unknown number of'} items.`);
  } catch (error) {
    console.error("Error downloading data:", error);
  }
}

downloadProducts();
