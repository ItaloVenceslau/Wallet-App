const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
        error: 'Validation Error',
        message: messages.join(', ')
        });
  }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
        error: 'Duplicate Error',
        message: `${field} already exists`
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
        error: 'Invalid ID',
        message: `Invalid ${err.path}: ${err.value}`
        });
    }

    return res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

module.exports = errorHandler;