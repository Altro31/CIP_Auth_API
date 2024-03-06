import {Test, TestingModule} from '@nestjs/testing';
import {AuthService} from './auth.service';
import {UserService} from "../user/user.service";
import {UserModule} from "../user/user.module";
import {UserNotFoundError} from "../user/errors/user_not_found.error";
import {JwtModule, JwtService} from "@nestjs/jwt";
import {PrismaModule} from "../prisma/prisma.module";
import {ExistingUserException} from "./exceptions/existing_user.exception";

describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService
    let jwtService: JwtService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                UserModule,
                JwtModule.register({
                    global: true,
                    secret: process.env.JWT_SECRET,
                    signOptions: {expiresIn: '1d'},
                }),
                PrismaModule
            ],
            providers: [AuthService],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    describe('validateUser', () => {
        it("should return null because the user doesn't exist", async () => {
            jest.spyOn(userService, "findOne").mockImplementation(async () => {
                throw new UserNotFoundError('test_email')
            })
            expect(await authService.validateUser("test_email", "test_pw")).toBe(null)
        });
    });

    describe('login', () => {
        it('should return a JWT', async () => {
            const user = {id: "test_id", email: "test_email", name: "test_name"}
            expect(await authService.login(user)).toBeTruthy()
        });
    });

    describe('register', () => {
        it('should throw an ExistingUserException', () => {
            // @ts-ignore
            jest.spyOn(userService, 'findOne').mockImplementation(async () => ({
                name: 'test_name',
            }))
            expect(authService.register('test_email', 'test_name', 'test_pw')).rejects.toThrow(new ExistingUserException())
        });

        it('should return a JWT with the register user inside', async () => {
            const input = {name: 'test_name', email: 'test_email', password: 'test_pw'}
            const user = {
                id: 'test_id',
                name: 'test_name',
                email: 'test_email',
                passwordId: 'test_pw_id'
            }
            jest.spyOn(userService, 'findOne').mockImplementation(async () => null)
            jest.spyOn(userService, 'create').mockImplementation(async () => user)

            const token = await authService.register(input.email, input.name, input.password)
            const {email} = jwtService.verify(token)

            expect(email).toBe(input.email)
        });
    });
});
