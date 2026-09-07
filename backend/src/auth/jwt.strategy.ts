import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SUPER_SECRET_KEY_GANTI_NANTI', // in production use .env
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    // passport automatically attaches this return value to req.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      divisi: payload.divisi,
      levelAkses: payload.levelAkses,
    };
  }
}
