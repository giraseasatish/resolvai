import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// --- REGISTER (Sign Up) ---
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash the password (encrypt it)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CUSTOMER', // Default to Customer if not specified
      },
    });
    
    //We split 'password' away from the rest of the data
    const {password:keyPassword,...other}=user;

    res.status(201).json({ message: 'User created successfully', user:other});
    
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};


// --- LOGIN (Sign In) ---
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate Token (The digital ID card)
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // Payload (what's inside the token)
      process.env.JWT_SECRET as string,     // Secret Key (from .env)
      { expiresIn: '1h' }                   // Expiration (valid for 1 hour)
    );

    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, role: user.role } });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};


