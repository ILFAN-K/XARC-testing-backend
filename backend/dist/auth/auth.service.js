"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const firebase_admin_1 = require("../firebase/firebase-admin");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getRedirectPath(role) {
        const paths = {
            SUPERADMIN: '/superadmin/dashboard',
            ADMIN: '/admin/dashboard',
            INSTRUCTOR: '/instructor/dashboard',
            STUDENT: '/student/dashboard',
        };
        return paths[role] || '/student/dashboard';
    }
    async syncUser(token, role) {
        try {
            // Verify token
            const decodedToken = await firebase_admin_1.firebaseAdmin.auth().verifyIdToken(token);
            const email = decodedToken.email;
            if (!email) {
                throw new common_1.UnauthorizedException({ success: false, message: 'Token does not contain an email' });
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
            }
            else {
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
        }
        catch (error) {
            throw new common_1.UnauthorizedException({ success: false, message: 'Invalid or expired Firebase token' });
        }
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true, createdAt: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException({ success: false, message: 'User not found' });
        }
        return {
            success: true,
            user,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map