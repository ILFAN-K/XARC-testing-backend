import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { firebaseAdmin } from '../../firebase/firebase-admin';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({ success: false, message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      // Verify Firebase ID Token
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      
      // Look up user in PostgreSQL
      const user = await this.prisma.user.findUnique({
        where: { email: decodedToken.email },
      });

      if (!user) {
        throw new UnauthorizedException({ success: false, message: 'User not found in database. Please sync/register first.' });
      }

      // Ensure Firebase UID is synced if it was missing
      if (!user.firebaseUid) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: decodedToken.uid },
        });
        user.firebaseUid = decodedToken.uid;
      }

      // Attach user to request
      request.user = {
        sub: user.id,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException({ success: false, message: 'Invalid or expired Firebase token' });
    }
  }
}
