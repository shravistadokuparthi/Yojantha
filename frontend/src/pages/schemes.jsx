import { useState } from "react";
import "./schemes.css";
import { useNavigate } from "react-router-dom";

function Schemes() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    income: "",
    category: "",
    level: "",
    schemeType: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send schemeType to recommendations page via localStorage (to persist across refreshes)
localStorage.setItem("schemeType", formData.schemeType);
localStorage.setItem("level", formData.level);

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

        <select
  name="level"
  value={formData.level}
  onChange={handleChange}
>
  <option value="">All (Central + State)</option>
  <option value="Central">Central</option>
  <option value="State">State</option>
</select>

        <select
          name="schemeType"
          value={formData.schemeType}
          onChange={handleChange}
          required
        >
           <option value="">Select Scheme Type</option>

  <option value="Agriculture">Agriculture</option>
  <option value="Rural & Environment">Rural & Environment</option>
  <option value="Banking">Banking</option>
  <option value="Financial Services and Insurance">Financial Services and Insurance</option>
  <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
  <option value="Education & Learning">Education & Learning</option>
  <option value="Health & Wellness">Health & Wellness</option>
  <option value="Housing & Shelter">Housing & Shelter</option>
  <option value="Science">Science</option>
  <option value="IT & Communications">IT & Communications</option>
  <option value="Skills & Employment">Skills & Employment</option>
  <option value="Social welfare & Empowerment">Social welfare & Empowerment</option>
  <option value="Sports & Culture">Sports & Culture</option>
  <option value="Transport & Infrastructure">Transport & Infrastructure</option>
  <option value="Travel & Tourism">Travel & Tourism</option>
  <option value="Utility & Sanitation">Utility & Sanitation</option>
  <option value="Women and Child">Women and Child</option>
  <option value="Public Safety">Public Safety</option>
  <option value="Law & Justice">Law & Justice</option>
        </select>

        <button type="submit">Check Schemes</button>

      </form>

    </div>
  );
}

export default Schemes;