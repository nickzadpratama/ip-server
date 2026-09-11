/**
 * E2E Tests for TeamController
 * Testing all endpoints: GET /, POST /, GET /:id, PUT /:id, DELETE /:id
 * 
 * Run with: npm test -- team.test.js
 */

const request = require('supertest');
const app = require('../app');
const { Team, sequelize } = require('../models');

// Test data
const testUser = {
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'password123'
};

const testTeam = {
  name: 'Test Team',
  code: 'TEST001',
  founded: '1990',
  stadium: 'Test Stadium',
  city: 'Test City',
  capacity: '50000'
};

let authToken;

describe('TeamController E2E Tests', () => {
  // Setup before all tests - create test user and get auth token
  beforeAll(async () => {
    try {
      // Sync database for testing
      await sequelize.sync({ force: true });
      
      // Register a test user
      await request(app).post('/register').send(testUser);
      
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      if (loginResponse.status === 200) {
        authToken = loginResponse.body.access_token;
      } else {
        throw new Error('Failed to login for testing');
      }
    } catch (error) {
      console.error('Error in beforeAll:', error);
      throw error;
    }
  });

  // Cleanup after all tests
  afterAll(async () => {
    try {
      await sequelize.drop();
      await sequelize.close();
    } catch (error) {
      console.error('Error in afterAll:', error);
    }
  });

  // Cleanup before each test
  beforeEach(async () => {
    try {
      await Team.destroy({ where: {}, truncate: true });
    } catch (error) {
      console.error('Error in beforeEach:', error);
    }
  });

  // ========== AUTH TESTS ==========

  describe('POST /register - Register new user', () => {
    it('should successfully register a new user', async () => {
      const newUser = { username: 'newuser1', email: 'newuser1@example.com', password: 'password123' };
      const response = await request(app).post('/register').send(newUser);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Create new User');
      expect(response.body.data).toHaveProperty('username', newUser.username);
      expect(response.body.data).toHaveProperty('email', newUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should fail registration with missing username', async () => {
      const newUser = { email: 'noUsername@example.com', password: 'password123' };
      const response = await request(app).post('/register').send(newUser);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail registration with missing email', async () => {
      const newUser = { username: 'noEmail', password: 'password123' };
      const response = await request(app).post('/register').send(newUser);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail registration with missing password', async () => {
      const newUser = { username: 'noPassword', email: 'noPassword@example.com' };
      const response = await request(app).post('/register').send(newUser);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail registration with invalid email format', async () => {
      const newUser = { username: 'invalidEmail', email: 'invalid-email', password: 'password123' };
      const response = await request(app).post('/register').send(newUser);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail registration with duplicate email', async () => {
      const duplicateUser = { username: 'duplicate', email: testUser.email, password: 'password123' };
      const response = await request(app).post('/register').send(duplicateUser);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /login - Login user', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
    });

    it('should fail login with missing email', async () => {
      const response = await request(app)
        .post('/login')
        .send({ password: testUser.password });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please input email or password');
    });

    it('should fail login with missing password', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: testUser.email });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please input email or password');
    });

    it('should fail login with invalid email', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: 'nonexistent@example.com', password: testUser.password });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail login with wrong password', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: testUser.email, password: 'wrongpassword' });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

  // ========== TEAM CRUD TESTS ==========

  describe('GET / - Read all teams (with authentication)', () => {
    it('should fail without authentication token', async () => {
      const response = await request(app).get('/').send();
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please login first');
    });

    it('should fail with invalid authentication token', async () => {
      const response = await request(app)
        .get('/')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please login first');
    });

    it('should successfully get all teams with valid token', async () => {
      await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTeam);

      const response = await request(app)
        .get('/')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Succeed read data team');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty array when no teams exist', async () => {
      await Team.destroy({ where: {}, truncate: true });
      const response = await request(app)
        .get('/')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Succeed read data team');
      expect(response.body.data).toEqual([]);
    });

    it('should filter teams by search query', async () => {
      await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...testTeam, name: 'Apple Team' });

      await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...testTeam, name: 'Banana Team' });

      const response = await request(app)
        .get('/?search=Apple')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Apple Team');
    });
  });

  describe('POST / - Create new team (with authentication)', () => {
    it('should fail without authentication token', async () => {
      const response = await request(app).post('/').send(testTeam);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please login first');
    });

    it('should fail with invalid authentication token', async () => {
      const response = await request(app)
        .post('/')
        .set('Authorization', 'Bearer invalidtoken')
        .send(testTeam);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please login first');
    });

    it('should successfully create a new team', async () => {
      const response = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTeam);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Succeed create data team');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(testTeam.name);
      expect(response.body.data.code).toBe(testTeam.code);
      expect(response.body.data.founded).toBe(testTeam.founded);
      expect(response.body.data.stadium).toBe(testTeam.stadium);
      expect(response.body.data.city).toBe(testTeam.city);
      expect(response.body.data.capacity).toBe(testTeam.capacity);
    });

    it('should fail to create team with missing name', async () => {
      const invalidTeam = { code: 'TEST001', founded: '1990', stadium: 'Test Stadium', city: 'Test City', capacity: '50000' };
      const response = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTeam);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Name Team Required');
    });

    it('should fail to create team with missing code', async () => {
      const invalidTeam = { name: 'Test Team', founded: '1990', stadium: 'Test Stadium', city: 'Test City', capacity: '50000' };
      const response = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTeam);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Code Required');
    });

    it('should fail to create team with missing founded year', async () => {
      const invalidTeam = { name: 'Test Team', code: 'TEST001', stadium: 'Test Stadium', city: 'Test City', capacity: '50000' };
      const response = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTeam);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Founded Required');
    });

    it('should fail to create team with missing stadium', async () => {
      const invalidTeam = { name: 'Test Team', code: 'TEST001', founded: '1990', city: 'Test City', capacity: '50000' };
      const response = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTeam);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Stadium Required');
    });

    it('should fail to create team with missing city', async () => {
      const invalidTeam = { name: 'Test Team', code: 'TEST001', founded: '1990', stadium: 'Test Stadium', capacity: '50000' };
      const response = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTeam);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('City Required');
    });

    it('should fail to create team with missing capacity', async () => {
      const invalidTeam = { name: 'Test Team', code: 'TEST001', founded: '1990', stadium: 'Test Stadium', city: 'Test City' };
      const response = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTeam);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Capacity Required');
    });
  });

  describe('GET /:id - Read team by ID (with authentication)', () => {
    let createdTeamId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTeam);
      createdTeamId = response.body.data.id;
    });

    it('should fail without authentication token', async () => {
      const response = await request(app).get(`/${createdTeamId}`).send();
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please login first');
    });

    it('should fail with invalid authentication token', async () => {
      const response = await request(app)
        .get(`/${createdTeamId}`)
        .set('Authorization', 'Bearer invalidtoken');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please login first');
    });

    it('should successfully get team by ID', async () => {
      const response = await request(app)
        .get(`/${createdTeamId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Succeed read detail team');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdTeamId);
      expect(response.body.data.name).toBe(testTeam.name);
    });

    it('should fail to get team with non-existent ID', async () => {
      const response = await request(app)
        .get('/99999')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Data not found');
    });

    it('should fail to get team with invalid ID format', async () => {
      const response = await request(app)
        .get('/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /:id - Update team (with authentication and authorization)', () => {
    let createdTeamId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTeam);
      createdTeamId = response.body.data.id;
    });

    it('should fail without authentication token', async () => {
      const updateData = { name: 'Updated Team' };
      const response = await request(app).put(`/${createdTeamId}`).send(updateData);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please login first');
    });

    it('should fail with invalid authentication token', async () => {
      const updateData = { name: 'Updated Team' };
      const response = await request(app)
        .put(`/${createdTeamId}`)
        .set('Authorization', 'Bearer invalidtoken')
        .send(updateData);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please login first');
    });

    it('should successfully update team', async () => {
      const updateData = {
        name: 'Updated Team Name',
        code: 'UPD001',
        founded: '2000',
        stadium: 'Updated Stadium',
        city: 'Updated City',
        capacity: '60000'
      };

      const response = await request(app)
        .put(`/${createdTeamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Succeed update data team');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.code).toBe(updateData.code);
      expect(response.body.data.founded).toBe(updateData.founded);
      expect(response.body.data.stadium).toBe(updateData.stadium);
      expect(response.body.data.city).toBe(updateData.city);
      expect(response.body.data.capacity).toBe(updateData.capacity);
    });

    it('should fail to update non-existent team', async () => {
      const updateData = { name: 'Updated Team Name' };
      const response = await request(app)
        .put('/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Data not found');
    });

    it('should fail to update team with missing required fields', async () => {
      const updateData = { name: '' };
      const response = await request(app)
        .put(`/${createdTeamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /:id - Delete team (with authentication and authorization)', () => {
    let createdTeamId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTeam);
      createdTeamId = response.body.data.id;
    });

    it('should fail without authentication token', async () => {
      const response = await request(app).delete(`/${createdTeamId}`).send();
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please login first');
    });

    it('should fail with invalid authentication token', async () => {
      const response = await request(app)
        .delete(`/${createdTeamId}`)
        .set('Authorization', 'Bearer invalidtoken');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Please login first');
    });

    it('should successfully delete team', async () => {
      const response = await request(app)
        .delete(`/${createdTeamId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('succeed to delete');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdTeamId);

      // Verify team is actually deleted
      const getResponse = await request(app)
        .get(`/${createdTeamId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(getResponse.status).toBe(404);
    });

    it('should fail to delete non-existent team', async () => {
      const response = await request(app)
        .delete('/99999')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Data not found');
    });

    it('should fail to delete already deleted team', async () => {
      await request(app)
        .delete(`/${createdTeamId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const response = await request(app)
        .delete(`/${createdTeamId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Data not found');
    });
  });

  // ========== INTEGRATION TESTS ==========

  describe('Integration tests - Multiple operations', () => {
    it('should perform CRUD operations in sequence', async () => {
      // Create
      const createResponse = await request(app)
        .post('/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'CRUD Test Team',
          code: 'CRUD001',
          founded: '2010',
          stadium: 'CRUD Stadium',
          city: 'CRUD City',
          capacity: '30000'
        });

      expect(createResponse.status).toBe(201);
      const teamId = createResponse.body.data.id;

      // Read all
      const readAllResponse = await request(app)
        .get('/')
        .set('Authorization', `Bearer ${authToken}`);
      expect(readAllResponse.status).toBe(200);
      expect(readAllResponse.body.data.some(t => t.id === teamId)).toBe(true);

      // Read one
      const readOneResponse = await request(app)
        .get(`/${teamId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(readOneResponse.status).toBe(200);
      expect(readOneResponse.body.data.id).toBe(teamId);

      // Update
      const updateResponse = await request(app)
        .put(`/${teamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated CRUD Team',
          code: 'CRUD002',
          founded: '2011',
          stadium: 'Updated Stadium',
          city: 'Updated City',
          capacity: '35000'
        });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.name).toBe('Updated CRUD Team');

      // Delete
      const deleteResponse = await request(app)
        .delete(`/${teamId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toContain('succeed to delete');
    });

    it('should handle concurrent team creation', async () => {
      const teamsToCreate = [
        { name: 'Team A', code: 'TEAM_A', founded: '1990', stadium: 'Stadium A', city: 'City A', capacity: '10000' },
        { name: 'Team B', code: 'TEAM_B', founded: '1991', stadium: 'Stadium B', city: 'City B', capacity: '20000' },
        { name: 'Team C', code: 'TEAM_C', founded: '1992', stadium: 'Stadium C', city: 'City C', capacity: '30000' }
      ];

      const responses = await Promise.all(
        teamsToCreate.map(team =>
          request(app)
            .post('/')
            .set('Authorization', `Bearer ${authToken}`)
            .send(team)
        )
      );

      expect(responses.length).toBe(3);
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all teams were created
      const readResponse = await request(app)
        .get('/')
        .set('Authorization', `Bearer ${authToken}`);
      expect(readResponse.body.data.length).toBe(3);
    });
  });
});
  });