import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from './user.service';
import {PrismaModule} from "../prisma/prisma.module";
import {PrismaService} from "../prisma/prisma.service";
import {UserNotFoundError} from "./errors/user_not_found.error";
import {WrongPasswordError} from "./errors/wrong_password.error";

describe('UserService', () => {
    let userService: UserService;
    let prismaService: PrismaService;
    let bcrypt: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [UserService],
        }).compile();

        userService = module.get<UserService>(UserService);
        prismaService = module.get<PrismaService>(PrismaService)
        bcrypt = require('bcrypt')
    });

    afterEach(() => {
        jest.restoreAllMocks()
    });

    describe('findOne', () => {
        it('should return a user', async () => {
            const user = {
                id: "test_id",
                email: "test_email",
                name: "test_name",
                Password: {id: "test_pw_id", hash: "hash"}
            }
            // @ts-ignore
            jest.spyOn(prismaService.user, 'findUnique').mockImplementation(async () => user)

            expect(await userService.findOne(user.email)).toBe(user)
        });

        it('should throw a UserNotFoundError with email "test_email"', () => {
            // @ts-ignore
            jest.spyOn(prismaService.user,"delete").mockImplementation(async () => null)
            expect(userService.delete("test_email")).rejects.toThrow(new UserNotFoundError("test_email"))
        });
    });

    describe('create', () => {
        it('should be return the created user', async () => {

            const user = {
                id: "test_id",
                email: "test_email",
                name: "test_name",
                passwordId: "test_pw_id",
            }

            // @ts-ignore
            jest.spyOn(prismaService.user, "create").mockImplementation(async () => user)

            expect(await userService.create({
                email: "test_email",
                name: "test_name",
                password: "test_pw"
            })).toBe(user)
        });
    });

    describe('update', () => {
        it('should return the updated user', async () => {
            const user = {
                id: "test_id",
                email: "test_email",
                name: "test_name",
                passwordId: "test_pw_id",
            }
            // @ts-ignore
            jest.spyOn(prismaService.user, "update").mockImplementation(async () => user)
            expect(await userService.update(user.email, {name: user.name})).toBe(user)
        });
    });

    describe('updatePassword', () => {

        it('should throw a UserNotFoundError with email "test_email"', () => {
            // @ts-ignore
            jest.spyOn(prismaService.user, "findUnique").mockImplementation(async () => null)
            expect(userService.updatePassword("test_email", "test_pw", "test_new_pw")).rejects.toThrow(new UserNotFoundError("test_email"))
        });

        it('should throw a WrongPasswordError', () => {

            const user = {
                id: "test_id",
                email: "test_email",
                name: "test_name",
                passwordId: "test_pw_id",
                Password: {id: "test_pw_id", hash: "hash"}
            }

            // @ts-ignore
            jest.spyOn(prismaService.user, "findUnique").mockImplementation(async () => user)
            jest.spyOn(bcrypt, "compare").mockImplementation(async () => false)

            expect(userService.updatePassword("test_email", "test_pw", "test_new_pw")).rejects.toThrow(new WrongPasswordError())
        });

        it('should return the updated user', async () => {
            const user = {
                id: "test_id",
                email: "test_email",
                name: "test_name",
                passwordId: "test_pw_id",
                Password: {id: "test_pw_id", hash: "hash"}
            }

            const {Password, ...updatedUser} = user

            // @ts-ignore
            jest.spyOn(prismaService.user, "findUnique").mockImplementation(async () => user)
            jest.spyOn(bcrypt, "compare").mockImplementation(async () => true)
            // @ts-ignore
            jest.spyOn(prismaService.user, "update").mockImplementation(async () => updatedUser)
            expect(await userService.updatePassword("test_email", "test_pw", "test_new_pw")).toBe(updatedUser)
        });
    });

    describe('delete', () => {
        it('should return the deleted user', async () => {
            const user = {
                id: "test_id",
                email: "test_email",
                name: "test_name",
                passwordId: "test_pw_id",
            }
            // @ts-ignore
            jest.spyOn(prismaService.user,"delete").mockImplementation(async () => user)
            expect(await userService.delete(user.email)).toBe(user)
        });

        it('should throw a UserNotFoundError with email "test_email"', () => {
            // @ts-ignore
            jest.spyOn(prismaService.user,"delete").mockImplementation(async () => null)
            expect(userService.delete("test_email")).rejects.toThrow(new UserNotFoundError("test_email"))
        });
    });
});
