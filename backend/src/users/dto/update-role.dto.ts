import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export const ALLOWED_ROLES = ['SUPERADMIN', 'ADMIN', 'INSTRUCTOR', 'STUDENT'];

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_ROLES, {
    message: `Role must be one of ${ALLOWED_ROLES.join(', ')}`,
  })
  role!: string;
}
