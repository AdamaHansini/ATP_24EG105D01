import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true
    },
    package: {
      type: Number,
      required: [true, 'Package (LPA) is required'],
      min: 0
    },
    eligibleBranches: {
      type: [String],
      enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'],
      required: [true, 'At least one eligible branch is required'],
    },
    minCGPA: {
      type: Number,
      required: [true, 'Minimum CGPA is required'],
      min: 0,
      max: 10,
    },
    recruitmentDate: {
      type: Date,
      required: [true, 'Recruitment date is required'],
    },
    location: {
      type: String,
      trim: true,
      default: 'On Campus',
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'closed'],
      default: 'upcoming',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);
