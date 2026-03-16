import { Routes, Route, useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaCashRegister,
  FaHistory,
  FaBoxes,
  FaEdit,
  FaMoneyBillWave,
  FaChartLine   // ✅ Added
} from "react-icons/fa";

import AddProduct from "./pages/AddProduct";
import Bill from "./pages/Bill";
import ModifyProduct from "./pages/ModifyProduct";
import Stock from "./pages/Stock";
import History from "./pages/History";
import Credit from "./pages/Credit";
import Revenue from "./pages/Revenue"; // ✅ Added

import bgImage from "./assets/supermarket.jpg";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={styles.background}>
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        <h1 style={styles.title}>Supermarket Billing System</h1>

        <div style={styles.cardContainer}>
          <DashboardCard
            icon={<FaCashRegister size={40} />}
            title="Bill System"
            onClick={() => navigate("/bill")}
          />

          <DashboardCard
            icon={<FaPlusCircle size={40} />}
            title="Add Product"
            onClick={() => navigate("/add-product")}
          />

          <DashboardCard
            icon={<FaEdit size={40} />}
            title="Modify Product"
            onClick={() => navigate("/modify-product")}
          />

          <DashboardCard
            icon={<FaBoxes size={40} />}
            title="Stock Management"
            onClick={() => navigate("/stock")}
          />

          <DashboardCard
            icon={<FaHistory size={40} />}
            title="History"
            onClick={() => navigate("/history")}
          />

          <DashboardCard
            icon={<FaMoneyBillWave size={40} />}
            title="Credit"
            onClick={() => navigate("/credit")}
          />

          {/* ✅ REVENUE BUTTON ADDED */}
          <DashboardCard
            icon={<FaChartLine size={40} />}
            title="Revenue"
            onClick={() => navigate("/revenue")}
          />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ icon, title, onClick }) {
  return (
    <div
      style={styles.card}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {icon}
      <p style={styles.cardText}>{title}</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/bill" element={<Bill />} />
      <Route path="/modify-product" element={<ModifyProduct />} />
      <Route path="/stock" element={<Stock />} />
      <Route path="/history" element={<History />} />
      <Route path="/credit" element={<Credit />} />
      <Route path="/revenue" element={<Revenue />} /> {/* ✅ Added */}
    </Routes>
  );
}

const styles = {
  background: {
    height: "100vh",
    width: "100%",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  content: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  title: {
    color: "white",
    marginBottom: "40px",
    textAlign: "center",
    fontSize: "32px",
    fontWeight: "600",
    letterSpacing: "1px",
  },
  cardContainer: {
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: "190px",
    height: "150px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)",
    borderRadius: "18px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "0.3s",
    fontWeight: "500",
  },
  cardText: {
    marginTop: "10px",
    fontSize: "16px",
  },
};

export default App;