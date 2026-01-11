const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('Navigating to NBA...');
  await page.goto('https://www.nigerianbar.org.ng/find-a-lawyer', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  
  // Wait for React to load
  console.log('Waiting for React app to load...');
  await new Promise(r => setTimeout(r, 3000));
  
  // Find the search input
  const inputSelector = 'input[placeholder*="name"]';
  await page.waitForSelector(inputSelector, { timeout: 10000 });
  
  console.log('Found search input, typing name...');
  
  // Type the lawyer name
  const lawyerName = 'Festus Keyamo';
  await page.type(inputSelector, lawyerName, { delay: 100 });
  
  console.log('Typed:', lawyerName);
  
  // Press Enter to search
  await page.keyboard.press('Enter');
  console.log('Pressed Enter');
  
  // Wait for results
  await new Promise(r => setTimeout(r, 3000));
  
  // Get page text to parse results
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('\n=== PAGE TEXT ===');
  console.log(pageText.substring(0, 1500));
  
  // Try to click on the first result to get details
  console.log('\nLooking for clickable result...');
  
  // Click on the lawyer card/result
  const clicked = await page.evaluate(() => {
    // Look for elements containing the lawyer name or SCN
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      const text = el.textContent || '';
      if (text.includes('KEYAMO') && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
        // Check if this is a clickable element
        if (el.onclick || el.tagName === 'BUTTON' || el.tagName === 'A' || 
            el.classList.contains('cursor-pointer') || el.style.cursor === 'pointer') {
          el.click();
          return { clicked: true, tag: el.tagName, text: text.substring(0, 100) };
        }
      }
    }
    // Try clicking any element that looks like a card
    const cards = document.querySelectorAll('[class*="card"], [class*="result"], [class*="item"]');
    for (const card of cards) {
      if (card.textContent?.includes('KEYAMO') || card.textContent?.includes('SCN')) {
        card.click();
        return { clicked: true, tag: card.tagName, className: card.className };
      }
    }
    return { clicked: false };
  });
  
  console.log('Click result:', clicked);
  
  // Wait for details to load
  await new Promise(r => setTimeout(r, 3000));
  
  // Get page text after click
  const detailsText = await page.evaluate(() => document.body.innerText);
  console.log('\n=== AFTER CLICK ===');
  console.log(detailsText.substring(0, 2000));
  
  // Take final screenshot
  await page.screenshot({ path: '/tmp/nba-details.png', fullPage: true });
  console.log('\nScreenshot saved to /tmp/nba-details.png');

  await browser.close();
})();
