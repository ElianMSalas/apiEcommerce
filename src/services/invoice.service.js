const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts } = require('pdf-lib');

const generateInvoicePDF = async (order) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 750;

  page.drawText(`Factura - ${order.orderNumber}`, { x: 50, y, size: 18, font });
  y -= 40;

  page.drawText(`Fecha: ${new Date(order.paidAt).toLocaleString()}`, { x: 50, y, size: 12, font });
  y -= 40;

  page.drawText("Productos:", { x: 50, y, size: 14, font });
  y -= 25;

  order.items.forEach(item => {
    page.drawText(
      `${item.product.name} x${item.quantity} - $${item.unitPrice}`,
      { x: 60, y, size: 12, font }
    );
    y -= 20;
  });

  y -= 20;
  page.drawText(`Total: $${order.total}`, { x: 50, y, size: 14, font });

  const pdfBytes = await pdfDoc.save();

  const invoiceDir = path.join(__dirname, '../../invoices');
  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir);
  }

  const filePath = path.join(invoiceDir, `invoice-${order.orderNumber}.pdf`);
  fs.writeFileSync(filePath, pdfBytes);

  return filePath;
};

module.exports = { generateInvoicePDF };
