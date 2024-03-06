import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {JwtModule} from "@nestjs/jwt";
import {UserModule} from "../user/user.module";
import {PassportModule} from "@nestjs/passport";
import {LocalStrategy} from "./strategies/local.strategy";
import {JWTStrategy} from "./strategies/jwt.strategy";

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: '1d'},
        }),
        UserModule,
        PassportModule
    ],
    providers: [LocalStrategy, AuthService,JWTStrategy],
    controllers: [AuthController]
})
export class AuthModule {
}
