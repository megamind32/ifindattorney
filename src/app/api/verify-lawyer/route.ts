import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface LawyerDetails {
  name: string;
  enrollmentNumber?: string;
  yearOfCall?: string;
  branch?: string;
  state?: string;
  status?: string;
  type?: string;
  source?: string;
}

interface VerifyResponse {
  found: boolean;
  lawyerName: string;
  message: string;
  lawyers: LawyerDetails[];
  totalCount: number;
  nbaLink: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
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
          nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
        },
        { status: 400 }
      );
    }

    console.log('Verifying lawyer via NBA website:', lawyerName);

    // Use Puppeteer to search NBA website
    const searchResults = await searchNBAWithPuppeteer(lawyerName);

    if (searchResults.found && searchResults.lawyers.length > 0) {
      const count = searchResults.lawyers.length;
      return NextResponse.json({
        found: true,
        lawyerName: lawyerName,
        message: `Found ${count} lawyer${count > 1 ? 's' : ''} matching "${lawyerName}" in the NBA database.`,
        lawyers: searchResults.lawyers,
        totalCount: searchResults.totalCount || count,
        nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
      });
    } else {
      return NextResponse.json({
        found: false,
        lawyerName: lawyerName,
        message: `No lawyers found matching "${lawyerName}". Please verify the name spelling, or visit the NBA website to search directly.`,
        lawyers: [],
        totalCount: 0,
        nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      {
        found: false,
        lawyerName: '',
        message: 'An error occurred while verifying the lawyer. Please try again.',
        lawyers: [],
        totalCount: 0,
        nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
      },
      { status: 500 }
    );
  }
}

async function searchNBAWithPuppeteer(lawyerName: string): Promise<{
  found: boolean;
  lawyers: LawyerDetails[];
  totalCount?: number;
}> {
  let browser = null;
  
  try {
    console.log('Launching Puppeteer browser...');
    
    // Launch browser in headless mode
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });

    const page = await browser.newPage();
    
    // Set user agent to appear as a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to NBA Find a Lawyer page...');
    
    // Navigate to the NBA find-a-lawyer page
    await page.goto('https://www.nigerianbar.org.ng/find-a-lawyer', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for React app to load
    console.log('Waiting for page to load...');
    await new Promise(r => setTimeout(r, 3000));

    // Find the search input by its placeholder
    const inputSelector = 'input[placeholder*="name"]';
    
    try {
      await page.waitForSelector(inputSelector, { timeout: 10000 });
    } catch (e) {
      console.log('Could not find search input');
      return { found: false, lawyers: [] };
    }

    console.log('Found search input, typing name...');
    
    // Clear the input and type the lawyer's name
    await page.click(inputSelector, { clickCount: 3 }); // Select all
    await page.type(inputSelector, lawyerName, { delay: 50 });

    // Press Enter to search
    console.log('Pressing Enter to search...');
    await page.keyboard.press('Enter');

    // Wait for results to load
    await new Promise(r => setTimeout(r, 4000));

    // Extract the page text
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('Page text preview:', pageText.substring(0, 800));

    // Parse the results - get ALL lawyers
    const results = parseAllNBAResults(pageText);
    
    await browser.close();
    browser = null;

    return results;
  } catch (error) {
    console.error('Puppeteer search error:', error);
    return { found: false, lawyers: [] };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
  }
}

