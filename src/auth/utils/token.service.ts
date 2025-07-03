import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt"

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService
    ) { }

    generateResetToken(payload: { sub: string, email: string }) {
        return this.jwtService.sign(payload, {
            expiresIn: '15m',
            secret: process.env.JWT_RESET_SECRET,
        });
    }

    verifyResetToken(token: string) {
        return this.jwtService.verify(token, {
            secret: process.env.JWT_RESET_SECRET,
        });
    }
}