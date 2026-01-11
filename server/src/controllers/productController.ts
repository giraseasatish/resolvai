// server/src/controllers/productController.ts

import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/authMiddleware';

// GET: Fetch all products (for the dropdown)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

// POST: Create a new product (Admin Only)
export const createProduct = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name } = req.body;
    
    // Security Check: Only Admins can add products
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    // Check if product already exists
    const existingProduct = await prisma.product.findUnique({
      where: { name }
    });

    if (existingProduct) {
      return res.status(400).json({ message: "Product with this name already exists" });
    }

    const product = await prisma.product.create({
      data: { name }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product" });
  }
};

// DELETE: Delete a product (Admin Only)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    // Security Check: Only Admins can delete products
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    // Check if product is being used by any tickets
    const ticketsUsingProduct = await prisma.ticket.count({
      where: { productId: Number(id) }
    });

    if (ticketsUsingProduct > 0) {
      return res.status(400).json({ 
        message: `Cannot delete product. It is being used by ${ticketsUsingProduct} ticket(s).` 
      });
    }

    await prisma.product.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};