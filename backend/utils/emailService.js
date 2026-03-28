
// Import your existing transporter from config
import transporter from '../Config/nodeMailer.js';

// Send Booking Confirmation Email (Instant Booking - Payment Successful)
export const sendBookingConfirmationEmail = async (booking) => {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: booking.guestEmail,
      subject: `🎉 Booking Confirmed - ${booking.bookingId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { display: inline-block; padding: 8px 16px; background: #22c55e; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .detail-value { color: #111827; }
            .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }
            .important-info { background: #fef3c7; padding: 15px; border-left: 4px solid #fbbf24; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
              <p>Your stay is ready</p>
            </div>
            <div class="content">
              <h2>Hello ${booking.guestName},</h2>
              <p>Great news! Your booking has been confirmed and payment received successfully. Your homestay is ready for your arrival!</p>
              
              <div class="status-badge">✅ Confirmed</div>
              
              <div class="details">
                <h3>Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Booking Reference:</span>
                  <span class="detail-value">${booking.bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Homestay:</span>
                  <span class="detail-value">${booking.homestayName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">${booking.homestayLocation}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-in:</span>
                  <span class="detail-value">${new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out:</span>
                  <span class="detail-value">${new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${booking.nights} Night(s)</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Rooms:</span>
                  <span class="detail-value">${booking.rooms} Room(s)</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Guests:</span>
                  <span class="detail-value">${booking.guests} Guest(s)</span>
                </div>
              </div>

              <div class="details">
                <h3>Payment Summary</h3>
                <div class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value">NPR ${booking.totalPrice.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Paid Now:</span>
                  <span class="detail-value">NPR ${booking.advancePayment.toLocaleString()}</span>
                </div>
                ${booking.remainingPayment > 0 ? `
                <div class="detail-row">
                  <span class="detail-label">Due at Property:</span>
                  <span class="detail-value">NPR ${booking.remainingPayment.toLocaleString()}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value">${booking.khaltiTransactionId}</span>
                </div>
              </div>

              ${booking.remainingPayment > 0 ? `
              <div class="important-info">
                <strong>⚠️ Important:</strong> Remaining amount of NPR ${booking.remainingPayment.toLocaleString()} to be paid at the property during check-in.
              </div>
              ` : ''}

              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Your booking is confirmed! No further action needed</li>
                <li>The host will contact you if needed</li>
                <li>Check your booking anytime in "My Bookings" from your profile menu</li>
                <li>Save this confirmation email for your records</li>
              </ul>

              <p><strong>Check-in Information:</strong></p>
              <ul>
                <li>Please bring a valid ID proof</li>
                ${booking.remainingPayment > 0 ? '<li>Bring NPR ' + booking.remainingPayment.toLocaleString() + ' for remaining payment</li>' : ''}
              </ul>
            </div>
            <div class="footer">
              <p>Have a wonderful stay! 🏡</p>
              <p>© ${new Date().getFullYear()} Local Homestay Booking System</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent to:', booking.guestEmail);
    return { success: true };

  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
};