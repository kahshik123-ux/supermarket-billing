import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

function Stock() {
  const [products, setProducts] = useState([]);
  const [addValues, setAddValues] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    setProducts(list);
  };

  const handleAddChange = (id, value) => {
    setAddValues({
      ...addValues,
      [id]: value
    });
  };

  const handleAddStock = async (product) => {
    const addQty = Number(addValues[product.id] || 0);

    if (addQty <= 0) {
      alert("Enter valid stock amount");
      return;
    }

    const newStock = Number(product.stock || 0) + addQty;

    await updateDoc(doc(db, "products", product.id), {
      stock: newStock
    });

    setAddValues({ ...addValues, [product.id]: "" });
    fetchProducts();
  };

  // ✅ SEARCH BY NAME OR BARCODE
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(search.toLowerCase()) ||
    product.barcode?.toString().includes(search)
  );

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Stock Management</h2>

      {/* 🔎 SEARCH BAR (Scanner Compatible) */}
      <input
        type="text"
        placeholder="Search by Name or Scan Barcode..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
        style={styles.searchInput}
      />

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th>Product Name</th>
              <th>Current Stock</th>
              <th>Add Stock</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map(product => (
              <tr
                key={product.id}
                style={
                  product.stock < 5
                    ? styles.lowStockRow
                    : styles.row
                }
              >
                <td>
                  {product.name}
                  {product.barcode && (
                    <div style={{ fontSize: "12px", color: "#777" }}>
                      {product.barcode}
                    </div>
                  )}
                </td>

                <td>
                  <strong
                    style={{
                      color: product.stock < 5 ? "red" : "black"
                    }}
                  >
                    {product.stock}
                  </strong>

                  {product.stock < 5 && (
                    <span style={styles.lowStockText}>
                      LOW STOCK
                    </span>
                  )}
                </td>

                <td>
                  <div style={styles.addBox}>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={addValues[product.id] || ""}
                      onChange={(e) =>
                        handleAddChange(product.id, e.target.value)
                      }
                      style={styles.input}
                    />

                    <button
                      style={styles.addBtn}
                      onClick={() => handleAddStock(product)}
                    >
                      Add
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="3" style={styles.emptyRow}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "40px"
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "600"
  },
  searchInput: {
    width: "300px",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  tableContainer: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  thead: {
    background: "#111827",
    color: "white"
  },
  row: {
    borderBottom: "1px solid #eee"
  },
  lowStockRow: {
    borderBottom: "1px solid #eee",
    backgroundColor: "#fee2e2"
  },
  lowStockText: {
    color: "red",
    fontWeight: "600",
    marginLeft: "10px"
  },
  addBox: {
    display: "flex",
    gap: "10px"
  },
  input: {
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "80px"
  },
  addBtn: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  emptyRow: {
    textAlign: "center",
    padding: "20px",
    color: "#888"
  }
};

export default Stock;