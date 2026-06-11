import mongoose from 'mongoose';

const HR_QUESTIONS = [
  'Tell us about yourself and your communication skills.',
  'How do you handle conflicts in a team environment? Share a relevant example.'
];

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    // Round 1: Resume
    round1: {
      resumeUrl: {
        type: String,
        default: '',
      },
      submittedAt: {
        type: Date,
        default: null,
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
      tpoReviewNotes: String,
      approved: {
        type: Boolean,
        default: null,
      },
    },
    // Round 2: HR Communication Q&A
    round2: {
      questions: {
        type: [String],
        default: HR_QUESTIONS,
      },
      invitedAt: {
        type: Date,
        default: null,
      },
      answers: [
        {
          questionIndex: Number,
          answer: String,
          submittedAt: Date,
        },
      ],
      submittedAt: {
        type: Date,
        default: null,
      },
      evaluatedAt: {
        type: Date,
        default: null,
      },
      tpoEvaluationNotes: String,
      approved: {
        type: Boolean,
        default: null,
      },
    },
    // Final placement status
    status: {
      type: String,
      enum: ['round1_pending', 'round1_approved', 'round1_rejected', 'round2_pending', 'round2_approved', 'round2_rejected', 'pending_placement', 'placed', 'rejected'],
      default: 'round1_pending',
    },
    placementNotes: String,
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ studentId: 1, companyId: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
