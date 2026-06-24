const express = require('express');
const router = express.Router();
const {
    getBranches, getBranch, createBranch, updateBranch, deleteBranch, toggleBranchStatus
} = require('../controllers/branchController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getBranches)
    .post(authorize('superadmin', 'admin'), createBranch);

router.route('/:id')
    .get(getBranch)
    .put(authorize('superadmin', 'admin'), updateBranch)
    .delete(authorize('superadmin', 'admin'), deleteBranch);

router.patch('/:id/toggle', authorize('superadmin', 'admin'), toggleBranchStatus);

module.exports = router;
