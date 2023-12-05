const { generateStudentPDF } = require('../../helpers/pdfGenerator');
const fs = require('fs');
const path = require('path');

// This test is a bit more of an integration test, but I see more value in testing
// the integration of these modules than testing puppeteer.

describe('generateStudentPDF', () => {
	const mockCertificateInfo = {
		studentName: 'Thomas Anderson',
		creatorName: 'Morpheus',
		courseName: 'Kung fu',
		dateOfCompletion: new Date('1999-05-07'),
		estimatedCourseDuration: 10,
	};

	const studentId = '507f1f77bcf86cd799439011';
	const courseId = '507f191e810c19729de860ea';

	let filePath;

	afterEach(() => {
		// Delete the file if it exists
		if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
	});

	// TODO: Verify file path, and possibly make it save to a test folder during tests?
	it('should generate a PDF', async () => {
		filePath = await generateStudentPDF(mockCertificateInfo, studentId, courseId);

		// expect(filePath).toMatch(/{PATH}[a-f0-9]+\.pdf/);
		expect(fs.existsSync(filePath)).toBe(true);
	});
});
