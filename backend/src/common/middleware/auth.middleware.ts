import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthMiddleware implements NestMiddleware {

  constructor(private readonly jwtService: JwtService) { }

  use(req: any, res: any, next: () => void) {

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    try {
      const decoded = this.jwtService.verify(token);
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    next();
  }
}
