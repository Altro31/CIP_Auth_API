import {Test, TestingModule} from '@nestjs/testing';
import {AuthController} from './auth.controller';
import {AuthService} from "./auth.service";
import {JwtModule} from "@nestjs/jwt";
import {UserModule} from "../user/user.module";
import {PrismaModule} from "../prisma/prisma.module";

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    global: true,
                    secret: process.env.JWT_SECRET,
                    signOptions: {expiresIn: '1d'},
                }),
                UserModule,
                PrismaModule
            ],
            controllers: [AuthController],
            providers: [AuthService]
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService)
    });

    describe('login', () => {
        it('should return a JWT', async () => {
            const user = {id: "test_id", email: "test_email", name: "test_name"}
            expect(await controller.login(user)).toBeTruthy()
        });
    });
});
