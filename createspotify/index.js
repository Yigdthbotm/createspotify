console.clear();
const axios = require('axios');
require('@colors/colors');
const fs = require('fs');
const path = require('path');
const figlet = require('figlet');
const readline = require('readline');
const randomName = require('node-random-name');
const config = require('./config.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const generateAccount = async (index) => {
  const name = randomName({ random: Math.random }).toLowerCase().replace(/\s+/g, '');
  const number = Math.floor(Math.random() * 900 + 100);
  const username = `${name}${number}`;
  const email = `${username}@${config.domain}`;
  const password = config.password;

  try {
    const res = await axios.get(config.base_url, {
      headers: { Authorization: `Bearer ${config.bearer_token}` },
      params: { captchakey: config.captcha_key, username, email, password }
    });

    console.log(`\n[${index}] ACCOUNT SUCCESSFULLY CREATED ✅`.green.bold);
    console.log(`🧑 Username : `.blue + username.white);
    console.log(`📧 Email    : `.blue + email.white);
    console.log(`🔒 Password : `.blue + password.white);

    const filePath = path.join(__dirname, 'data', 'accounts.txt');
    const line = `${email}:${password}\n`;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.appendFileSync(filePath, line, 'utf8');

  } catch (err) {
    console.error(`\n[${index}] FAILED TO CREATE ACCOUNT ❌`.red.bold);
    if (err.response) {
      console.error(`Status: `.red + `${err.response.status}`.yellow);
      console.error('Data:'.red, err.response.data);
    } else {
      console.error(err.message.red);
    }
  }
};

figlet('NETVANCESPOTIFY', async (err, data) => {
  if (err) {
    console.error('Failed to make figlet'.red);
    start();
    return;
  }
  console.log(data.green.bold);
  start();
});

function start() {
  rl.question('How many accounts ( put number ) ? '.green.bold, async (jawaban) => {
    const jumlah = parseInt(jawaban);
    if (isNaN(jumlah) || jumlah <= 0) {
      console.log('⚠️  Number not valid.'.red);
      rl.close();
      return;
    }

    console.log(`\n[🚀] generating ${jumlah} accounts...\n`.cyan);
    const jobs = Array.from({ length: jumlah }, (_, i) => generateAccount(i + 1));
    await Promise.all(jobs);

    console.log(`\n[✅] Finished with ${jumlah} accounts!\n`.green.bold);
    rl.close();
  });
}