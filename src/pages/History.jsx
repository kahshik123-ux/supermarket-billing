import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

function History() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "sales"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSales(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Sales History</h2>

      {sales.length === 0 ? (
        <div style={styles.empty}>No sales yet</div>
      ) : (
        sales.map((sale) => (
          <div key={sale.id} style={styles.card}>
            <div style={styles.header}>
              <div>
                <strong style={styles.total}>₹ {sale.total}</strong>
                <div style={styles.method}>
                  {sale.paymentMethod?.toUpperCase()}
                </div>
              </div>

              <div style={styles.date}>
                {sale.createdAt && sale.createdAt.toDate
                  ? sale.createdAt.toDate().toLocaleString()
                  : "—"}
              </div>
            </div>

            <div style={styles.items}>
              {sale.items?.map((item, index) => (
                <div key={index} style={styles.itemRow}>
                  <span>{item.name}</span>
                  <span>
                    {item.quantity} × ₹{item.discountPrice}
                  </span>
                </div>
              ))}
            </div>
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
    marginBottom: "25px",
    fontSize: "24px",
    fontWeight: "600",
  },
  empty: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#666",
  },
  card: {
    background: "white",
    padding: "18px",
    borderRadius: "12px",
    marginBottom: "18px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  total: {
    fontSize: "18px",
  },
  method: {
    fontSize: "12px",
    color: "#2563eb",
    marginTop: "4px",
  },
  date: {
    fontSize: "13px",
    color: "#6b7280",
  },
  items: {
    borderTop: "1px solid #eee",
    paddingTop: "10px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    padding: "3px 0",
  },
};

export default History;