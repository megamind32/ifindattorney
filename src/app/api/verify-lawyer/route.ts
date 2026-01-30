import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser, Page } from 'puppeteer';

interface LawyerDetails {
  fullName: string;
  scn: string;
  enrollmentNumber?: string;
  yearOfCall?: string;
  branch?: string;
  state?: string;
  status: string;
  source: string;
  sanStatus?: boolean;
}

interface VerifyResponse {
  found: boolean;
  lawyerName: string;
  message: string;
  lawyers: LawyerDetails[];
  totalCount: number;
  nbaLink: string;
  searchMethod: string;
}

// Cache for verification results
const verificationCache = new Map<string, { data: LawyerDetails[]; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

const NBA_WEBSITE_URL = 'https://www.nigerianbar.org.ng/find-a-lawyer';

export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  let browser: Browser | null = null;

  try {
    const { lawyerName } = await request.json();

    if (!lawyerName || lawyerName.trim().length === 0) {
      return NextResponse.json(
        {
          found: false,
          lawyerName: '',
          message: 'Please provide a lawyer name',
          lawyers: [],
          totalCount: 0,
          nbaLink: NBA_WEBSITE_URL,
          searchMethod: 'error',
        },
        { status: 400 }
      );
    }

    console.log('🤖 [AGENT] Starting lawyer verification for:', lawyerName);

    // Check cache first
    const cacheKey = lawyerName.toLowerCase().trim();
    const cached = verificationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('💾 [CACHE] Using cached result for:', lawyerName);
      return buildVerifyResponse(cached.data, lawyerName, 'cached');
    }

    // Launch browser and search
    console.log('🌐 [BROWSER] Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
      ],
    });

    const searchResults = await searchNBAWebsiteWithPuppeteer(browser, lawyerName);

    // Cache the results
    verificationCache.set(cacheKey, {
      data: searchResults.lawyers,
      timestamp: Date.now(),
    });

    return buildVerifyResponse(searchResults.lawyers, lawyerName, searchResults.searchMethod);
  } catch (error) {
    console.error('❌ [ERROR] Verification error:', error);
    return NextResponse.json(
      {
        found: false,
        lawyerName: '',
        message: 'An error occurred during verification. Please visit ' + NBA_WEBSITE_URL,
        lawyers: [],
        totalCount: 0,
        nbaLink: NBA_WEBSITE_URL,
        searchMethod: 'error',
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      console.log('🌐 [BROWSER] Closing browser instance...');
      await browser.close();
    }
  }
}

/**
 * Build standardized response
 */
function buildVerifyResponse(
  lawyers: LawyerDetails[],
  lawyerName: string,
  searchMethod: string
): NextResponse<VerifyResponse> {
  if (lawyers.length > 0) {
    const count = lawyers.length;
    return NextResponse.json({
      found: true,
      lawyerName: lawyerName,
      message: `✓ Found ${count} verified lawyer${count > 1 ? 's' : ''} in the NBA database. All results are direct from the Nigerian Bar Association website.`,
      lawyers: lawyers,
      totalCount: count,
      nbaLink: NBA_WEBSITE_URL,
      searchMethod: searchMethod,
    });
  } else {
    return NextResponse.json({
      found: false,
      lawyerName: lawyerName,
      message: `Unable to find "${lawyerName}" in the NBA database.\n\nTo verify a lawyer's credentials:\n✓ Visit: ${NBA_WEBSITE_URL}\n✓ Search directly in the NBA database\n✓ Look for their Supreme Court Number (SCN)\n\nTip: Try searching by surname or different name variations.`,
      lawyers: [],
      totalCount: 0,
      nbaLink: NBA_WEBSITE_URL,
      searchMethod: searchMethod,
    });
  }
}

/**
 * Search NBA website using Puppeteer with intelligent wait strategies
 */
