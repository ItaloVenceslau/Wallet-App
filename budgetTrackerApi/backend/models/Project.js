const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [3, 'Project name must be at least 3 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['planning', 'active', 'completed', 'cancelled'],
      message: 'Status must be planning, active, completed, or cancelled'
    },
    default: 'planning'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  }
}, {
  timestamps: true
});

// Índice composto para buscar projetos de um usuário por status
projectSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);