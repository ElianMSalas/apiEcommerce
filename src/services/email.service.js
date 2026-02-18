const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = async (order, userEmail, invoicePath) => {

  const productsHtml = order.items.map(item => `
    <tr>
      <td>${item.product.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.unitPrice}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Tu Tienda" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Confirmación de pedido ${order.orderNumber}`,
    html: `
      <h2>¡Gracias por tu compra!</h2>
      <p>Pedido: <strong>${order.orderNumber}</strong></p>
      <p>Fecha: ${new Date(order.paidAt).toLocaleString()}</p>

      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>

      <h3>Total: $${order.total}</h3>
      <p>Adjuntamos tu factura en PDF.</p>
    `,
    attachments: [
      {
        filename: `invoice-${order.orderNumber}.pdf`,
        path: invoicePath,
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOrderConfirmationEmail };
