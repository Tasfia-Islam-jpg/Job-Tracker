const Job = require("../models/Job");

exports.createJob = async (req, res) => {
  const { company, position, status, location, link, notes, interviewDate, pdfData } = req.body;
  try {
    const newJob = new Job({
      company, position, status: status || "Applied", location: location || "Remote",
      link, notes, interviewDate, pdfData, user: req.user
    });
    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Server error while saving application." });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: "Server error while pulling list." });
  }
};

exports.updateJob = async (req, res) => {
  const { company, position, status, location, link, notes, interviewDate, pdfData } = req.body;
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job entry card not found." });

    if (job.user && job.user.toString() !== req.user) {
      return res.status(401).json({ msg: "User authorization denied." });
    }

    const updatedFields = {
      company: company || job.company,
      position: position || job.position,
      status: status || job.status,
      location: location !== undefined ? location : job.location,
      link: link !== undefined ? link : job.link,
      notes: notes !== undefined ? notes : job.notes,
      interviewDate: interviewDate !== undefined ? interviewDate : job.interviewDate,
      pdfData: pdfData !== undefined ? pdfData : job.pdfData, 
    };

    job = await Job.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true });
    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Server error while updating card." });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job entry card not found." });

    // 🟢 RECOVERY FIX: Allows deletion if card has an empty user owner record
    if (job.user && job.user.toString() !== req.user) {
      return res.status(401).json({ msg: "User authorization denied." });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ msg: "Application removed permanently." });
  } catch (err) {
    res.status(500).json({ msg: "Server error while deleting card." });
  }
};