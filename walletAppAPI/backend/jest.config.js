module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: [],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/config/db.js'
    ]
};