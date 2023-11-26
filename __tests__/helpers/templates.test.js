const { getStudentHtml } = require('../../helpers/templates');

describe('getStudentHtml', () => {
	const mockCertificateInfo = {
		studentName: 'Thomas Anderson',
		creatorName: 'Morpheus',
		courseName: 'Kung fu',
		dateOfCompletion: new Date('1999-05-07'),
		estimatedCourseDuration: 10,
	};

  it('returns HTML with valid data', async () => {
    const html = await getStudentHtml(mockCertificateInfo);

    expect(html).toContain(mockCertificateInfo.studentName);
    expect(html).toContain(mockCertificateInfo.creatorName);
    expect(html).toContain(mockCertificateInfo.courseName);
    expect(html).toContain(mockCertificateInfo.estimatedCourseDuration.toString());
		expect(html).toContain(mockCertificateInfo.dateOfCompletion.toLocaleDateString('en-US')
			.replace(/\//g, '&#x2F;') // Mustache shields us from the horrors of slashes
		);
  });
});
