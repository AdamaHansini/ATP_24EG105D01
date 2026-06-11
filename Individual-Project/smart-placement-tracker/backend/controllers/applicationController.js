import Application from '../models/Application.js';
import Student from '../models/Student.js';
import { sendEmail } from '../config/nodemailer.js';

// @desc    Get applications for a company (TPO - resume review)
// @route   GET /api/applications/company/:companyId
// @access  Private/TPO
const getApplicationsByCompany = async (req, res, next) => {
  try {
    const applications = await Application.find({ companyId: req.params.companyId })
      .populate({
        path: 'studentId',
        select: 'userId rollNumber branch cgpa phone',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ 'round1.submittedAt': -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's applications
// @route   GET /api/applications/my
// @access  Private/Student
const getStudentApplications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }

    const applications = await Application.find({ studentId: student._id })
      .populate('companyId', 'name jobRole package recruitmentDate')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    TPO reviews and approves/rejects Round 1 resume
// @route   PUT /api/applications/:id/review-round1
// @access  Private/TPO
const reviewRound1Resume = async (req, res, next) => {
  try {
    const { approved, notes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('companyId', 'name jobRole');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.status !== 'round1_pending') {
      res.status(400);
      throw new Error('Can only review pending Round 1 resumes');
    }

    const studentEmail = application.studentId.userId.email;
    const studentName = application.studentId.userId.name;
    const companyName = application.companyId.name;

    if (approved) {
      application.status = 'round1_approved';
      application.round1.approved = true;
      application.round1.reviewedAt = new Date();
      application.round1.tpoReviewNotes = notes || '';

      // Send approval email
      await sendEmail(
        studentEmail,
        `Great News! Your Resume is Approved - ${companyName}`,
        `<p>Dear <strong>${studentName}</strong>,</p>
         <p>🎉 Congratulations! Your resume has been approved for <strong>${companyName}</strong>.</p>
         <p>You have been invited to <strong>Round 2 (HR Round)</strong>.</p>
         <p>Please check your applications for the questions and deadline.</p>
         <p>Best regards,<br>TPO Team</p>`
      );
    } else {
      application.status = 'round1_rejected';
      application.round1.approved = false;
      application.round1.reviewedAt = new Date();
      application.round1.tpoReviewNotes = notes || 'Resume not selected';

      // Send rejection email
      await sendEmail(
        studentEmail,
        `Update on Your Application - ${companyName}`,
        `<p>Dear <strong>${studentName}</strong>,</p>
         <p>Thank you for applying to <strong>${companyName}</strong>.</p>
         <p>We regret to inform you that your resume was not selected.</p>
         <p>All the best for future opportunities!</p>
         <p>Best regards,<br>TPO Team</p>`
      );
    }

    await application.save();
    res.json({ message: approved ? 'Resume approved' : 'Resume rejected', application });
  } catch (error) {
    next(error);
  }
};

// @desc    TPO invites approved student to Round 2 (HR Q&A)
// @route   PUT /api/applications/:id/invite-round2
// @access  Private/TPO
const inviteToRound2 = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('companyId', 'name');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.status !== 'round1_approved') {
      res.status(400);
      throw new Error('Can only invite approved students to Round 2');
    }

    application.status = 'round2_pending';
    application.round2.invitedAt = new Date();

    await application.save();

    // Send invitation email with questions
    const studentEmail = application.studentId.userId.email;
    const studentName = application.studentId.userId.name;

    await sendEmail(
      studentEmail,
      `Round 2 Invitation - HR Round - ${application.companyId.name}`,
      `<p>Dear <strong>${studentName}</strong>,</p>
       <p>Congratulations! You have been invited to <strong>Round 2 (HR Round)</strong> for <strong>${application.companyId.name}</strong>.</p>
       <p><strong>Instructions:</strong> Answer the following 2 communication-based questions in text mode.</p>
       <ol>
         <li>${application.round2.questions[0]}</li>
         <li>${application.round2.questions[1]}</li>
       </ol>
       <p>Please log in to the portal and submit your answers before the deadline.</p>
       <p>Best regards,<br>TPO Team</p>`
    );

    res.json({ message: 'Student invited to Round 2', application });
  } catch (error) {
    next(error);
  }
};

