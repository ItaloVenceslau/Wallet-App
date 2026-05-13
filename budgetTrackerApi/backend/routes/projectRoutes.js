const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {createProject, getProjects, getProjectsById, updateProject, deleteProject, addExpense, getStatsSummary, updateStatus, getRemainingBudget} = require('../controllers/projectController');
const {validateProject} = require('../middleware/validation');


router.use(authMiddleware);
router.post('/', validateProject, createProject);
router.get('/', getProjects);
router.get('/:id', getProjectsById);
router.put('/:id', validateProject, updateProject);
router.delete('/:id', deleteProject);
router.patch('/:id/add-expense', addExpense);
router.patch('/:id/status', updateStatus);
router.get('/stats/summary', getStatsSummary);
router.get('/:id/remaining', getRemainingBudget);

module.exports = router;