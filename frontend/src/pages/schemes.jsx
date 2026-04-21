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
        <h2 className="sc-title">See How the Govt Can Help You</h2>
        <p className="sc-sub">
          Answer a few simple questions so we can find the best support and benefits for you.
        </p>
      </div>

      <div className="sc-card">
        <form className="sc-form" onSubmit={handleSubmit}>

          {/* Section 1: Basic Details */}
          <div className="sc-section-header">
            <span className="sc-section-icon">👤</span>
            <span className="sc-section-title">Basic Details</span>
          </div>
          <div className="sc-grid">
            <div className="sc-field">
              <label className="sc-label">Full Name</label>
              <input
                className="sc-input" type="text" name="name"
                value={formData.name} onChange={handleChange}
                placeholder="Enter your name"
              />
              <span className="sc-hint">We need this to know who the benefit is for.</span>
            </div>
            <div className="sc-field">
              <label className="sc-label">Age</label>
              <input
                className="sc-input" type="number" name="age"
                value={formData.age} onChange={handleChange}
                placeholder="e.g. 24"
              />
              <span className="sc-hint">Many benefits are start at specific ages.</span>
            </div>
            <div className="sc-field">
              <label className="sc-label">Gender</label>
              <select className="sc-input sc-select" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <span className="sc-hint">There are special schemes just for women.</span>
            </div>
            <div className="sc-field">
              <label className="sc-label">Working State</label>
              <input
                 className="sc-input" type="text" name="state"
                 value={formData.state} onChange={handleChange}
                 placeholder="Where do you live?"
              />
              <span className="sc-hint">Different states have different support systems.</span>
            </div>
          </div>

          {/* Section 2: Work & Income */}
          <div className="sc-section-header">
            <span className="sc-section-icon">💼</span>
            <span className="sc-section-title">Your Work & Income</span>
          </div>
          <div className="sc-grid">
            <div className="sc-field">
              <label className="sc-label">Family Income (Yearly)</label>
              <input
                className="sc-input" type="number" name="income"
                value={formData.income} onChange={handleChange}
                placeholder="Enter total family income"
              />
              <span className="sc-hint">This helps us find support for low-income families.</span>
            </div>
            <div className="sc-field">
              <label className="sc-label">Your Category</label>
              <input
                className="sc-input" type="text" name="category"
                value={formData.category} onChange={handleChange}
                placeholder="General / OBC / SC / ST"
              />
              <span className="sc-hint">Some support is reserved for specific categories.</span>
            </div>
            <div className="sc-field">
              <label className="sc-label">What is your job?</label>
              <input
                className="sc-input" type="text" name="occupation"
                value={formData.occupation} onChange={handleChange}
                placeholder="Farmer, Student, Worker, etc."
              />
              <span className="sc-hint">We have special help for farmers and students.</span>
            </div>
            <div className="sc-field">
              <label className="sc-label">Type of Support</label>
              <select className="sc-input sc-select" name="level" value={formData.level} onChange={handleChange}>
                <option value="">All Support</option>
                <option value="Central">Central Govt Support</option>
                <option value="State">State Govt Support</option>
              </select>
            </div>
            <div className="sc-field sc-field-full">
              <label className="sc-label">What are you looking for?</label>
              <select className="sc-input sc-select" name="schemeType" value={formData.schemeType} onChange={handleChange}>
                <option value="">Show Everything</option>
                {SCHEME_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sc-or-separator"><span>Or tell us in your own words</span></div>

          <div className="sc-field sc-field-full">
            <label className="sc-label">How can we help you today?</label>
            <textarea
              className="sc-input sc-textarea"
              name="textInput"
              value={formData.textInput}
              onChange={handleChange}
              placeholder="e.g. I am a student and I need a scholarship for higher studies."
            />
          </div>

          <button className="sc-btn" type="submit">
            See How the Govt Can Help Me →
          </button>


        </form>
      </div>
    </div>
  );
}

export default Schemes;