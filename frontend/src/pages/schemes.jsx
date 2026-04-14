import { useState } from "react";
import "./schemes.css";

const SCHEME_TYPES = [
  "Agriculture", "Rural & Environment", "Banking",
  "Financial Services and Insurance", "Business & Entrepreneurship",
  "Education & Learning", "Health & Wellness", "Housing & Shelter",
  "Science", "IT & Communications", "Skills & Employment",
  "Social welfare & Empowerment", "Sports & Culture",
  "Transport & Infrastructure", "Travel & Tourism",
  "Utility & Sanitation", "Women and Child",
  "Public Safety", "Law & Justice",
];

function Schemes({ navigateTo }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    income: "",
    category: "",
    level: "",
    schemeType: "",
    textInput: "",
    state: "",
    gender: "",
    occupation: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hasTextInput = formData.textInput.trim().length > 0;
    const hasStructuredData =
      formData.name.trim() !== "" &&
      formData.age.trim() !== "" &&
      formData.income.trim() !== "" &&
      formData.category.trim() !== "";

    if (!hasTextInput && !hasStructuredData) {
      alert("Please provide either your profile details or a description.");
      return;
    }

    navigateTo("recommendations", {
      userProfile: formData
    });
  };

  return (
    <div className="sc-root">

      {/* Heading */}
      <div className="sc-heading">
        <h2 className="sc-title">Find Suitable Schemes</h2>
        <p className="sc-sub">
          Fill your details and get AI-based government scheme recommendations.
        </p>
      </div>

      <div className="sc-card">
        <form className="sc-form" onSubmit={handleSubmit}>

          <div className="sc-grid">

            {/* Name */}
            <div className="sc-field">
              <label className="sc-label">Full Name</label>
              <input
                className="sc-input"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            {/* Age */}
            <div className="sc-field">
              <label className="sc-label">Age</label>
              <input
                className="sc-input"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
              />
            </div>

            {/* Income */}
            <div className="sc-field">
              <label className="sc-label">Annual Income (₹)</label>
              <input
                className="sc-input"
                type="number"
                name="income"
                value={formData.income}
                onChange={handleChange}
                placeholder="e.g. 250000"
              />
            </div>

            {/* Category */}
            <div className="sc-field">
              <label className="sc-label">Category</label>
              <input
                className="sc-input"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="SC / ST / OBC / General"
              />
            </div>

            {/* State */}
            <div className="sc-field">
              <label className="sc-label">State</label>
              <input
                className="sc-input"
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Telangana"
              />
            </div>

            {/* Gender */}
            <div className="sc-field">
              <label className="sc-label">Gender</label>
              <select
                className="sc-input sc-select"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Occupation */}
            <div className="sc-field">
              <label className="sc-label">Occupation</label>
              <input
                className="sc-input"
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Student / Farmer / Worker"
              />
            </div>

            {/* Level */}
            <div className="sc-field">
              <label className="sc-label">Scheme Level</label>
              <select
                className="sc-input sc-select"
                name="level"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="">All</option>
                <option value="Central">Central</option>
                <option value="State">State</option>
              </select>
            </div>

            {/* Type */}
            <div className="sc-field">
              <label className="sc-label">Scheme Type</label>
              <select
                className="sc-input sc-select"
                name="schemeType"
                value={formData.schemeType}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                {SCHEME_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="sc-or-separator"><span>OR</span></div>

          {/* TEXT INPUT */}
          <div className="sc-field sc-field-full">
            <label className="sc-label">Describe your need</label>
            <textarea
              className="sc-input sc-textarea"
              name="textInput"
              value={formData.textInput}
              onChange={handleChange}
              placeholder="Example: I am a low-income SC student from Telangana looking for scholarship"
            />
          </div>

          <button className="sc-btn" type="submit">
            Check Schemes →
          </button>

        </form>
      </div>
    </div>
  );
}

export default Schemes;