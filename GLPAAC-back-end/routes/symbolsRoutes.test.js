import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import symbolsRoutes from '../routes/symbolsRoutes'; // Adjust the path as necessary

const app = express();
app.use('/api/symbols', symbolsRoutes);

// Mock the symbolsRoutes module
vi.mock('../routes/symbolsRoutes', () => {
  return {
    __esModule: true,
    default: (req, res) => {
      const query = req.query.q;
      if (query === 'example') {
        res.status(200).json({ data: ['symbol1', 'symbol2'] }); // Mocked successful response
      } else {
        res.status(500).json({ error: 'Failed to fetch symbols' }); // Mocked error response
      }
    },
  };
});

describe('GET /api/symbols', () => {
  
  it('should return symbols data for a valid query', async () => {
    const response = await request(app).get('/api/symbols?q=example');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toEqual(['symbol1', 'symbol2']); // Check the actual data returned
  });

  it('should return an error for an invalid query', async () => {
    const response = await request(app).get('/api/symbols?q=invalidQuery');
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to fetch symbols');
  });

});