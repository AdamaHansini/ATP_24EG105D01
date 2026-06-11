import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'],
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: 0,
      max: 10,
    },
    phone: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    placedStatus: {
      type: Boolean,
      default: false,
    },
    appliedCompanies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
