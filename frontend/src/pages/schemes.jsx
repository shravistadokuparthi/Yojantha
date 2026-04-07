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
    name: "", age: "", income: "", category: "", level: "", schemeType: "", textInput: ""
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
      formData.category.trim() !== "" &&
      formData.schemeType.trim() !== "";

    if (!hasTextInput && !hasStructuredData) {
      alert("Please provide either your profile details or a short text description of what you're looking for.");
      return;
    }

    navigateTo("recommendations", {
      userProfile: formData
    });
  };

  return (
    <div className="sc-root">

      {/* Page heading */}
      <div className="sc-heading">
        <h2 className="sc-title">Find Suitable Schemes</h2>
        <p className="sc-sub">Fill in your details and we'll match you with eligible government schemes.</p>
      </div>

      {/* Form card */}
      <div className="sc-card">
        <form className="sc-form" onSubmit={handleSubmit}>

          <div className="sc-grid">
            {/* Name */}
            <div className="sc-field">
              <label className="sc-label">Full Name</label>
              <input className="sc-input" type="text" name="name"
                placeholder="Enter your name"
                value={formData.name} onChange={handleChange} />
            </div>

            {/* Age */}
            <div className="sc-field">
              <label className="sc-label">Age</label>
              <input className="sc-input" type="number" name="age"
                placeholder="Your age"
                value={formData.age} onChange={handleChange} />
            </div>

            {/* Income */}
            <div className="sc-field">
              <label className="sc-label">Annual Income (₹)</label>
              <input className="sc-input" type="number" name="income"
                placeholder="e.g. 250000"
                value={formData.income} onChange={handleChange} />
            </div>

            {/* Category */}
            <div className="sc-field">
              <label className="sc-label">Category</label>
              <input className="sc-input" type="text" name="category"
                placeholder="SC / ST / OBC / General"
                value={formData.category} onChange={handleChange} />
            </div>

            {/* Level */}
            <div className="sc-field">
              <label className="sc-label">Scheme Level</label>
              <select className="sc-input sc-select" name="level"
                value={formData.level} onChange={handleChange}>
                <option value="">All (Central + State)</option>
                <option value="Central">Central</option>
                <option value="State">State</option>
              </select>
            </div>

            {/* Type */}
            <div className="sc-field">
              <label className="sc-label">Scheme Type</label>
              <select className="sc-input sc-select" name="schemeType"
                value={formData.schemeType} onChange={handleChange}>
                <option value="">Select Scheme Type</option>
                {SCHEME_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sc-or-separator"><span>OR</span></div>

          <div className="sc-field sc-field-full">
            <label className="sc-label">Describe your need</label>
            <textarea
              className="sc-input sc-textarea"
              name="textInput"
              placeholder="Write your need in plain text, for example: 'I am a low-income woman seeking education support for skill development.'"
              value={formData.textInput}
              onChange={handleChange}
            />
            <p className="sc-hint">You can skip the structured fields above if you want recommendations based on your own text.</p>
          </div>

          <button className="sc-btn" type="submit">
            <span>Check Schemes</span>
            <span className="sc-btn-arrow">→</span>
          </button>

        </form>
      </div>
    </div>
  );
}

export default Schemes;