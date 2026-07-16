export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('[Resend API] RESEND_API_KEY environment variable is not configured on Vercel.');
      return res.status(200).json({ success: false, message: 'RESEND_API_KEY not configured' });
    }

    const { rawOrder = {}, orderData = {}, adminEmail = 'sales@myrehbar.com' } = req.body || {};

    // Extract normalized fields
    const orderNumber = rawOrder.order_number || orderData["Order Number"] || "REH-" + Date.now().toString().slice(-6);
    const customerName = rawOrder.customer_name || orderData["Customer Name"] || "Customer";
    const customerEmail = rawOrder.customer_email || orderData["Customer Email"] || "";
    const customerPhone = rawOrder.customer_phone || orderData["Customer Phone"] || "N/A";
    
    const shippingAddress = rawOrder.shipping_address || "";
    const shippingCity = rawOrder.shipping_city || "";
    const shippingZip = rawOrder.shipping_zip || "";
    const shippingCountry = rawOrder.shipping_country || orderData["Shipping Address"] || "N/A";

    const totalPaid = rawOrder.total !== undefined ? rawOrder.total : (orderData["Total Paid"] ? orderData["Total Paid"].replace(/[^0-9.]/g, '') : "0.00");
    const paymentId = rawOrder.payment_id || orderData["Payment Status"] || "Stripe_Verified";
    const charity = rawOrder.charity || orderData["Charity Selection"] || "General Fund";
    const charityDonation = rawOrder.charity_donation || "0";

    const items = Array.isArray(rawOrder.order_items) ? rawOrder.order_items : [];
    
    // Format items for Customer HTML table
    let itemsHtml = "";
    let adminItemsList = "";

    if (items.length > 0) {
      itemsHtml = items.map(item => {
        const title = item.product_title || item.title || "Rehbar Item";
        const designOrSize = item.size || "Regular";
        const qty = item.quantity || 1;
        const price = Number(item.price || 0).toFixed(2);
        return `
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 12px 0;">
              <strong style="color: #fff; font-size: 14px;">${title}</strong><br/>
              <span style="color: #888; font-size: 12px;">Design/Size: ${designOrSize}</span>
            </td>
            <td style="padding: 12px 0; text-align: center; color: #ccc;">${qty}</td>
            <td style="padding: 12px 0; text-align: right; color: #fff; font-weight: bold;">$${(price * qty).toFixed(2)} USD</td>
          </tr>
        `;
      }).join('');

      adminItemsList = items.map(item => {
        const title = item.product_title || item.title || "Rehbar Item";
        const designOrSize = item.size || "Regular";
        const qty = item.quantity || 1;
        const price = Number(item.price || 0).toFixed(2);
        return `<li style="margin-bottom: 6px;"><strong>${qty}x ${title}</strong> (Design/Size: ${designOrSize}) — $${(price * qty).toFixed(2)} USD</li>`;
      }).join('');
    } else if (orderData["Items Ordered"]) {
      itemsHtml = `
        <tr>
          <td style="padding: 12px 0; color: #fff;">${orderData["Items Ordered"]}</td>
          <td style="padding: 12px 0; text-align: center; color: #ccc;">-</td>
          <td style="padding: 12px 0; text-align: right; color: #fff; font-weight: bold;">$${totalPaid} USD</td>
        </tr>
      `;
      adminItemsList = `<li>${orderData["Items Ordered"]}</li>`;
    } else {
      itemsHtml = `<tr><td colspan="3" style="padding: 12px 0; color: #888;">Order items summary attached to order #${orderNumber}</td></tr>`;
      adminItemsList = `<li>See dashboard for items breakdown</li>`;
    }

    const sendResendEmail = async (toEmail, subject, htmlContent) => {
      if (!toEmail) return null;
      try {
        let response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Rehbar Store <orders@myrehbar.com>',
            to: [toEmail],
            subject: subject,
            html: htmlContent
          })
        });
        let result = await response.json();
        if (!response.ok) {
          console.error(`[Resend Error with orders@myrehbar.com] to ${toEmail}:`, result);
          // Try fallback to onboarding@resend.dev if custom domain verification is pending in Resend
          try {
            response = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'Rehbar Store <onboarding@resend.dev>',
                to: [toEmail],
                subject: subject,
                html: htmlContent
              })
            });
            result = await response.json();
          } catch (fbErr) {
            console.error('[Resend Fallback Error]:', fbErr);
          }
        }
        if (response.ok) {
          console.log(`[Resend Success] Email sent to ${toEmail}:`, result.id);
        } else {
          console.error(`[Resend Final Error] Failed to send email to ${toEmail}:`, result);
        }
        return result;
      } catch (err) {
        console.error(`[Resend Exception] Error sending email to ${toEmail}:`, err.message);
        return null;
      }
    };

    // 1. Customer Order Confirmation Email (Wrapped in non-blocking try/catch)
    let customerResult = null;
    try {
      if (customerEmail && customerEmail.includes('@')) {
        const customerSubject = `Your Rehbar order is confirmed (#${orderNumber})`;
        const customerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #101010; color: #E6E2D3; padding: 30px; border-radius: 10px; border: 1px solid #222;">
            <h1 style="color: #C4311E; margin-top: 0;">Your Rehbar order is confirmed</h1>
            <p style="font-size: 16px; color: #ccc;">Thank you for your purchase, <strong style="color: #fff;">${customerName}</strong>! We are processing your order and getting it ready for shipment.</p>
            
            <div style="background-color: #161616; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #282828;">
              <h2 style="font-size: 18px; margin-top: 0; color: #fff; border-bottom: 1px solid #333; padding-bottom: 12px;">Order #${orderNumber}</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px; color: #E6E2D3;">
                <thead>
                  <tr style="border-bottom: 1px solid #333; text-align: left; font-size: 13px; color: #888;">
                    <th style="padding: 8px 0;">Item & Design</th>
                    <th style="padding: 8px 0; text-align: center;">Qty</th>
                    <th style="padding: 8px 0; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 15px; text-align: right;">
                <p style="font-size: 18px; font-weight: bold; color: #fff; margin: 0;">Total Paid: <span style="color: #C4311E;">$${totalPaid} USD</span></p>
              </div>
            </div>

            <p style="font-size: 14px; color: #888; line-height: 1.5;">If you have any questions regarding your order or shipping address, simply reply directly to this confirmation email.</p>
            <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #222; padding-top: 15px;">&copy; ${new Date().getFullYear()} Rehbar Store. All rights reserved.</p>
          </div>
        `;
        customerResult = await sendResendEmail(customerEmail, customerSubject, customerHtml);
      }
    } catch (e) {
      console.error('[Resend Customer Email Catch Error]:', e);
    }

    // 2. Admin Notification Email (Wrapped in non-blocking try/catch)
    let adminResult = null;
    try {
      const adminSubject = `New order received (#${orderNumber} - $${totalPaid} USD)`;
      const adminHtml = `
        <div style="font-family: monospace, Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #111; color: #eee; padding: 30px; border-radius: 10px; border: 2px solid #C4311E;">
          <h1 style="color: #C4311E; margin-top: 0; font-size: 24px;">🚨 New Order Received!</h1>
          <p style="font-size: 16px;">Order <strong style="color: #fff;">#${orderNumber}</strong> has been successfully placed and paid.</p>
          
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #2d2d2d;">
            <h3 style="color: #fff; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 8px;">Customer Details</h3>
            <p style="margin: 6px 0;"><strong>Customer Name:</strong> ${customerName}</p>
            <p style="margin: 6px 0;"><strong>Customer Email:</strong> <a href="mailto:${customerEmail}" style="color: #60a5fa;">${customerEmail}</a></p>
            <p style="margin: 6px 0;"><strong>Phone Number:</strong> ${customerPhone}</p>
            <p style="margin: 6px 0;"><strong>Shipping Destination:</strong><br/>${shippingAddress}, ${shippingCity}, ${shippingZip}, ${shippingCountry}</p>
          </div>

          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #2d2d2d;">
            <h3 style="color: #fff; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 8px;">Order & Payment Breakdown</h3>
            <p style="margin: 6px 0;"><strong>Total Amount Paid:</strong> <span style="color: #4ade80; font-size: 18px; font-weight: bold;">$${totalPaid} USD</span></p>
            <p style="margin: 6px 0;"><strong>Stripe Payment ID:</strong> <span style="font-family: monospace; color: #fbbf24;">${paymentId}</span></p>
            <p style="margin: 6px 0;"><strong>Charity Selected:</strong> ${charity} ($${charityDonation} donation)</p>
            
            <h4 style="color: #ccc; margin-top: 16px; margin-bottom: 8px;">Items Ordered:</h4>
            <ul style="padding-left: 20px; margin-top: 0; color: #e5e7eb;">
              ${adminItemsList}
            </ul>
          </div>

          <p style="font-size: 12px; color: #777; margin-top: 25px;">Dispatched automatically via Resend API (` + `from: orders@myrehbar.com` + `)</p>
        </div>
      `;
      adminResult = await sendResendEmail(adminEmail, adminSubject, adminHtml);
    } catch (e) {
      console.error('[Resend Admin Email Catch Error]:', e);
    }

    // Always respond 200 OK so email status never interrupts order flow
    return res.status(200).json({
      success: true,
      customerResult,
      adminResult
    });
  } catch (globalErr) {
    console.error('[Resend Confirmation Handler Global Error]:', globalErr);
    // Never fail with 500 to keep the order flow protected
    return res.status(200).json({ success: false, error: globalErr.message });
  }
}
