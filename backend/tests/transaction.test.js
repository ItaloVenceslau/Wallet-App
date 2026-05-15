const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const mongoose = require('mongoose');

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });
    
    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });
    
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@test.com',
                    password: '12345678'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
        });
        
        it('should not register with existing email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User 2',
                    email: 'test@test.com',
                    password: '12345678'
                });
            
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('User already exists');
        });
        
        it('should not register with short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'short@test.com',
                    password: '123'
                });
            
            expect(res.statusCode).toBe(400);
        });
    });
    
    describe('POST /api/auth/login', () => {
        it('should login existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@test.com',
                    password: '12345678'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
        
        it('should not login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@test.com',
                    password: 'wrongpassword'
                });
            
            expect(res.statusCode).toBe(400);
        });
    });
});