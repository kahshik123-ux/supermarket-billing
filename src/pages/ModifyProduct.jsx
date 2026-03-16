import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

function ModifyProduct() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setProducts(list);
    };
    fetchProducts();
  }, []);

  // ✅ SEARCH BY NAME OR BARCODE
  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.toString().includes(search)
  );

  const handleUpdate = async () => {
    if (!selected) return;

    await updateDoc(doc(db, "products", selected.id), {
      name: selected.name,
      actualPrice: Number(selected.actualPrice),
      discountPrice: Number(selected.discountPrice),
      barcode: selected.barcode || ""
    });

    alert("Product Updated ✅");
    setSelected(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Modify Product</h2>

        {/* ✅ SEARCH INPUT (Works for Scanner also) */}
        <input
          placeholder="Search by Name or Scan Barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          style={styles.input}
        />

        {filtered.map(product => (
          <div
            key={product.id}
            style={styles.listItem}
            onClick={() => setSelected(product)}
          >
            {product.name} {product.barcode && `(${product.barcode})`}
          </div>
        ))}

        {selected && (
          <div style={{ marginTop: "20px" }}>
            <input
              value={selected.name}
              onChange={(e) =>
                setSelected({ ...selected, name: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Barcode"
              value={selected.barcode || ""}
              onChange={(e) =>
                setSelected({ ...selected, barcode: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="number"
              value={selected.actualPrice}
              onChange={(e) =>
                setSelected({ ...selected, actualPrice: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="number"
              value={selected.discountPrice}
              onChange={(e) =>
                setSelected({ ...selected, discountPrice: e.target.value })
              }
              style={styles.input}
            />

            <button style={styles.button} onClick={handleUpdate}>
              Update Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  listItem: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    cursor: "pointer"
  },
  button: {
    marginTop: "15px",
    padding: "12px",
    width: "100%",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default ModifyProduct;