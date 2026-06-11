import Company from '../models/Company.js';

// @desc    Create a new company drive
// @route   POST /api/companies
// @access  Private/TPO
const createCompany = async (req, res, next) => {
  try {
    const { name, description, jobRole, package: pkg, eligibleBranches, minCGPA, recruitmentDate, location, status } = req.body;

    const company = await Company.create({
      name, description, jobRole,
      package: pkg,
      eligibleBranches,
      minCGPA,
      recruitmentDate,
      location,
      status,
      approvalStatus: 'pending',
      rejectionReason: '',
      createdBy: req.user._id,
    });

    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all company drives (with optional filters)
// @route   GET /api/companies
// @access  Private
const getAllCompanies = async (req, res, next) => {
  try {
    const { status, branch, minPackage, approvalStatus } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (branch) filter.eligibleBranches = { $in: [branch] };
    if (minPackage) filter.package = { $gte: Number(minPackage) };
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    if (req.user.role === 'student') {
      filter.approvalStatus = 'approved';
    }

    if (req.user.role === 'tpo') {
      filter.createdBy = req.user._id;
    }

    const companies = await Company.find(filter)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company by ID
// @route   GET /api/companies/:id
// @access  Private
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email');
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }

    if (req.user.role === 'student' && company.approvalStatus !== 'approved') {
      res.status(404);
      throw new Error('Company not found');
    }

    if (req.user.role === 'tpo' && company.createdBy?._id?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only view drives created by you');
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
};

// @desc    Update company drive
// @route   PUT /api/companies/:id
// @access  Private/TPO
const updateCompany = async (req, res, next) => {
  try {
    const existing = await Company.findById(req.params.id);
    if (!existing) {
      res.status(404);
      throw new Error('Company not found');
    }
    if (existing.createdBy?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only update drives created by you');
    }

    const allowedFields = ['name', 'description', 'jobRole', 'package', 'eligibleBranches', 'minCGPA', 'recruitmentDate', 'location', 'status'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        existing[field] = req.body[field];
      }
    });
    existing.approvalStatus = 'pending';
    existing.approvedBy = undefined;
    existing.approvedAt = undefined;
    existing.rejectionReason = '';

    const updated = await existing.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company drive
// @route   DELETE /api/companies/:id
// @access  Private/TPO
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }
    if (company.createdBy?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only delete drives created by you');
    }
    await company.deleteOne();
    res.json({ message: 'Company drive deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve and publish a company drive
// @route   PUT /api/companies/:id/approve
// @access  Private/Admin
const approveCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }

    company.approvalStatus = 'approved';
    company.approvedBy = req.user._id;
    company.approvedAt = new Date();
    company.rejectionReason = '';
    await company.save();

    res.json({ message: 'Drive approved and published to students', company });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a company drive request
// @route   PUT /api/companies/:id/reject
// @access  Private/Admin
const rejectCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }

    company.approvalStatus = 'rejected';
    company.approvedBy = undefined;
    company.approvedAt = undefined;
    company.rejectionReason = req.body.reason || '';
    await company.save();

    res.json({ message: 'Drive rejected', company });
  } catch (error) {
    next(error);
  }
};

export { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany, approveCompany, rejectCompany };
