const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  console.log('🔄 Testing SMTP with STARTTLS (Port 587)...\n');

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
  console.log('Password:', config.auth.pass.substring(0, 5) + '***');
  console.log('\n');

  const transporter = nodemailer.createTransport(config);

  try {
    console.log('🔄 Step 1: Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ Connection verified!\n');

    console.log('🔄 Step 2: Sending test email...');
    const info = await transporter.sendMail({
      from: `"DXCapital Test" <${config.auth.user}>`,
      to: 'boxplanetbuy@gmail.com',
      subject: 'Test Email from DXCapital - ' + new Date().toISOString(),
      text: 'This is a test email from DXCapital backend.',
      html: '<b>This is a test email from DXCapital backend.</b><br><p>Sent at: ' + new Date().toLocaleString() + '</p>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ SMTP Test Failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Response:', error.response);
    console.error('Command:', error.command);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔍 Authentication failed. Possible causes:');
      console.error('1. ❌ Incorrect username or password');
      console.error('2. ❌ SMTP access not enabled in UltaMail');
      console.error('3. ❌ Wrong server/port combination');
      console.error('\n💡 Solutions:');
      console.error('- Try port 465: node test-smtp-ssl.js');
      console.error('- Check password at https://eu.appsuite.cloud');
      console.error('- Enable SMTP in Settings → Mail → Accounts');
    }
    
    process.exit(1);
  }
}

testSMTP();
