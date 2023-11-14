const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentCertificateSchema = new Schema({
    
});

const StudentCertificateModel = mongoose.model('student-certificates', studentCertificateSchema);

module.exports = StudentCertificateModel;