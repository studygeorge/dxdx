const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔄 Testing SMTP with fully hardcoded credentials (no .env)...\n');

  // ✅ ПОЛНОСТЬЮ ЗАХАРДКОЖЕННЫЕ ДАННЫЕ
  const config = {
    host: 'eu.appsuite.cloud',
    port: 587,
    secure: false,
    auth: {
      user: 'noreply@dxcapital-ai.com',
      pass: '32thA47JQ429aZb7o72xqk'
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    debug: true,
    logger: console
  };

  console.log('📧 Configuration:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('Secure:', config.secure);
  console.log('User:', config.auth.user);
  console.log('Pass:', config.auth.pass.substring(0, 5) + '***' + config.auth.pass.substring(config.auth.pass.length - 3));
  console.log('Pass length:', config.auth.pass.length);
  console.log('Pass exact:', config.auth.pass); // ✅ Покажем полный пароль для проверки
  console.log('\n');

  const transporter = nodemailer.createTransport(config);

  try {
    console.log('🔄 Step 1: Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!\n');

    console.log('🔄 Step 2: Sending test email to boxplanetbuy@gmail.com...');
    const info = await transporter.sendMail({
      from: '"DXCapital Test" <noreply@dxcapital-ai.com>',
      to: 'boxplanetbuy@gmail.com',
      subject: 'SMTP Test - Hardcoded Credentials - ' + new Date().toISOString(),
      text: 'This email confirms SMTP is working with hardcoded credentials.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2dd4bf;">✅ SMTP Test Successful!</h2>
          <p>This email was sent using <strong>hardcoded credentials</strong> (not from .env file).</p>
          <p><strong>Server:</strong> eu.appsuite.cloud</p>
          <p><strong>Port:</strong> 587</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">DXCapital Backend Test</p>
        </div>
      `
    });

    console.log('\n✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n🎉 SUCCESS! SMTP works perfectly with these credentials.');
    console.log('\n📝 Now update your backend/.env file with:');
    console.log('SMTP_HOST=eu.appsuite.cloud');
    console.log('SMTP_PORT=587');
    console.log('SMTP_SECURE=false');
    console.log('EMAIL_USER=noreply@dxcapital-ai.com');
    console.log('EMAIL_PASSWORD=32thA47JQ429aZb7o72xqk');
    console.log('\nThen restart backend: pm2 restart dxcapai-backend');

  } catch (error) {
    console.error('\n❌ SMTP Test Failed!');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Server response:', error.response);
    console.error('Command:', error.command);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔍 Authentication failed with these exact credentials:');
      console.error('Username:', config.auth.user);
      console.error('Password:', config.auth.pass);
      console.error('\n💡 Possible solutions:');
      console.error('1. Reset password at https://eu.appsuite.cloud');
      console.error('2. Check if SMTP is enabled in UltaMail settings');
      console.error('3. Try logging into https://eu.appsuite.cloud with these credentials');
      console.error('4. Contact UltaHost support');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('\n🔍 Connection failed to eu.appsuite.cloud:587');
      console.error('💡 Check firewall or network connectivity');
    } else {
      console.error('\n🔍 Unknown error. Full error object:');
      console.error(error);
    }
    
    process.exit(1);
  }
}

console.log('═══════════════════════════════════════════════════════');
console.log('  DXCapital SMTP Test - Hardcoded Credentials');
console.log('═══════════════════════════════════════════════════════\n');

testSMTP();
