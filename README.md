### Documentation for Word to PDF Conversion Project

---

## Project Overview

This project is a **Word to PDF Conversion Web Application** that allows users to upload `.docx` files, convert them to `.pdf` format, and download the converted files. Additionally, it includes a service to extract metadata and raw text from `.docx` files.

---

## Features

### 1. Word to PDF Conversion:
- Upload `.docx` files via a user-friendly web interface.
- Convert `.docx` files to `.pdf` format using **LibreOffice**.
- Download the converted `.pdf` file.

### 2. Metadata Extraction:
- Extract metadata (e.g., author, title, subject) from `.docx` files.

---

## Directory Structure

```
/
├── .github/workflows/ci-cd.yml  # GitHub Actions workflow for CI/CD
├── uploads/                     # Directory for storing uploaded files
├── .dockerignore                # Docker ignore file
├── .gitignore                   # Git ignore file
├── Dockerfile                   # Docker configuration
├── index.html                   # Frontend for the Word to PDF converter
├── package.json                 # Node.js dependencies for main service
├── package-lock.json            # Lockfile for package versions
├── README.md                    # Documentation (to be added)
└── server.js                    # Backend server for conversion
```

---

## Installation

### Prerequisites
- **Node.js** (>=16.0.0)
- **Docker** (Optional for containerized deployment)
- **LibreOffice** (Installed and accessible via command line)

### Steps
1. Clone the repository:
   ```bash
   git clone github.com/harry2262/DocToPDF
   cd DocToPDF

   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the services:
   - Conversion Service:
     ```bash
     node server.js
    

4. Access the application:
   - Open [http://localhost:3001](http://localhost:3001) for the main application.

---

## API Endpoints

### 1. **File Upload**
- **Endpoint:** `POST /upload`
- **Description:** Upload a `.docx` file to the server.
- **Response:**
  - `filePath`: Path to the uploaded file.

### 2. **Convert to PDF**
- **Endpoint:** `POST /convert-to-pdf`
- **Payload:** `{ "filePath": "path/to/uploaded/file" }`
- **Description:** Converts a `.docx` file to `.pdf`.
- **Response:** Directly triggers a file download of the converted `.pdf`.

### 3. **Extract Metadata**
- **Endpoint:** `POST /extract-metadata`
- **Payload:** `{ "filePath": "path/to/uploaded/file" }`
- **Description:** Extracts metadata and raw text from a `.docx` file.
- **Response:**
  ```json
  {
    "metadata": {
      "author": "Author Name",
      "title": "Document Title",
      "subject": "Document Subject"
    },
  }
  ```

---

## Deployment with Docker

1. Build the Docker image:
   ```bash
   docker build -t word-to-pdf .
   ```

2. Run the container:
   ```bash
   docker run -p 3001:3001 word-to-pdf
   ```

3. Access the services as described in the Installation section.

---

## Frontend Details

### Technologies Used
- **HTML** with **Bootstrap** for responsive UI.
- JavaScript for handling API interactions and file downloads.

### Features
- Upload files via form.
- Display metadata.
- Indicate conversion progress with a loading spinner.

---

## Backend Details

### Technologies Used
- **Node.js** with **Express.js** framework.
- **Multer** for handling file uploads.
- **LibreOffice** for `.docx` to `.pdf` conversion.



## License

This project is licensed under the **MIT License**.

---
