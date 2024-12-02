const puppeteer = require('puppeteer');
const { getStudentHtml, getCreatorHtml } = require('./templates');
const crypto = require('crypto')
const path = require('path');
const fs = require('fs');

// This can be reworked into a global variable if it causes problems with tests.
const ROOT_PATH = path.join(__dirname, '..');

const TEMP_DIRECTORY_PATH = path.join(ROOT_PATH, '__temp_certificates__');

if (!fs.existsSync(TEMP_DIRECTORY_PATH)) {
  console.log('Creating temp directory:', TEMP_DIRECTORY_PATH);
  fs.mkdirSync(TEMP_DIRECTORY_PATH);
}

// Generate filename as md5 hash of studentId and courseId
const generateFileName = (studentId, courseId) => {
  const certificateHash = crypto.createHash('md5')
    .update(`${studentId}-${courseId}`)
    .digest("hex");
  
  return certificateHash;
}

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
module.exports.generateCreatorPDF = async (certificateInfo, creatorId, courseId) => {
  // Launch a headless browser
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  // Set the content of the page with your HTML
  const htmlContent = await getCreatorHtml(certificateInfo);
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Generate filename from certificate info
  const fileName = generateFileName(creatorId, courseId);
  const filePath = path.join(TEMP_DIRECTORY_PATH, `${fileName}.pdf`);

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
module.exports.generateStudentPDF = async (certificateInfo, studentId, courseId) => {
  // Launch a headless browser
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  // Set the content of the page with your HTML
  const htmlContent = await getStudentHtml(certificateInfo);
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Generate filename from certificate info
  const fileName = generateFileName(studentId, courseId);
  const filePath = path.join(TEMP_DIRECTORY_PATH, `${fileName}.pdf`);

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
