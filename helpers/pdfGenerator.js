const puppeteer = require('puppeteer');
const { getStudentHtml } = require('./templates');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// This can be reworked into a global variable if it causes problems with tests.
const APP_DIR_PATH = path.dirname(require.main.filename);

// Function to generate a unique ID
function generateUniqueId() {
  return uuidv4();
}

// TODO: Make sure this directory exists before writing files to it
const TEMP_DIRECTORY_PATH = path.join(APP_DIR_PATH, '__temp_certificates__');

/**
 * Generates a PDF for a student certificate
 * 
 * certificateInfo: Object {
    * studentName: String
    * creatorName: String
    * courseName: String
    * dateOfCompletion: Date
    * estimatedCourseDuration: Number
 * }
 * returns filePath: String
 */
module.exports.generateStudentPDF = async (certificateInfo) => {
  // Launch a headless browser
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  // Set the content of the page with your HTML
  const htmlContent = await getStudentHtml(certificateInfo);
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Generate filename
  const uniqueId = generateUniqueId();
  const filePath = path.join(TEMP_DIRECTORY_PATH, `${uniqueId}.pdf`);

  console.log('Saving with FilePath:', filePath);

  // Set the dimensions of the PDF
  const pdfOptions = {
    path: filePath,
    width: '842px',
    height: '595px',
  };

  // Generate PDF from the HTML content
  await page.pdf(pdfOptions);

  // Close the browser
  await browser.close();

  return filePath;
}
