import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { firebaseAdmin } from '../firebase/firebase-admin';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private getRedirectPath(role: string): string {
    const paths = {
      SUPERADMIN: '/superadmin/dashboard',
      ADMIN: '/admin/dashboard',
      INSTRUCTOR: '/instructor/dashboard',
      STUDENT: '/student/dashboard',
    };
    return paths[role as keyof typeof paths] || '/student/dashboard';
  }

  async syncUser(token: string, role?: string) {
    try {
      // Verify token
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      const email = decodedToken.email;

      if (!email) {
        throw new UnauthorizedException({ success: false, message: 'Token does not contain an email' });
      }

      // Check if user already exists in Postgres
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Update firebaseUid if it was missing
        if (user.firebaseUid !== decodedToken.uid) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { firebaseUid: decodedToken.uid },
          });
        }
      } else {
        // Create new user in Postgres
        user = await this.prisma.user.create({
          data: {
            email,
            firebaseUid: decodedToken.uid,
            role: role || 'STUDENT', // Default to STUDENT if none provided
          },
        });
      }

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        redirectPath: this.getRedirectPath(user.role),
      };
    } catch (error) {
      throw new UnauthorizedException({ success: false, message: 'Invalid or expired Firebase token' });
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      throw new UnauthorizedException({ success: false, message: 'User not found' });
    }

    return {
      success: true,
      user,
    };
  }
}
