let chart = null;

// Read saved values from localStorage
function getSavedValues() {
  const raw = localStorage.getItem("energy_values");
  return raw ? JSON.parse(raw) : [];
}

function saveValues(values) {
  localStorage.setItem("energy_values", JSON.stringify(values));
}

// Init chart on dashboard load
function initChart() {
  const canvas = document.getElementById("energyChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Energy (kWh)",
        data: [],
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: "Time" } },
        y: { title: { display: true, text: "kWh" } }
      }
    }
  });

  // Load saved values into chart + stats
  const values = getSavedValues();
  values.forEach(v => pushValue(v, false)); // don't re-save while loading
}

// Update stats + chart
function pushValue(v, shouldSave = true) {
  const values = getSavedValues();
  values.push(v);

  // Save back
  if (shouldSave) saveValues(values);

  // Update stats
  const latestEl = document.getElementById("latest");
  const maxEl = document.getElementById("max");
  const avgEl = document.getElementById("avg");

  if (latestEl) latestEl.innerText = v.toFixed(2) + " kWh";
  if (maxEl) maxEl.innerText = Math.max(...values).toFixed(2) + " kWh";
  if (avgEl) {
    const avg = values.reduce((a,b)=>a+b,0) / values.length;
    avgEl.innerText = avg.toFixed(2) + " kWh";
  }

  // Update chart
  if (!chart) initChart();
  if (!chart) return;

  chart.data.labels.push(new Date().toLocaleTimeString());
  chart.data.datasets[0].data.push(v);
  chart.update();
}

// Predict single input
async function getPrediction() {
  const temp = document.getElementById("temp")?.value;
  const humidity = document.getElementById("humidity")?.value;
  const resultEl = document.getElementById("result");

  if (!temp || !humidity) return;

  if (resultEl) resultEl.innerText = "Analyzing...";

  const res = await fetch("/predict", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ temperature: temp, humidity: humidity })
  });

  const data = await res.json();
  if (data.success) {
    if (resultEl) resultEl.innerText = data.prediction + " kWh";
    pushValue(Number(data.prediction), true); // 🔥 persist value
  }
}

// CSV upload (unchanged)
async function uploadCSV() {
  const file = document.getElementById("csvFile")?.files[0];
  if (!file) return alert("Upload a CSV file");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/predict_csv", { method: "POST", body: formData });
  const data = await res.json();

  const totalEl = document.getElementById("monthly-result");
  const billEl = document.getElementById("bill-result");
  if (totalEl) totalEl.innerText = data.total_kwh + " kWh";
  if (billEl) billEl.innerText = "₹ " + data.bill;
}

document.addEventListener("DOMContentLoaded", initChart);