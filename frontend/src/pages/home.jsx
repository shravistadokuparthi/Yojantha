import "./home.css";

function Home() {
  return (
    <div className="home-container">

      {/* Hero Section */}
      <div className="card">
        <h1>Welcome to Yojanta Portal</h1>
        <p>
          Discover government schemes tailored to your needs.
          Check eligibility, apply easily, and track your applications.
        </p>
      </div>

      {/* Stats Section */}
      <div className="stats">
        <div className="stat-card">
          <h4>Eligible Schemes</h4>
          <p>8</p>
        </div>

        <div className="stat-card">
          <h4>Applied</h4>
          <p>3</p>
        </div>

      </div>


      {/* Updates */}
      <div className="card">
        <h3>Latest Updates</h3>
        <ul>
          <li>New Women Welfare Scheme launched</li>
          <li>Scholarship deadline extended</li>
          <li>Health scheme enrollment open</li>
        </ul>
      </div>

      {/* How It Works */}
      <div className="card">
        <h3>How It Works</h3>
        <p>
          1️⃣ Enter your details → 2️⃣ Get recommended schemes → 
          3️⃣ Apply → 4️⃣ Track status
        </p>
      </div>

    </div>
  );
}

export default Home;