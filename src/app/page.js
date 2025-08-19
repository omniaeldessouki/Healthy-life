"use client";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "male",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data.data, "data >>");

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data.data);
      setShowPopup(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="weight">Weight (kg):</label>
          <input
            type="number"
            id="weight"
            name="weight"
            step="0.1"
            value={formData.weight}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="height">Height (cm):</label>
          <input
            type="number"
            id="height"
            name="height"
            step="0.1"
            value={formData.height}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Analyzing..." : "Submit"}
        </button>
      </form>

      {error && (
        <div className={styles.error}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Popup Modal */}
      {showPopup && result && (
        <div className={styles.popupOverlay} onClick={closePopup}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <h3>AI Analysis Results</h3>
              <button className={styles.closeButton} onClick={closePopup}>
                ×
              </button>
            </div>
            <div className={styles.popupContent}>
              <p>
                <strong>BMI:</strong> {result.bmi} ({result.bmiCategory})
              </p>
              <p>
                <strong>Message:</strong> {result.message}
              </p>
              <div>
                <strong>Recommendations:</strong>
                <ul>
                  {result?.recommendations?.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
