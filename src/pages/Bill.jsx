import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import PaymentModal from "../components/PaymentModal";

function Bill() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);

  // 🔥 SCANNER BUFFER (Professional POS Method)
  const scanBuffer = useRef("");
  const scanTimeout = useRef(null);

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setProducts(list);
    };
    fetchProducts();
  }, []);

  // 🔥 GLOBAL BARCODE LISTENER (NO FOCUS NEEDED)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore manual typing inside search input
      if (document.activeElement.tagName === "INPUT") return;

      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }

      if (e.key === "Enter") {
        if (scanBuffer.current.length > 0) {
          handleBarcodeScan(scanBuffer.current);
          scanBuffer.current = "";
        }
        return;
      }

      scanBuffer.current += e.key;

      scanTimeout.current = setTimeout(() => {
        scanBuffer.current = "";
      }, 100);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, cart]);

  // LIVE SEARCH
  useEffect(() => {
    if (!search.trim()) {
      setFiltered([]);
      return;
    }

    const value = search.toLowerCase();

    const result = products.filter(product =>
      product.name?.toLowerCase().startsWith(value) ||
      product.barcode?.toString().startsWith(value)
    );

    setFiltered(result.slice(0, 6));
  }, [search, products]);

  // ADD TO CART
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    setSearch("");
    setFiltered([]);
  };

  // BARCODE AUTO ADD
  const handleBarcodeScan = (code) => {
    if (!code) return;

    const product = products.find(
      p => p.barcode?.toString() === code.toString()
    );

    if (!product) {
      alert("Product not found!");
      return;
    }

    addToCart(product);
  };

  const increaseQty = (id) => {
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.discountPrice * item.quantity,
    0
  );

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <h2>Billing System</h2>
      </div>

      {/* SEARCH */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Scan barcode or search product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        {filtered.length > 0 && (
          <div style={styles.dropdown}>
            {filtered.map((product) => (
              <div
                key={product.id}
                style={styles.dropdownItem}
                onClick={() => addToCart(product)}
              >
                {product.name} — ₹ {product.discountPrice}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABLE */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th>Product</th>
              <th>MRP</th>
              <th>Discount</th>
              <th>Qty</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.emptyRow}>
                  No products added
                </td>
              </tr>
            ) : (
              cart.map((item) => (
                <tr key={item.id} style={styles.row}>
                  <td>{item.name}</td>
                  <td>₹ {item.actualPrice}</td>
                  <td>₹ {item.discountPrice}</td>

                  <td>
                    <div style={styles.qtyBox}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => decreaseQty(item.id)}
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        style={styles.qtyBtn}
                        onClick={() => increaseQty(item.id)}
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td style={{ fontWeight: "600" }}>
                    ₹ {item.discountPrice * item.quantity}
                  </td>

                  <td>
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeItem(item.id)}
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      <div style={styles.summaryBar}>
        <div style={styles.totalBox}>
          <span style={{ color: "#6b7280" }}>Total Amount</span>
          <h1 style={{ margin: 0 }}>₹ {total}</h1>
        </div>

        <button
          style={{
            ...styles.billBtn,
            opacity: cart.length === 0 ? 0.6 : 1,
            cursor: cart.length === 0 ? "not-allowed" : "pointer"
          }}
          onClick={() => setShowPayment(true)}
          disabled={cart.length === 0}
        >
          Proceed to Payment
        </button>
      </div>

      {showPayment && (
        <PaymentModal
          cart={cart}
          total={total}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={async () => {
            for (const item of cart) {
              const newStock = item.stock - item.quantity;

              await updateDoc(doc(db, "products", item.id), {
                stock: newStock
              });
            }

            setCart([]);
            setShowPayment(false);
            setSearch("");
          }}
        />
      )}
    </div>
  );
}

// YOUR SAME STYLES (UNCHANGED)
const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f3f4f6",
  },
  header: {
    padding: "18px 30px",
    background: "#111827",
    color: "white",
  },
  searchSection: {
    padding: "20px 30px",
    position: "relative",
    background: "white",
  },
  searchInput: {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },
  dropdown: {
    position: "absolute",
    top: "75px",
    width: "calc(100% - 60px)",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  dropdownItem: {
    padding: "12px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  },
  tableContainer: {
    flex: 1,
    padding: "20px 30px",
    overflowY: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "12px",
  },
  thead: {
    background: "#1f2937",
    color: "white",
  },
  row: {
    borderBottom: "1px solid #eee",
  },
  emptyRow: {
    textAlign: "center",
    padding: "40px",
    color: "#888",
  },
  qtyBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center",
  },
  qtyBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "4px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  removeBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  summaryBar: {
    background: "white",
    padding: "20px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 -4px 10px rgba(0,0,0,0.05)",
  },
  totalBox: {
    display: "flex",
    flexDirection: "column",
  },
  billBtn: {
    padding: "16px 28px",
    fontSize: "16px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "10px",
  },
};

export default Bill;