// @desc    TPO evaluates Round 2 answers and approves/rejects
// @route   PUT /api/applications/:id/evaluate-round2
// @access  Private/TPO
const evaluateRound2 = async (req, res, next) => {
  try {
    const { approved, notes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('companyId', 'name package');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.status !== 'round2_approved') {
      res.status(400);
      throw new Error('Student has not submitted Round 2 answers yet');
    }

    const studentEmail = application.studentId.userId.email;
    const studentName = application.studentId.userId.name;

    application.round2.evaluatedAt = new Date();
    application.round2.tpoEvaluationNotes = notes || '';

    if (approved) {
      application.status = 'pending_placement';
      application.round2.approved = true;

      // Send approval for next stage email
      await sendEmail(
        studentEmail,
        `Excellent Performance in Round 2 - ${application.companyId.name}`,
        `<p>Dear <strong>${studentName}</strong>,</p>
         <p>🎉 Excellent! Your Round 2 answers were impressive.</p>
         <p>You have been moved to the final stage for placement decision by TPO.</p>
         <p>Stay tuned for the final result!</p>
         <p>Best regards,<br>TPO Team</p>`
      );
    } else {
      application.status = 'round2_rejected';
      application.round2.approved = false;

      // Send rejection email
      await sendEmail(
        studentEmail,
        `Round 2 Result - ${application.companyId.name}`,
        `<p>Dear <strong>${studentName}</strong>,</p>
         <p>Thank you for your effort in Round 2 with <strong>${application.companyId.name}</strong>.</p>
         <p>Unfortunately, you were not selected for the final round.</p>
         <p>All the best for your future endeavors!</p>
         <p>Best regards,<br>TPO Team</p>`
      );
    }

    await application.save();
    res.json({ message: approved ? 'Approved for placement decision' : 'Rejected after Round 2', application });
  } catch (error) {
    next(error);
  }
};

// @desc    TPO makes final placement decision (pending → placed/rejected)
// @route   PUT /api/applications/:id/final-decision
// @access  Private/TPO
const makeFinalDecision = async (req, res, next) => {
  try {
    const { placed, notes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('companyId', 'name package jobRole');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.status !== 'pending_placement') {
      res.status(400);
      throw new Error('Application not in pending placement state');
    }

    const studentEmail = application.studentId.userId.email;
    const studentName = application.studentId.userId.name;

    if (placed) {
      application.status = 'placed';
      application.placementNotes = notes || 'Placed';

      // Mark student as placed
      const student = await Student.findById(application.studentId._id);
      if (!student.placedStatus) {
        student.placedStatus = true;
        await student.save();
      }

      // Send final placement email
      await sendEmail(
        studentEmail,
        `🎉 Congratulations! You Are PLACED - ${application.companyId.name}`,
        `<p>Dear <strong>${studentName}</strong>,</p>
         <p><strong style="color: green; font-size: 18px;">🎉 CONGRATULATIONS! YOU ARE PLACED! 🎉</strong></p>
         <p><strong>Company:</strong> ${application.companyId.name}</p>
         <p><strong>Position:</strong> ${application.companyId.jobRole}</p>
         <p><strong>Package:</strong> ${application.companyId.package} LPA</p>
         <p>We wish you the very best in your career ahead!</p>
         <p>Best regards,<br>TPO Team</p>`
      );
    } else {
      application.status = 'rejected';
      application.placementNotes = notes || 'Not placed';

      // Send final rejection email
      await sendEmail(
        studentEmail,
        `Final Update - ${application.companyId.name}`,
        `<p>Dear <strong>${studentName}</strong>,</p>
         <p>Thank you for your time and effort throughout the recruitment process with <strong>${application.companyId.name}</strong>.</p>
         <p>Unfortunately, you were not selected for placement.</p>
         <p>All the best for your future opportunities!</p>
         <p>Best regards,<br>TPO Team</p>`
      );
    }

    await application.save();
    res.json({ message: placed ? 'Student placed successfully' : 'Student not placed', application });
  } catch (error) {
    next(error);
  }
};

export { getApplicationsByCompany, getStudentApplications, reviewRound1Resume, inviteToRound2, evaluateRound2, makeFinalDecision };
