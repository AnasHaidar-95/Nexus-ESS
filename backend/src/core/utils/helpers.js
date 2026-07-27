import { prisma } from './prisma.js';

export const getUserIdFromEmployeeId = async (employeeId) => {
  const user = await prisma.user.findFirst({
    where: { employeeId },
    select: { id: true },
  });
  return user?.id || null;
};
