import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function AddProduct() {
  const [product, setProduct] = useState({
    barcode: "",
    name: "",
    actualPrice: "",
    discountPrice: "",
    stock: ""
  });

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "products"), {
      ...product,
      actualPrice: Number(product.actualPrice),
      discountPrice: Number(product.discountPrice),
      stock: Number(product.stock),
      createdAt: new Date()
    });

    alert("Product Added ✅");

    setProduct({
      barcode: "",
      name: "",
      actualPrice: "",
      discountPrice: "",
      stock: ""
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add New Product</h2>

        <form onSubmit={handleSubmit} style={styles.form}>

          <input
            name="barcode"
            placeholder="Barcode"
            value={product.barcode}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            name="name"
            placeholder="Product Name"
            value={product.name}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <div style={styles.row}>
            <input
              name="actualPrice"
              type="number"
              placeholder="Actual Price"
              value={product.actualPrice}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              name="discountPrice"
              type="number"
              placeholder="Discount Price"
              value={product.discountPrice}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <input
            name="stock"
            type="number"
            placeholder="Stock Quantity"
            value={product.stock}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Save Product
          </button>

        </form>
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
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
  },
  title: {
    marginBottom: "30px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "600",
    color: "#111827"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },
  row: {
    display: "flex",
    gap: "15px"
  },
  input: {
    flex: 1,
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
    transition: "0.2s"
  },
  button: {
    marginTop: "10px",
    padding: "15px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s"
  }
};

export default AddProduct;