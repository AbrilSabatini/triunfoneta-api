import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AreasModule } from '../areas/areas.module';
import { ThrottleGuard } from '../common/guards/throttle.guard';
import { MailModule } from '../mail/mail.module';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // PassportModule con la estrategia default explícita
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // registerAsync garantiza que JWT_SECRET se lea DESPUÉS de que
    // ConfigModule haya cargado el .env, evitando el valor 'undefined'
    // que ocurre cuando se usa JwtModule.register() con process.env directamente.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
    }),

    TypeOrmModule.forFeature([User]),
    UsersModule,
    AreasModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ThrottleGuard],
  // Exportar JwtAuthGuard no es necesario; se importa directamente donde se usa.
  // Sí exportamos JwtModule para que otros módulos puedan verificar tokens si lo necesitan.
  exports: [JwtModule],
})
export class AuthModule {}
