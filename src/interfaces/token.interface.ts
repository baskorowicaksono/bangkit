import { JwtPayload } from 'jsonwebtoken';

export default interface TokenInterface extends JwtPayload {
  userId: string;
  expiryTime: Date;
}
