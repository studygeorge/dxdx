const nodemailer = require('nodemailer');

async function sendTestEmail() {
  console.log('📧 Sending test email from info@dxcapital-ai.com...\n');

  // ✅ Конфигурация для info@dxcapital-ai.com
  const transporter = nodemailer.createTransport({
    host: 'eu.appsuite.cloud',
    port: 587,
    secure: false,
    auth: {
      user: 'info@dxcapital-ai.com',
      pass: '@V3ri1S8eR0r'
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"DXCapital Info" <info@dxcapital-ai.com>',
      to: 'boxplanetbuy@gmail.com',
      subject: 'Test Email from INFO - ' + new Date().toLocaleString(),
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f0f0f0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2dd4bf;">✅ Test Email from INFO Account!</h2>
            <p>This email was sent at: <strong>${new Date().toLocaleString()}</strong></p>
            <p><strong>From:</strong> info@dxcapital-ai.com</p>
            <p>SMTP Configuration:</p>
            <ul>
              <li>Host: eu.appsuite.cloud</li>
              <li>Port: 587</li>
              <li>User: info@dxcapital-ai.com</li>
            </ul>
            <hr>
            <p style="color: #666; font-size: 12px;">DXCapital Support Team</p>
          </div>
        </div>
      `
    });

    console.log('✅ Email sent successfully from info@dxcapital-ai.com!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n🎉 Check your inbox: boxplanetbuy@gmail.com');
  } catch (error) {
    console.error('❌ Failed to send email from info@dxcapital-ai.com:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Response:', error.response);
  }
}

sendTestEmail();