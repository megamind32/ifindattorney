const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('./public/Legal-Practitioners-Renumeration-Order-2023.pdf');

pdf(dataBuffer).then(data => {
    console.log('Pages:', data.numpages);
    console.log('Text length:', data.text.length);
    console.log('---TEXT START---');
    console.log(data.text);
}).catch(err => {
    console.error('Error:', err.message);
});
