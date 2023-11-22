const mustache = require('mustache');
const fs = require('fs').promises;
const path = require('path');

// This can be reworked into a global variable if it causes problems with tests.
const APP_DIR_PATH = path.dirname(require.main.filename);

// TODO: Don't know how well mustache sanitizes user input.
// Doesn't seem to be injectable at a glance, but should be investigated further.

/**
 * Generates html for a student certificate
 * 
 * certificateInfo: Object {
    * studentName: String
    * creatorName: String
    * courseName: String
    * dateOfCompletion: Date
    * estimatedCourseDuration: Number
 * }
 * returns html: String
 */
module.exports.getStudentHtml = async (certificateInfo) => {
  // Set paths from project root
  const templatePath = path.join(APP_DIR_PATH, 'assets', 'templates', 'student-template.html');
  const logoPath = path.join(APP_DIR_PATH, 'assets', 'images', 'educado-logo-text.svg');
  // TODO: Import a library to create these, once we know what they're supposed to do 🤷‍♂️
  const qrPath = path.join(APP_DIR_PATH, 'assets', 'images', 'qr-placeholder.svg');

  // Read the HTML template from the file
  const template = await fs.readFile(templatePath, 'utf-8');
  const logoBase64 = btoa(await fs.readFile(logoPath, 'utf-8'));
  const qrBase64 = btoa(await fs.readFile(qrPath, 'utf-8'));

  // Gather data to use on the template
  const data = {
    ...certificateInfo,
    dateOfCompletion: certificateInfo.dateOfCompletion.toLocaleDateString('en-US'),
    logoBase64: logoBase64,
    qrBase64: qrBase64,
  }

  // Render the template with Mustache
  const html = mustache.render(template, data);

  return html;
}
