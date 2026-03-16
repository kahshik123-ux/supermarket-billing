import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import shopQR from "../assets/shopqr.jpeg";

function PaymentModal({ cart, total, onClose, onPaymentSuccess }) {
  const navigate = useNavigate();

  const [method, setMethod] = useState("");

  const [cash, setCash] = useState("");
  const [qrAmount, setQrAmount] = useState("");
  const [qrConfirmed, setQrConfirmed] = useState(false);

  const [remainingMode, setRemainingMode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const cashValue = Number(cash || 0);
  const qrValue = Number(qrAmount || 0);

  const cashRemaining = total - cashValue;
  const qrRemaining = total - qrValue;

  const validatePayment = () => {
    if (!method) {
      alert("Select payment method!");
      return false;
    }

    if (method === "cash") {
      if (cashValue <= 0) {
        alert("Enter cash amount!");
        return false;
      }

      if (cashRemaining > 0) {
        if (!customerName || !customerPhone) {
          alert("Enter customer details for credit!");
          return false;
        }
      }
    }

    if (method === "qr") {
      if (!qrConfirmed) {
        alert("Confirm QR payment first!");
        return false;
      }

      if (qrValue <= 0) {
        alert("Enter QR amount!");
        return false;
      }

      if (qrRemaining > 0 && remainingMode === "credit") {
        if (!customerName || !customerPhone) {
          alert("Enter customer details!");
          return false;
        }
      }
    }

    return true;
  };

  const handlePrint = async () => {
    if (!validatePayment()) return;

    const printWindow = window.open("", "", "width=400,height=600");

    const totalSaved = cart.reduce(
      (sum, item) =>
        sum + (item.actualPrice - item.discountPrice) * item.quantity,
      0
    );

    printWindow.document.write(`
      <html>
      <head>
        <title>Bill</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            width: 80mm;
            margin: 0;
            padding: 6px;
            font-family: monospace;
            font-size: 11px;
          }
          .center { text-align: center; }
          .line { border-top: 1px dashed black; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th { text-align: left; border-bottom: 1px solid black; }
          td { padding: 2px 0; }
          .right { text-align: right; }
        </style>
      </head>
      <body>

      <div class="center">
        <strong>YOUR SHOP NAME</strong><br/>
        ${new Date().toLocaleString()}
      </div>

      <div class="line"></div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th class="right">MRP</th>
            <th class="right">Disc</th>
            <th class="right">Qty</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${cart.map(item => `
            <tr>
              <td>${item.name}</td>
              <td class="right">${item.actualPrice}</td>
              <td class="right">${item.discountPrice}</td>
              <td class="right">${item.quantity}</td>
              <td class="right">${item.discountPrice * item.quantity}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="line"></div>

      <div><strong>Total: ₹${total}</strong></div>
      <div>You Saved: ₹${totalSaved}</div>

      <div class="line"></div>

      ${
        method === "cash"
          ? cashRemaining > 0
            ? `
              <div>Cash Paid: ₹${cashValue}</div>
              <div>Credit: ₹${cashRemaining}</div>
              <div>Customer: ${customerName}</div>
              <div>Phone: ${customerPhone}</div>
            `
            : `
              <div>Cash Paid: ₹${cashValue}</div>
              <div>Return: ₹${cashValue - total}</div>
            `
          : `
              <div>QR Paid: ₹${qrValue}</div>
              ${
                qrRemaining > 0 && remainingMode === "credit"
                  ? `
                    <div>Credit: ₹${qrRemaining}</div>
                    <div>Customer: ${customerName}</div>
                    <div>Phone: ${customerPhone}</div>
                  `
                  : ""
              }
            `
      }

      <div class="line"></div>
      <div class="center">Thank You! Visit Again 🙏</div>

      </body>
      </html>
    `);

    printWindow.document.close();

    await addDoc(collection(db, "sales"), {
      items: cart,
      total: total,
      paymentMethod: method,
      customerName:
        method === "cash" && cashRemaining > 0
          ? customerName
          : method === "qr" && qrRemaining > 0 && remainingMode === "credit"
          ? customerName
          : null,
      customerPhone:
        method === "cash" && cashRemaining > 0
          ? customerPhone
          : method === "qr" && qrRemaining > 0 && remainingMode === "credit"
          ? customerPhone
          : null,
      creditAmount:
        method === "cash" && cashRemaining > 0
          ? cashRemaining
          : method === "qr" && qrRemaining > 0 && remainingMode === "credit"
          ? qrRemaining
          : 0,
      createdAt: serverTimestamp(),
    });

    printWindow.print();

    setTimeout(() => {
      printWindow.close();
      if (onPaymentSuccess) onPaymentSuccess();
      onClose();
      navigate("/bill", { replace: true });
    }, 1000);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Payment</h2>

        <div style={styles.methodContainer}>
          <button
            style={method === "cash" ? styles.activeBtn : styles.methodBtn}
            onClick={() => setMethod("cash")}
          >
            Cash
          </button>

          <button
            style={method === "qr" ? styles.activeBtn : styles.methodBtn}
            onClick={() => setMethod("qr")}
          >
            QR / UPI
          </button>
        </div>

        {/* CASH (UNCHANGED) */}
        {method === "cash" && (
          <div style={styles.section}>
            <input
              type="number"
              placeholder="Amount Given"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              style={styles.input}
            />

            {cashRemaining > 0 && cashValue > 0 && (
              <>
                <p style={{ color: "red" }}>
                  Credit Amount: ₹ {cashRemaining}
                </p>

                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={styles.input}
                />

                <input
                  type="text"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={styles.input}
                />
              </>
            )}

            {cashRemaining <= 0 && cashValue > 0 && (
              <p style={{ color: "green" }}>
                Return: ₹ {cashValue - total}
              </p>
            )}
          </div>
        )}

        {/* QR (UPDATED ONLY HERE) */}
        {method === "qr" && (
          <div style={styles.section}>
            <img
              src={shopQR}
              alt="QR"
              style={{ width: "150px", alignSelf: "center" }}
            />

            <input
              type="number"
              placeholder="QR Paid Amount"
              value={qrAmount}
              onChange={(e) => {
                setQrAmount(e.target.value);
                setRemainingMode("");
              }}
              style={styles.input}
            />

            {!qrConfirmed ? (
              <button
                style={styles.confirmBtn}
                onClick={() => setQrConfirmed(true)}
              >
                Payment Received
              </button>
            ) : (
              <p style={{ color: "green", fontWeight: "bold" }}>
                ✅ Confirmed
              </p>
            )}

            {qrValue > 0 && qrValue !== total && (
              <>
                <p style={{ color: "red" }}>
                  Remaining: ₹ {qrRemaining}
                </p>

                <select
                  value={remainingMode}
                  onChange={(e) => setRemainingMode(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select Remaining Mode</option>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                </select>

                {remainingMode === "credit" && (
                  <>
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={styles.input}
                    />

                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={styles.input}
                    />
                  </>
                )}
              </>
            )}
          </div>
        )}

        <div style={styles.buttonRow}>
          <button style={styles.confirmBtn} onClick={handlePrint}>
            Print
          </button>

          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    width: "420px",
  },
  title: { textAlign: "center", marginBottom: "20px" },
  methodContainer: { display: "flex", gap: "10px", marginBottom: "20px" },
  methodBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#f3f4f6",
    cursor: "pointer",
  },
  activeBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
  section: { display: "flex", flexDirection: "column", gap: "10px" },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  buttonRow: { marginTop: "20px", display: "flex", gap: "10px" },
  confirmBtn: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "red",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default PaymentModal;