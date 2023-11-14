const router = require('express').Router();
const mongoose = require('mongoose');

// Models
const CreatorCertificateModel = require('../models/creator-certificate');


// Create creator-certificate route
router.put("/", async (req, res) => {
  const { creatorId, courseId } = req.body;

  if (!creatorId || !courseId) {
    return res.status(400).json({ message: "creatorId and courseId are required fields" }); // TODO: Implement error codes
  }

  if (!mongoose.Types.ObjectId.isValid(creatorId) || !mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "creatorId and courseId must be valid ObjectIds" }); // TODO: Implement error codes
  }

  // Create new creator-certificate
  const newCreatorCertificate = new CreatorCertificateModel({
    creatorId,
    courseId,
  });

  const duplicate = await CreatorCertificateModel.findOne({ creatorId: creatorId, courseId: courseId });

  if (duplicate) {
    return res.status(400).json({ message: "a certificate for this course and user already exists" }); // TODO: Implement error codes
  }

  try {
    const savedCreatorCertificate = await newCreatorCertificate.save();
    return res.status(201).json(savedCreatorCertificate);
  } catch (err) {
    return res.status(400).send(err);
  }
});

// Get specific creator-certificate route
router.get("/", async (req, res) => {
  try {
    const { creatorId, courseId } = req.query;
    const { admin } = req.body;

    //validate Ids
    if (!creatorId || !courseId) {
      if (admin) {
        const list = await CreatorCertificateModel.find();
        return res.status(200).send(list);
      }
      return res.status(400).json({ message: "creatorId and courseId are required fields" }); // TODO: Implement error codes
    }

    if (!mongoose.Types.ObjectId.isValid(creatorId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "creatorId and courseId must be valid ObjectIds" }); // TODO: Implement error codes
    }
    // Find creator-certificate by creatorId and courseId
    const certificate = await CreatorCertificateModel.findOne({ creatorId, courseId });
    return res.status(200).send(certificate);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "No works or something" }); //TODO: Implement errors codes
  }

});

module.exports = router;