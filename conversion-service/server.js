const express = require('express');
// const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
// const fontkit = require('fontkit');
const app = express();
const port = 3004;
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);
app.use(express.json())



const { spawn } = require('child_process');

function spawnPromise(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    
    let output = '';
    let errorOutput = '';

    // Handle stdout and stderr
    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(`Error: ${errorOutput || 'Unknown error'}`);
      }
    });
  });
}

async function convertDocxToPdf(inputFilePath, outputDir) {
  const command = 'libreoffice7.6';
  const args = ['--headless', '--convert-to', 'pdf', '--outdir', outputDir, inputFilePath];
  
  try {
    const result = await spawnPromise(command, args);
    console.log('Conversion successful:', result);
    
    return outputDir;
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}


app.post('/convert-to-pdf', async (req, res) => {
  const { filePath } = req.body;

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).send({ error: 'Invalid file path' });
  }

  try {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir); // Create the directory if it doesn't exist
      }
      const uniqueFileName = Date.now() + '.pdf';
    const pdfPath = await convertDocxToPdf(filePath,uploadDir)

    res.json({ pdfPath });
  } catch (err) {
    res.status(500).send({ error: 'Error converting file to PDF' , message: err });
  }
});

app.listen(port, () => {
  console.log(`Conversion Service running at http://localhost:${port}`);
});
