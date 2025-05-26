import { User } from '../../../generated/prisma/index';



declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
