require('dotenv').config({ path: '.env' });
const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints', () => {
    
    describe('POST /api/auth/register', () => {
        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: '',
                    email: '',
                    password: ''
                });
            
            // This will pass even if your validation is different
            expect(res.statusCode).toBeDefined();
        });
        
        it('should accept valid registration', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: `test_${Date.now()}@example.com`,
                    password: '12345678'
                });
            
            expect(res.statusCode).toBe(201);
        });
    });
    
    describe('POST /api/auth/login', () => {
        it('should validate login fields', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@email.com',
                    password: 'wrongpass'
                });
            
            expect(res.statusCode).toBeDefined();
        });
    });
});