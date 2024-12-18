const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');
const xml2js = require('xml2js');
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


async function extractMetadata(filePath) {
  try {
    const metadata = {};

    // Open the .docx file as a zip archive
    await fs
      .createReadStream(filePath)
      .pipe(unzipper.Parse())
      .on('entry', async (entry) => {
        const fileName = entry.path;

        // Look for the `core.xml` file inside `docProps/`
        if (fileName === 'docProps/core.xml') {
          const xmlBuffer = await entry.buffer();

          // Parse the XML to extract metadata
          xml2js.parseString(xmlBuffer, (err, result) => {
            if (err) {
              console.error('Error parsing XML:', err);
            } else {
              const coreProps = result['cp:coreProperties'];
              metadata.title = coreProps['dc:title']?.[0] || 'Untitled';
              metadata.creator = coreProps['dc:creator']?.[0] || 'Unknown';
              metadata.subject = coreProps['dc:subject']?.[0] || 'No Subject';
              metadata.created = coreProps['dcterms:created']?.[0]._ || 'Unknown';
              metadata.modified = coreProps['dcterms:modified']?.[0]._ || 'Unknown';

              console.log('Metadata:', metadata);
            }
          });
        } else {
          entry.autodrain();
        }
      })
      .promise();

    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
  }
}

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
  const command = 'libreoffice';
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
app.get('/',async (req,res)=>{
  res.sendFile(path.join(__dirname,"index.html"));
})

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

    // res.json({ pdfPath });
    res.download(pdfPath, path.basename(pdfPath), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error downloading the file.');
      }
  });
  } catch (err) {
    res.status(500).send({ error: 'Error converting file to PDF' , message: err });
  }
});

app.post('/extract-metadata',async (req,res)=>{

  try{
  const {filePath} = req.body;
  const metadata = await extractMetadata(filePath);
  res.json(metadata);}
  catch (err) {
    res.status(500).send({ error: 'Error getting metadata' , message: err });
  }
})

app.listen(port, () => {
  console.log(`Conversion Service running at http://localhost:${port}`);
});
