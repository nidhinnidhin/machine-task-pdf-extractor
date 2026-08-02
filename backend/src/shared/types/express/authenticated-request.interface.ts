import type { Request } from 'express';
import type { UserRole } from 'src/modules/auth/domain/enums/user-role.enum';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
