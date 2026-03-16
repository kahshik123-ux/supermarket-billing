import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  onSnapshot
} from "firebase/firestore";

function Revenue() {
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [todayCash, setTodayCash] = useState(0);
  const [todayQR, setTodayQR] = useState(0);
  const [creditCount, setCreditCount] = useState(0);
  const [creditTotal, setCreditTotal] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "sales"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let todayTotal = 0;
      let monthTotal = 0;
      let cashTotal = 0;
      let qrTotal = 0;
      let pendingCreditAmount = 0;
      let pendingCreditCustomers = 0;

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.createdAt) return;

        const saleDate = data.createdAt.toDate();
        const total = Number(data.total || 0);
        const creditAmount = Number(data.creditAmount || 0);

        // ✅ Today revenue
        if (
          saleDate.getDate() === today.getDate() &&
          saleDate.getMonth() === currentMonth &&
          saleDate.getFullYear() === currentYear
        ) {
          todayTotal += total;

          if (data.paymentMethod === "cash") {
            cashTotal += total;
          }

          if (data.paymentMethod === "qr") {
            qrTotal += total;
          }
        }

        // ✅ Month revenue
        if (
          saleDate.getMonth() === currentMonth &&
          saleDate.getFullYear() === currentYear
        ) {
          monthTotal += total;
        }

        // ✅ Pending Credits
        if (creditAmount > 0) {
          pendingCreditAmount += creditAmount;
          pendingCreditCustomers += 1;
        }
      });

      setTodayRevenue(todayTotal);
      setMonthRevenue(monthTotal);
      setTodayCash(cashTotal);
      setTodayQR(qrTotal);
      setCreditTotal(pendingCreditAmount);
      setCreditCount(pendingCreditCustomers);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Revenue Dashboard</h2>

      <div style={styles.cardContainer}>

        <div style={styles.card}>
          <h3>Today's Total Revenue</h3>
          <p style={styles.amount}>₹ {todayRevenue}</p>
        </div>

        <div style={styles.card}>
          <h3>Today's Cash</h3>
          <p style={styles.amount}>₹ {todayCash}</p>
        </div>

        <div style={styles.card}>
          <h3>Today's QR</h3>
          <p style={styles.amount}>₹ {todayQR}</p>
        </div>

        <div style={styles.card}>
          <h3>This Month Revenue</h3>
          <p style={styles.amount}>₹ {monthRevenue}</p>
        </div>

        <div style={styles.cardCredit}>
          <h3>Pending Credits</h3>
          <p style={styles.amountRed}>₹ {creditTotal}</p>
          <p style={styles.subText}>
            Customers: {creditCount}
          </p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "40px",
  },
  title: {
    marginBottom: "30px",
    fontSize: "26px",
    fontWeight: "600",
  },
  cardContainer: {
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    width: "260px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  cardCredit: {
    background: "#fee2e2",
    padding: "25px",
    borderRadius: "16px",
    width: "260px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  amount: {
    fontSize: "26px",
    fontWeight: "bold",
    marginTop: "10px",
    color: "#16a34a",
  },
  amountRed: {
    fontSize: "26px",
    fontWeight: "bold",
    marginTop: "10px",
    color: "red",
  },
  subText: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#555",
  }
};

export default Revenue;