import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function PriceCalculator() {
  const [packageType, setPackageType] = useState("");
  const [excessFee, setExcessFee] = useState("");
  const [weight, setWeight] = useState("");
  const [zone, setZone] = useState("");
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);

  

  const fetchPrice =async () =>{
    if (!packageType || !weight || !zone) {
    setError("Please select package type, weight, and zone");
    return;
    }
    try{
     const qparams = new URLSearchParams({
     //excess_fee: excessFee || "",
     package_type: packageType,
    weight,
     zone
     });
     if (excessFee) {
      qparams.append('excess_fee', excessFee); 
    }
     console.log(`${API_BASE}/api/price?${qparams.toString()}`);
     const res = await fetch(`${API_BASE}/api/price?${qparams.toString()}`)
     console.log('Status:', res.status);
     if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to load price");
    }

    const data = await res.json();
    setPrice(data.Tot_Price);
    console.log('Data:', data);
    setError("");
  } 
  catch (err) {
    setError(err.message);
    setPrice(null);
  }
  };

  return (
    <div>
      <h2>Package Price Calculator</h2>

      <div>
        <label>
          Weight:
          <input
            type="number"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          Zone:
{/*need to fix later so that the zone calc comes from two zipcodes, from zipcode and to zipcode */}
          <select value={zone} onChange={(e) => setZone(e.target.value)}>
            <option value="">Select Zone</option>
            {[...Array(9)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Zone {i + 1}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Package Type:
          <select
            value={packageType} onChange={(e) => setPackageType(e.target.value)}
          >
            <option value="">Select Package Type</option>
            <option value="express">express</option>
            <option value="general shipping">general shipping</option>
            <option value="oversized">oversized</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Excess Fee:
          <select
            value={excessFee}
            onChange={(e) => setExcessFee(e.target.value)}
          >
            <option value="">Select Excess Fee(optional)</option>
            <option value="Fragile Handling">Fragile Handling</option>
            <option value="Fuel Surcharge">Fuel Surcharge</option>
            <option value="Hazardous Material">Hazardous Material</option>
            <option value="Signature Required">Signature Required</option>
          </select>
        </label>
      </div>

      <button type = "button" onClick={fetchPrice}>Calculate Price</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {typeof price !== null && <p>Price: ${parseFloat(price).toFixed(2)}</p>}
    </div>
    
  );
}