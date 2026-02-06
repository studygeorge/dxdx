const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔄 Testing SMTP with info@dxcapital-ai.com...\n');

  // ✅ РАБОЧИЙ SMTP СЕРВЕР + info@dxcapital-ai.com
  const config = {
    host: 'smtp.ultamail.com',
    port: 587,
    secure: false,
    auth: {
      type: 'login',
      user: 'info@dxcapital-ai.com',
      pass: '@V3ri1S8eR0r'
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: console
  };

  console.log('📧 Configuration:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('Auth type:', config.auth.type);
  console.log('User:', config.auth.user);
  console.log('\n');

  const transporter = nodemailer.createTransport(config);

  try {
    console.log('🔄 Verifying connection with LOGIN method...');
    await transporter.verify();
    console.log('\n✅ Connection verified!\n');

    console.log('🔄 Sending test email...');
    const info = await transporter.sendMail({
      from: '"DXCapital Info" <info@dxcapital-ai.com>',
      to: 'boxplanetbuy@gmail.com',
      subject: 'Test from INFO - ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f0f0f0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2dd4bf;">✅ Email from info@dxcapital-ai.com</h2>
            <p>This email was sent at: <strong>${new Date().toLocaleString()}</strong></p>
            <p><strong>From:</strong> info@dxcapital-ai.com</p>
            <p>SMTP Configuration:</p>
            <ul>
              <li>Host: smtp.ultamail.com</li>
              <li>Port: 587</li>
              <li>Auth: LOGIN</li>
            </ul>
            <hr>
            <p style="color: #666; font-size: 12px;">DXCapital Support Team</p>
          </div>
        </div>
      `
    });

    console.log('\n✅ Email sent successfully from info@dxcapital-ai.com!');
    console.log('Message ID:', info.messageId);
    console.log('\n🎉 SUCCESS! Check boxplanetbuy@gmail.com');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Code:', error.code);
    console.error('Response:', error.response);
  }
}

testSMTP();