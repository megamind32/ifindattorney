import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const dataBuffer = fs.readFileSync('./public/Legal-Practitioners-Renumeration-Order-2023.pdf');

try {
    const data = await pdf(dataBuffer);
    console.log('Pages:', data.numpages);
    console.log('Text length:', data.text.length);
    console.log('---TEXT START---');
    console.log(data.text);
} catch (err) {
    console.error('Error:', err.message);
}
