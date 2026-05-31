import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("home");
  const [foodName, setFoodName] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const API_URL = "/api";

  const analyseFood = (food) => {
    const name = food.toLowerCase();

    const unhealthyFoods = [
      "chips",
      "burger",
      "pizza",
      "cola",
      "cake",
      "fries",
      "chocolate",
      "donut",
      "ice cream",
      "fried chicken"
    ];

    if (unhealthyFoods.some((item) => name.includes(item))) {
      return {
        health_score: "D",
        warning: "This food may contain high sugar, salt, or unhealthy fats.",
        alternative: "Try fruits, salad, yoghurt, nuts, or homemade meals."
      };
    }

    return {
      health_score: "A",
      warning: "This appears to be a healthier food choice.",
      alternative: "Continue choosing fresh and balanced food options."
    };
  };

  const handleScan = async () => {
    if (foodName.trim() === "") {
      alert("Please enter a food name");
      return;
    }

    const analysis = analyseFood(foodName);

    const scanData = {
      food_name: foodName,
      health_score: analysis.health_score,
      warning: analysis.warning,
      alternative: analysis.alternative
    };

    setResult(scanData);
    setFoodName("");
    setScreen("result");

    try {
      await axios.post(`${API_URL}/scan`, scanData);
    } catch (error) {
      console.log("Save failed:", error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history`);

      if (Array.isArray(response.data)) {
        setHistory(response.data);
      } else {
        setHistory([]);
      }

      setScreen("history");
    } catch (error) {
      console.log("History failed:", error);
      setHistory([]);
      setScreen("history");
    }
  };

  return (
    <div className="app">
      {screen === "home" && (
        <div className="card">
          <h1>Healthio</h1>
          <p className="subtitle">Scan your food. Eat smarter.</p>

          <button onClick={() => setScreen("scan")}>
            Start Scan
          </button>

          <button onClick={loadHistory}>
            View History
          </button>
        </div>
      )}

      {screen === "scan" && (
        <div className="card">
          <h2>Enter Food Details</h2>

          <input
            type="text"
            placeholder="Example: chips, apple, burger"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />

          <button onClick={handleScan}>
            Scan Now
          </button>

          <button onClick={() => setScreen("home")}>
            Back
          </button>
        </div>
      )}

      {screen === "result" && result && (
        <div className="card">
          <h2>Scan Result</h2>

          <p><b>Food:</b> {result.food_name}</p>
          <p><b>Health Score:</b> {result.health_score}</p>
          <p><b>Warning:</b> {result.warning}</p>
          <p><b>Healthy Alternative:</b> {result.alternative}</p>

          <button onClick={loadHistory}>
            View History
          </button>

          <button onClick={() => setScreen("home")}>
            Home
          </button>
        </div>
      )}

      {screen === "history" && (
        <div className="card">
          <h2>Scan History</h2>

          <div className="history-list">
            {history.length === 0 ? (
              <p>No history found.</p>
            ) : (
              history.map((item) => (
                <div className="history-item" key={item.id}>
                  <p><b>Food:</b> {item.food_name}</p>
                  <p><b>Score:</b> {item.health_score}</p>
                  <p><b>Warning:</b> {item.warning}</p>
                  <p><b>Alternative:</b> {item.alternative}</p>
                </div>
              ))
            )}
          </div>

          <button onClick={() => setScreen("home")}>
            Home
          </button>
        </div>
      )}
    </div>
  );
}

export default App;