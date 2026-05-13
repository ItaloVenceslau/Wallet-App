const Project = require("../models/Project");

const createProject = async (req, res) => {
    const {name, description, budget} = req.body;
    const userId = req.user.id;

    if (!name || !budget) return res.status(400).json({error: 'Missing arguments'});

    const budgetNumber = parseFloat(budget);
    if (isNaN(budgetNumber) || budgetNumber <= 0) return res.status(400).json({error: 'Budget must be a positive number'});
    
    const newProject = await Project.create({name, description: description || '', budget: budgetNumber, user: userId});

    return res.status(201).json({message: 'New project created', newProject});
};

const getProjects = async (req, res) => {
    const userId = req.user.id;
    const status = req.query.status;
    const budgetMin = req.query.budget_min;
    const budgetMax = req.query.budget_max;

    let filter = {user: userId};

    if (status) filter = {...filter, status: status};
    if (budgetMin || budgetMax) {
        filter.budget = {};
        if (budgetMin) filter.budget.$lte = parseFloat(budgetMin);
        if (budgetMax) filter.budget.$gte = parseFloat(budgetMax);
    }

    const projects = await Project.find({...filter}).sort({ createdAt: -1 });
    return res.status(200).json(projects);
};

const getProjectsById = async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;

    const getProject = await Project.findOne({_id: id, user: userId});

    if (!getProject) return res.status(404).json({error: 'Project not found'});

    return res.status(200).json(getProject);
};  


const updateProject = async (req, res) => {
    const userId = req.user.id;
    const projectId = req.params.id;
    const {name, description, budget} = req.body;

    const project = await Project.findOneAndUpdate(
        { _id: projectId, user: userId },
        { name, description, budget },
        { new: true, runValidators: true }
    );


    if (!project) return res.status(404).json({error: 'Project not found'});

    return res.status(200).json({message: 'Project updated successfully', project});
};

const deleteProject = async (req, res) => {
    const userId = req.user.id;
    const projectId = req.params.id;

    const project = await Project.findOneAndDelete({_id: projectId, user: userId});

    if (!project) return res.status(404).json({error: 'Project not found/Project deleted'});

    return res.status(200).json({message: 'Project deleted successfully', project});
};

const addExpense = async (req, res) => {
    const {amount} = req.body;
    const projectId = req.params.id;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
    }

    const project = await Project.findOne({_id: projectId, user: userId});

    if (!project) return res.status(404).json({error: 'Project not found'});

    const newSpent = project.spent + amount;

    if (newSpent > project.budget) return res.status(400).json({error: 'Exceeded budget'});

    const updProject = await Project.findOneAndUpdate(
        { _id: projectId, user: userId, spent: { $lte: project.budget - amount } }, 
        { $inc: { spent: amount } },
        { new: true }
    );
    return res.status(200).json(updProject);
};

const updateStatus = async (req, res) => {
    const {status} = req.body;
    const projectId = req.params.id;
    const userId = req.user.id;
    // const allowedStatus = ['planning', 'active', 'completed', 'cancelled'];

    // if (!allowedStatus.includes(status)) return res.status(400).json({error: 'Invalid Status'});

    const project = await Project.findOneAndUpdate({_id: projectId, user: userId}, {$set : {status: status}}, {new: true});

    if (!project) return res.status(404).json({error: 'Project not found'});

    return res.status(200).json(project);
};

async function getStatsSummary(req, res) {
    const userId = req.user.id;

    const projects = await Project.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: null,
                totalBudget: { $sum: "$budget" },
                totalSpent: { $sum: "$spent" },
                activeProjects: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                completedProjects: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
            }
        }
    ]);

    if (!projects.length) {
        return res.status(200).json({
            totalBudget: 0,
            totalSpent: 0,
            remainingBudget: 0,
            activeProjects: 0,
            completedProjects: 0
        });
    }

    const result = projects[0];
    result.remainingBudget = result.totalBudget - result.totalSpent;

    return res.status(200).json(result);
}

const getRemainingBudget = async (req, res) => {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    return res.status(200).json({
        budget: project.budget,
        spent: project.spent,
        remaining: project.budget - project.spent
    });

};

module.exports = {createProject, getProjects, getProjectsById, updateProject, deleteProject, addExpense, updateStatus, getStatsSummary, getRemainingBudget};

