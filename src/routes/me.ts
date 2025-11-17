import { Router } from 'express';
import { authGuard } from '../middleware/auth';
import { prisma } from '../prisma/client';

export const meRouter = Router();

meRouter.get('/me', authGuard, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ id: user.id, name: user.name, email: user.email });
});
