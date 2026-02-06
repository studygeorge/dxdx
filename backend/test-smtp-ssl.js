const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  console.log('🔄 Testing SMTP with SSL (Port 465)...\n');

  const config = {
    host: 'eu.appsuite.cloud',
    port: 465,
    secure: true, // ✅ SSL
    auth: {
      user: 'noreply@dxcapital-ai.com',
      pass: '32thA47JQ429aZb7o72xqk'
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
  console.log('Secure:', config.secure);
  console.log('User:', config.auth.user);
  console.log('\n');

  const transporter = nodemailer.createTransport(config);

  try {
    console.log('�� Step 1: Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ Connection verified!\n');

    console.log('🔄 Step 2: Sending test email...');
    const info = await transporter.sendMail({
      from: `"DXCapital Test" <${config.auth.user}>`,
      to: 'boxplanetbuy@gmail.com',
      subject: 'Test Email from DXCapital (SSL) - ' + new Date().toISOString(),
      text: 'This is a test email using SSL port 465.',
      html: '<b>This is a test email using SSL port 465.</b>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n✅ SSL connection works! Update .env with:');
    console.log('SMTP_PORT=465');
    console.log('SMTP_SECURE=true');
  } catch (error) {
    console.error('\n❌ SSL Test Failed:', error.message);
    console.error('Code:', error.code);
    console.error('Response:', error.response);
    process.exit(1);
  }
}

testSMTP();