async function searchNBAWebsiteWithPuppeteer(
  browser: Browser,
  lawyerName: string
): Promise<{ lawyers: LawyerDetails[]; searchMethod: string }> {
  let page: Page | null = null;

  try {
    console.log('📄 [PAGE] Creating new page instance...');
    page = await browser.newPage();

    // Set viewport to mimic desktop browser
    await page.setViewport({ width: 1920, height: 1080 });

    // Set user agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log(`🔗 [NAVIGATE] Going to NBA website: ${NBA_WEBSITE_URL}`);
    await page.goto(NBA_WEBSITE_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('⏳ [WAIT] Waiting for page to fully load...');
    await page.evaluate(() => new Promise(r => setTimeout(r, 2000))); // Let JavaScript load

    // Look for search input - try multiple selectors
    const searchSelectors = [
      'input[type="text"]',
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      'input[placeholder*="Name"]',
      'input[placeholder*="name"]',
      'input[id*="search"]',
      'input[class*="search"]',
    ];

    let searchInputFound = false;

    for (const selector of searchSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`✓ [FOUND] Search input with selector: ${selector}`);
        searchInputFound = true;

        // Clear any existing text
        await page.click(selector);
        await page.evaluate(sel => {
          (document.querySelector(sel) as HTMLInputElement).value = '';
        }, selector);

        // Type lawyer name slowly (human-like)
        console.log(`📝 [INPUT] Typing lawyer name: ${lawyerName}`);
        await page.type(selector, lawyerName, { delay: 50 });

        await page.evaluate(() => new Promise(r => setTimeout(r, 1000))); // Wait after typing

        // Try to find and click search button
        const searchButton = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => 
            btn.textContent?.toLowerCase().includes('search') ||
            btn.textContent?.toLowerCase().includes('find') ||
            btn.type === 'submit'
          )?.outerHTML;
        });

        if (searchButton) {
          console.log('🔍 [SEARCH] Found search button, clicking...');
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find(btn => 
              btn.textContent?.toLowerCase().includes('search') ||
              btn.textContent?.toLowerCase().includes('find') ||
              btn.type === 'submit'
            );
            if (btn) btn.click();
          });
        } else {
          // If no button, press Enter
          console.log('⏎ [INPUT] Pressing Enter to search...');
          await page.keyboard.press('Enter');
        }

        break;
      }
    }

    if (!searchInputFound) {
      console.warn('⚠️ [WARN] No search input found on page');
      // Try to take screenshot for debugging
      await page.screenshot({ path: '/tmp/nba_page.png' });
      console.log('📸 Screenshot saved to /tmp/nba_page.png');

      return {
        lawyers: [],
        searchMethod: 'puppeteer_no_search_input',
      };
    }

    // Wait for results to load
    console.log('⏳ [WAIT] Waiting for search results to appear...');
    await page.evaluate(() => new Promise(r => setTimeout(r, 3000))); // Wait for results

    // Try multiple wait strategies for results
    try {
      await Promise.race([
        page.waitForSelector('table', { timeout: 8000 }),
        page.waitForSelector('div[class*="result"]', { timeout: 8000 }),
        page.waitForSelector('div[class*="lawyer"]', { timeout: 8000 }),
        page.waitForSelector('tr', { timeout: 8000 }),
      ]).catch(() => {
        console.warn('⚠️ [WARN] Results not found with standard selectors');
      });
    } catch (e) {
      console.warn('⚠️ [WARN] Timeout waiting for results');
    }

    // Give extra time for results to render
    await page.evaluate(() => new Promise(r => setTimeout(r, 2000)));

    // Save page for debugging
    const html = await page.content();
    require('fs').writeFileSync(`/tmp/nba_search_${Date.now()}.html`, html);
    console.log('💾 [DEBUG] HTML saved for analysis');

    // Extract lawyer data from the page
    console.log('📊 [EXTRACT] Extracting lawyer data from page...');
    const lawyers = await extractLawyersFromPage(page);

    console.log(`✓ [SUCCESS] Extracted ${lawyers.length} lawyers`);

    return {
      lawyers,
      searchMethod: lawyers.length > 0 ? 'puppeteer_success' : 'puppeteer_no_results',
    };
  } catch (error) {
    console.error('❌ [PUPPETEER ERROR]', error instanceof Error ? error.message : error);

    // Save screenshot for debugging
    if (page) {
      try {
        await page.screenshot({ path: `/tmp/nba_error_${Date.now()}.png` });
        console.log('📸 Error screenshot saved');
      } catch (e) {
        console.warn('Could not save screenshot');
      }
    }

    return {
      lawyers: [],
      searchMethod: 'puppeteer_error',
    };
  } finally {
    if (page) {
      console.log('📄 [PAGE] Closing page...');
      await page.close();
    }
  }
}

/**
 * Extract lawyer data from rendered page
 * NBA website structure: Lawyer cards with name and SCN in same <p> element
 */
