// server/src/routes/productRoutes.ts

import express from 'express';
import { getAllProducts, createProduct, deleteProduct } from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getAllProducts);                // Public (everyone needs to see the list)
router.post('/', protect, createProduct);       // Protected (Only admins add)
router.delete('/:id', protect, deleteProduct);  // Protected (Only admins delete)

export default router;