function parseAllNBAResults(pageText: string): { found: boolean; lawyers: LawyerDetails[]; totalCount?: number } {
  // The NBA page shows results in this format:
  // "All Legal Practitioners 2SANs 1"
  // Then a list of lawyers with:
  // NAME IN UPPERCASE (may include comma like "SURNAME, FIRSTNAME MIDDLENAME")
  // SCN123456 or SCN123456A
  // Legal Practitioner (or SAN)
  
  const lines = pageText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for the total count pattern
  const countMatch = pageText.match(/All Legal Practitioners\s*(\d+)/i);
  const sanCountMatch = pageText.match(/SANs\s*(\d+)/i);
  
  let totalCount = 0;
  if (countMatch) totalCount += parseInt(countMatch[1]) || 0;
  if (sanCountMatch) totalCount += parseInt(sanCountMatch[1]) || 0;
  
  console.log('Total count from header:', totalCount);
  
  // Find all SCN numbers (may have letters at end like SCN005160A)
  const scnPattern = /SCN\d+[A-Z]?/gi;
  const allSCNs = [...pageText.matchAll(scnPattern)].map(m => m[0].toUpperCase());
  
  console.log('Found SCN numbers:', allSCNs);
  
  if (totalCount === 0 && allSCNs.length === 0) {
    console.log('No results found');
    return { found: false, lawyers: [] };
  }
  
  // Parse all lawyers from the text
  const lawyers: LawyerDetails[] = [];
  
  // For each SCN, try to find the associated name
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is an SCN number (may have letter suffix)
    if (/^SCN\d+[A-Z]?$/i.test(line)) {
      const scn = line.toUpperCase();
      
      // Look backwards for the name (should be 1-2 lines before)
      let name = '';
      let type = '';
      
      // Name is typically 1 line before
      // Name patterns: "SURNAME FIRSTNAME" or "SURNAME, FIRSTNAME MIDDLENAME"
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const prevLine = lines[j];
        // Name is uppercase, may include comma, letters, spaces, hyphens, apostrophes
        // Must be at least 5 chars and not start with common non-name words
        const isNameLine = /^[A-Z][A-Z\s\-\'\.,]+$/.test(prevLine) && 
                          prevLine.length > 5 && 
                          !/^(SCN|Legal|SAN|All|Filter|Note|Find|The|JN|We|COMPANY|NBA|Download|Copyright)/i.test(prevLine);
        
        if (isNameLine) {
          name = prevLine;
          break;
        }
      }
      
      // Type is typically 1 line after
      for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
        const nextLine = lines[j].toLowerCase();
        if (nextLine.includes('legal practitioner')) {
          type = 'Legal Practitioner';
          break;
        } else if (nextLine === 'san' || nextLine.includes('senior advocate')) {
          type = 'Senior Advocate of Nigeria (SAN)';
          break;
        }
      }
      
      if (name) {
        // Avoid duplicates
        if (!lawyers.some(l => l.enrollmentNumber === scn)) {
          lawyers.push({
            name: name,
            enrollmentNumber: scn,
            type: type || 'Legal Practitioner',
            source: 'NBA Website (Direct Search)',
          });
        }
      }
    }
  }
  
  // If we found SCNs but couldn't parse names properly, try another approach
  if (lawyers.length === 0 && allSCNs.length > 0) {
    console.log('Trying alternative parsing...');
    
    // Look for uppercase name patterns followed by SCN
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // If line looks like a name (uppercase, may contain comma)
      const isNameLine = /^[A-Z][A-Z\s\-\'\.,]+$/.test(line) && 
                        line.length > 5 &&
                        !/^(SCN|Legal|SAN|All|Filter|Note|Find|The|JN|We|COMPANY|NBA|Download|Copyright)/i.test(line);
      
      if (isNameLine) {
        // Check next few lines for SCN
        for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
          const nextLine = lines[j];
          if (/^SCN\d+[A-Z]?$/i.test(nextLine)) {
            const scn = nextLine.toUpperCase();
            
            // Determine type
            let type = 'Legal Practitioner';
            for (let k = j + 1; k < Math.min(lines.length, j + 3); k++) {
              if (lines[k].toLowerCase().includes('san') || lines[k] === 'SAN') {
                type = 'Senior Advocate of Nigeria (SAN)';
                break;
              }
            }
            
            if (!lawyers.some(l => l.enrollmentNumber === scn)) {
              lawyers.push({
                name: line,
                enrollmentNumber: scn,
                type: type,
                source: 'NBA Website (Direct Search)',
              });
            }
            break;
          }
        }
      }
    }
  }
  
  console.log('Parsed lawyers:', lawyers.length);
  console.log('Lawyers:', JSON.stringify(lawyers, null, 2));
  
  return {
    found: lawyers.length > 0,
    lawyers: lawyers,
    totalCount: totalCount || lawyers.length,
  };
}