async function extractLawyersFromPage(page: Page): Promise<LawyerDetails[]> {
  const lawyers = await page.evaluate(() => {
    const results: LawyerDetails[] = [];

    // NBA structure: Each lawyer is in a div with class containing "px-6" and "hover:bg-[#EAFCE9]"
    // The lawyer name and SCN are in a <p> tag with:
    // - Name text before <span>
    // - SCN inside <span> tag
    
    // Target the specific NBA result structure
    const lawyerDivs = document.querySelectorAll('div.px-6[class*="border-b"]');

    lawyerDivs.forEach((div) => {
      try {
        // Find the main paragraph with lawyer info (usually second in flex container)
        const paragraphs = div.querySelectorAll('p');
        if (paragraphs.length >= 1) {
          // The lawyer info is typically in the first paragraph with text-sm text-[#101828]
          const lawyerParagraph = paragraphs[0] as HTMLParagraphElement;
          
          if (!lawyerParagraph) return;

          // Get the full text content
          const fullText = lawyerParagraph.innerText || '';
          
          // Extract name (everything before SCN)
          let name = '';
          let scn = '';

          // Look for SCN pattern in the element
          const scnSpan = lawyerParagraph.querySelector('span');
          if (scnSpan) {
            // SCN is in the span
            const scnText = (scnSpan as HTMLElement).innerText || '';
            const scnMatch = scnText.match(/SCN\s*[\d\-]*(\d{6}[A-Z]?)/i);
            if (scnMatch) {
              scn = scnText.trim();
            }

            // Name is everything except the span
            const nameDiv = document.createElement('div');
            nameDiv.innerHTML = lawyerParagraph.innerHTML;
            const span = nameDiv.querySelector('span');
            if (span) span.remove();
            name = nameDiv.innerText.trim();
          } else {
            // If no span, try to parse from full text
            const parts = fullText.split('\n').map(p => p.trim()).filter(p => p.length > 0);
            if (parts.length >= 2) {
              name = parts[0];
              scn = parts[1];
            } else if (parts.length === 1) {
              name = parts[0];
            }
          }

          // If we still don't have name, try another approach
          if (!name || name.length < 3) {
            const allText = lawyerParagraph.innerText.trim();
            const scnIdx = allText.indexOf('SCN');
            if (scnIdx > 0) {
              name = allText.substring(0, scnIdx).trim();
              scn = allText.substring(scnIdx).trim();
            } else {
              name = allText;
            }
          }

          // Validate and add result
          if (name && name.length > 3 && !name.match(/^\d+$/)) {
            // Check if this is a SAN (from the status text)
            let status = 'Legal Practitioner';
            const statusP = paragraphs[1] as HTMLParagraphElement | undefined || paragraphs[0] as HTMLParagraphElement;
            const statusText = statusP?.innerText || '';
            
            results.push({
              fullName: name.trim(),
              scn: scn || 'Not Found',
              status: statusText.includes('SAN') ? 'Senior Advocate of Nigeria' : status,
              source: 'Nigerian Bar Association (Puppeteer)',
              sanStatus: statusText.toLowerCase().includes('san'),
            });
          }
        }
      } catch (e) {
        // Skip this entry if parsing fails
        console.log('Parse error:', e);
      }
    });

    // If no results yet, try alternative structure (in case page layout changed)
    if (results.length === 0) {
      const altCards = document.querySelectorAll('[class*="flex"][class*="gap-3"]');
      
      altCards.forEach((card) => {
        const text = (card as HTMLElement).innerText || '';
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        if (lines.length >= 1 && !lines[0].match(/^\d$/)) { // Avoid single letter avatars
          const name = lines[0];
          
          let scn = '';
          for (const line of lines) {
            if (line.includes('SCN')) {
              scn = line;
              break;
            }
          }

          if (name.length > 3 && !name.match(/^\d+$/) && !results.find(r => r.fullName.toLowerCase() === name.toLowerCase())) {
            results.push({
              fullName: name,
              scn: scn || 'Not Found',
              status: 'Legal Practitioner',
              source: 'Nigerian Bar Association (Puppeteer)',
            });
          }
        }
      });
    }

    // Deduplicate by name (case-insensitive)
    const seen = new Set<string>();
    const uniqueResults = results.filter(r => {
      const key = r.fullName.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniqueResults.slice(0, 10); // Return max 10 results
  });

  return lawyers.filter(l => l && l.fullName && l.fullName.length > 0);
}

