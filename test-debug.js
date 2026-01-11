const puppeteer = require('puppeteer');

async function testSearch() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.goto('https://www.nigerianbar.org.ng/find-a-lawyer', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  const input = await page.$('input[placeholder*="name"]');
  if (input) {
    await input.click({ clickCount: 3 });
    await input.type('Femi Falana', { delay: 50 });
    await page.keyboard.press('Enter');
  }
  
  await new Promise(r => setTimeout(r, 3000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('=== PAGE TEXT ===');
  console.log(text.substring(0, 2000));
  
  await browser.close();
}

testSearch();
