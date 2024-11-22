// const express = require('express');
// const mammoth = require('mammoth');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const port = 3002;
// app.use(express.json())
// app.post('/extract-metadata', (req, res) => {
//    console.log(req.body)
//     const { filePath } = req.body;
  
//   if (!filePath || !fs.existsSync(filePath)) {
//     return res.status(400).send({ error: 'Invalid file path' });
//   }

//   mammoth.extractRawText({ path: filePath })
//     .then(result => {
      
//       res.json(result);
//     })
//     .catch(err => {
//     console.log(err)
//       res.status(500).send({ error: `{err}Error extracting metadata` });
//     });
// });

// app.listen(port, () => {
//   console.log(`Metadata Extraction Service running at http://localhost:${port}`);
// });

const express = require('express');
const fs = require('fs');
const path = require('path');
const docx = require('docx');
const mammoth = require('mammoth');

const app = express();
const port = 3002;

// Middleware to parse JSON body
app.use(express.json()); // Ensures the request body is parsed correctly

// Function to extract metadata from a .docx file using the `docx` library
const extractMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    const fileBuffer = fs.readFileSync(filePath);

    // Load .docx file using docx library to extract metadata
    const reader = new docx.Packer();
    reader.load(fileBuffer).then((doc) => {
      const metadata = {
        author: doc.coreProperties.creator || 'Unknown',
        title: doc.coreProperties.title || 'Untitled',
        subject: doc.coreProperties.subject || 'No Subject',
        keywords: doc.coreProperties.keywords || 'No Keywords',
        lastModifiedBy: doc.coreProperties.lastModifiedBy || 'Unknown',
        created: doc.coreProperties.created || 'No Date',
        modified: doc.coreProperties.modified || 'No Date',
      };
      resolve(metadata);
    }).catch(reject);
  });
};

// Function to extract raw text content from .docx file using `mammoth` library
const extractText = (filePath) => {
  return new Promise((resolve, reject) => {
    mammoth.extractRawText({ path: filePath })
      .then((result) => {
        resolve(result.value); // The raw text content of the document
      })
      .catch(reject);
  });
};

app.post('/extract-metadata', async (req, res) => {
  const { filePath } = req.body;

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).send({ error: 'Invalid file path' });
  }

  try {
    // Extract both metadata and raw text
    const metadata = await extractMetadata(filePath);
    const rawText = await extractText(filePath);

    // Combine metadata and raw text into a single response
    const response = {
      metadata,
      rawText,
    };

    res.json(response); // Send metadata and text back as JSON
  } catch (err) {
    res.status(500).send({ error: 'Error extracting metadata or text', message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Metadata Extraction Service running at http://localhost:${port}`);
});
