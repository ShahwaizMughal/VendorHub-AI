const PDFDocument = require("pdfkit");

function addLine(doc, label, value) {
  doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(String(value ?? "—"));
  doc.moveDown(0.25);
}

function generateRfqPdf(rfq, quotes = []) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").text("VendorHub AI — Request for Quotation");
    doc.moveDown();
    addLine(doc, "RFQ ID", rfq._id);
    addLine(doc, "Product", rfq.productName);
    addLine(doc, "Quantity", rfq.quantity);
    addLine(doc, "Material / Specification", rfq.materialSpec);
    addLine(doc, "Budget", `${rfq.budget?.min ?? "—"} - ${rfq.budget?.max ?? "—"} ${rfq.budget?.currency || ""}`);
    addLine(doc, "Delivery Date", new Date(rfq.deliveryDate).toISOString().slice(0, 10));
    addLine(doc, "Payment Terms", rfq.paymentTerms);
    addLine(doc, "Shipping Method", rfq.shippingMethod);
    addLine(doc, "Status", rfq.status);

    doc.moveDown();
    doc.fontSize(14).font("Helvetica-Bold").text("Target Vendors");
    doc.moveDown(0.5);
    (rfq.vendorRecipients || []).forEach((recipient, index) => {
      doc.fontSize(10).font("Helvetica").text(`${index + 1}. ${recipient.vendorId} — ${recipient.responseState}`);
    });

    if (quotes.length) {
      doc.moveDown();
      doc.fontSize(14).font("Helvetica-Bold").text("Quotes");
      doc.moveDown(0.5);
      quotes.forEach((q, index) => {
        doc.fontSize(10).font("Helvetica")
          .text(`${index + 1}. Vendor ${q.vendorId} | Total ${q.totalPrice} ${q.currency} | Lead time ${q.leadTimeDays} days | ${q.status}`);
      });
    }

    doc.end();
  });
}

module.exports = { generateRfqPdf };
