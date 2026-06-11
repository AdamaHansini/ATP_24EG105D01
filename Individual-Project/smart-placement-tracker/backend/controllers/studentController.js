import Student from '../models/Student.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import { sendEmail } from '../config/nodemailer.js';

// @desc    Get all students with optional filters (TPO only)
// @route   GET /api/students
// @access  Private/TPO
const getAllStudents = async (req, res, next) => {
  try {
    const { branch, minCGPA, maxCGPA, placedStatus } = req.query;
    const filter = {};

    if (branch) filter.branch = branch;
    if (minCGPA) filter.cgpa = { ...filter.cgpa, $gte: Number(minCGPA) };
    if (maxCGPA) filter.cgpa = { ...filter.cgpa, $lte: Number(maxCGPA) };
    if (placedStatus !== undefined) filter.placedStatus = placedStatus === 'true';

    const students = await Student.find(filter)
      .populate('userId', 'name email')
      .sort({ cgpa: -1 });

    res.json(students);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in student's profile
// @route   GET /api/students/profile
// @access  Private/Student
const getStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name email')
      .populate('appliedCompanies', 'name jobRole status');

    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }
    res.json(student);
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in student's profile
// @route   PUT /api/students/profile
// @access  Private/Student
const updateStudentProfile = async (req, res, next) => {
  try {
    const { cgpa, phone, resumeUrl, branch } = req.body;
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }

    if (cgpa !== undefined) student.cgpa = cgpa;
    if (phone !== undefined) student.phone = phone;
    if (resumeUrl !== undefined) student.resumeUrl = resumeUrl;
    if (branch !== undefined) student.branch = branch;

    const updated = await student.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Student submits application with resume (Round 1)
// @route   POST /api/students/apply/:companyId
// @access  Private/Student
const submitApplicationWithResume = async (req, res, next) => {
  try {
    const { resumeUrl } = req.body;
    
    if (!resumeUrl) {
      res.status(400);
      throw new Error('Resume URL is required');
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }

    const company = await Company.findById(req.params.companyId);
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }

    // Eligibility checks
    if (company.approvalStatus !== 'approved') {
      res.status(400);
      throw new Error('This recruitment drive has not been approved yet');
    }
    if (company.status === 'closed') {
      res.status(400);
      throw new Error('This recruitment drive is closed');
    }
    if (!company.eligibleBranches.includes(student.branch)) {
      res.status(403);
      throw new Error(`Your branch (${student.branch}) is not eligible for this drive`);
    }
    if (student.cgpa < company.minCGPA) {
      res.status(403);
      throw new Error(`Minimum CGPA required is ${company.minCGPA}. Your CGPA: ${student.cgpa}`);
    }
    if (student.placedStatus) {
      res.status(400);
      throw new Error('You are already placed and cannot apply to more drives');
    }

    // Check duplicate application
    const existingApp = await Application.findOne({
      studentId: student._id,
      companyId: company._id,
    });
    if (existingApp) {
      res.status(400);
      throw new Error('You have already applied to this company');
    }

    // Create application with resume (Round 1)
    const application = await Application.create({
      studentId: student._id,
      companyId: company._id,
      status: 'round1_pending',
      'round1.resumeUrl': resumeUrl,
      'round1.submittedAt': new Date(),
    });

    // Track in student profile
    student.appliedCompanies.push(company._id);
    await student.save();

    res.status(201).json({ 
      message: 'Application submitted! Waiting for TPO to review your resume.',
      application 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's applications
// @route   GET /api/students/applications/my
// @access  Private/Student
const getStudentApplications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }

    const applications = await Application.find({ studentId: student._id })
      .populate('companyId', 'name jobRole package status approvalStatus recruitmentDate')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Round 2 questions for student
// @route   GET /api/students/applications/:appId/round2-questions
// @access  Private/Student
const getRound2Questions = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.appId || req.params.id);
    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.status !== 'round2_pending') {
      res.status(400);
      throw new Error('Round 2 not available for this application');
    }

    res.json({
      questions: application.round2.questions,
      invitedAt: application.round2.invitedAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Round 2 answers (HR Q&A)
// @route   POST /api/students/applications/:appId/submit-round2
// @access  Private/Student
const submitRound2Answers = async (req, res, next) => {
  try {
    const { answers } = req.body; // answers: [{ questionIndex, answer }, ...]

    if (!answers || !Array.isArray(answers) || answers.length !== 2) {
      res.status(400);
      throw new Error('Must provide exactly 2 answers');
    }

    const application = await Application.findById(req.params.appId || req.params.id);
    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.status !== 'round2_pending') {
      res.status(400);
      throw new Error('Round 2 not active for this application');
    }

    // Validate answers
    answers.forEach(ans => {
      if (ans.questionIndex < 0 || ans.questionIndex >= 2 || !ans.answer?.trim()) {
        res.status(400);
        throw new Error('Invalid answer format - all answers required');
      }
    });

    // Store answers
    application.round2.answers = answers.map(ans => ({
      questionIndex: ans.questionIndex,
      answer: ans.answer,
      submittedAt: new Date(),
    }));
    application.round2.submittedAt = new Date();
    application.status = 'round2_approved';

    await application.save();

    res.json({
      message: 'Round 2 answers submitted successfully! Waiting for TPO evaluation.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

export { getAllStudents, getStudentProfile, updateStudentProfile, submitApplicationWithResume, getStudentApplications, getRound2Questions, submitRound2Answers };
