import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";

function Credit() {
  const [credits, setCredits] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "sales"),
      where("creditAmount", ">", 0)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCredits(list);
    });

    return () => unsubscribe();
  }, []);

  // ✅ MARK AS PAID FUNCTION
  const markAsPaid = async (id) => {
    try {
      await updateDoc(doc(db, "sales", id), {
        creditAmount: 0,
        paidAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating credit:", error);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Credit Customers</h2>

      {credits.length === 0 ? (
        <p>No Credit Pending</p>
      ) : (
        credits.map((sale) => (
          <div key={sale.id} style={styles.card}>
            <div style={styles.header}>
              <strong>{sale.customerName}</strong>
              <span style={{ color: "red" }}>
                ₹ {sale.creditAmount}
              </span>
            </div>

            <div style={styles.sub}>
              📞 {sale.customerPhone}
            </div>

            <div style={styles.date}>
              {sale.createdAt?.toDate
                ? sale.createdAt.toDate().toLocaleString()
                : ""}
            </div>

            {/* ✅ MARK AS PAID BUTTON */}
            <button
              onClick={() => markAsPaid(sale.id)}
              style={styles.payBtn}
            >
              Mark as Paid
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "30px",
    background: "#f3f4f6",
    minHeight: "100vh",
  },
  title: {
    marginBottom: "20px",
  },
  card: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  sub: {
    fontSize: "14px",
    color: "#555",
  },
  date: {
    fontSize: "12px",
    color: "#999",
    marginTop: "5px",
  },
  payBtn: {
    marginTop: "10px",
    padding: "8px 12px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Credit;