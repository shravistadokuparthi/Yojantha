import { useState } from "react";
import "./schemes.css";
import { useNavigate } from "react-router-dom";

function Schemes() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    income: "",
    category: "",
    schemeType: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


const navigate = useNavigate();
const handleSubmit = (e) => {
  e.preventDefault();
  navigate("/recommendations");
};

  return (
    <div className="schemes-container">

      <h2>Find Suitable Schemes</h2>

      <form className="scheme-form" onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="age"
          placeholder="Enter Age"
          value={formData.age}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="income"
          placeholder="Enter Annual Income"
          value={formData.income}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Enter Category (SC/ST/OBC/General)"
          value={formData.category}
          onChange={handleChange}
          required
        />

        {/* Dropdown */}
        <select
          name="schemeType"
          value={formData.schemeType}
          onChange={handleChange}
          required
        >
          <option value="">Select Scheme Type</option>
          <option value="Education">Education</option>
          <option value="Women Welfare">Women Welfare</option>
          <option value="Agriculture">Agriculture</option>
          <option value="Startup">Startup</option>
          <option value="Health">Health</option>
        </select>

        <button type="submit">Check Schemes</button>

      </form>

      {/* Display Data */}
      {submitted && (
        <div className="result">
          <h3>Entered Details</h3>
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Age:</strong> {formData.age}</p>
          <p><strong>Income:</strong> ₹{formData.income}</p>
          <p><strong>Category:</strong> {formData.category}</p>
          <p><strong>Scheme Type:</strong> {formData.schemeType}</p>
        </div>
      )}

    </div>
  );
}

export default Schemes;