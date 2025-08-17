import cors from 'cors';
import express from 'express';
import { onRequest } from 'firebase-functions/v2/https';

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes will be imported here
import commentRoutes from './routes/commentRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Route registration
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Default route
app.use('/', (req, res) => {
  res.status(200).send({
    status: 'success',
    message: `Vision Picturale API - ${req.method} Route ${req.path} is working!`
  });
});

// If running directly (for local development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
  });
}

// Export for Firebase Functions
export const api = onRequest(app);
