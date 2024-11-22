const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded.' });
  }

  res.json({ filePath: req.file.path });
});

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
function convertFilename(filename) {
  // Check if the filename ends with ".docx" and replace it with ".pdf"
  if (filename.endsWith(".docx")) {
      return filename.slice(0, -5) + ".pdf";
  }
  
  // Return the original filename if it doesn't have ".docx"
  return filename;
}

async function convertDocxToPdf(inputFilePath, outputDir) {
  const command = 'libreoffice7.6';
  const args = ['--headless', '--convert-to', 'pdf', '--outdir', outputDir, inputFilePath];
  
  try {
    const result = await spawnPromise(command, args);
    console.log('Conversion successful:', result);
    const returnPath = convertFilename(inputFilePath);
    // console.log(inputFilePath,returnPath)
    return returnPath;
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}


app.post('/convert-to-pdf', async (req, res) => {
  const { filePath } = req.body;
  const fullPath = path.join(__dirname,filePath);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).send({ error: 'Invalid file path' });
  }
   
  try {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir); // Create the directory if it doesn't exist
      }
    const pdfPath = await convertDocxToPdf(fullPath,uploadDir)

    res.json({ pdfPath });
  } catch (err) {
    res.status(500).send({ error: 'Error converting file to PDF' , message: err });
  }
});

app.listen(port, () => {
  console.log(`Conversion Service running at http://localhost:${port}`);
});
