// backend/prisma/seed.ts
import { PrismaClient, Role, DegreeTypeEnum } from '@prisma/client';
import bcrypt from 'bcryptjs';
  
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seeding dữ liệu...');

  const hashedPassword = await bcrypt.hash('admin123', 10); // Hash mật khẩu 'admin123'

  // Tạo tài khoản ADMIN
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Đã tạo hoặc cập nhật tài khoản Admin: ${adminUser.email}`);

  // Tạo tài khoản Accountant
  const accountantUser = await prisma.user.upsert({
    where: { email: 'accountant@example.com' },
    update: {
      password: hashedPassword,
      role: Role.ACCOUNTANT,
    },
    create: {
      email: 'accountant@example.com',
      password: hashedPassword,
      role: Role.ACCOUNTANT,
    },
  });
  console.log(`Đã tạo hoặc cập nhật tài khoản Accountant: ${accountantUser.email}`);

  console.log('Seeding dữ liệu hoàn tất.');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });