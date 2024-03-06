import {Injectable} from '@nestjs/common';
import {UserService} from "../user/user.service";
import {JwtService} from "@nestjs/jwt";
import {UserNotFoundError} from "../user/errors/user_not_found.error";
import {compare} from "bcrypt";
import {UserWithoutPassword} from "./entities/user_without_password.entity";
import {JWTUserPayload} from "./entities/jwt_user_payload.entity";
import {ExistingUserException} from "./exceptions/existing_user.exception";
import {User} from "@prisma/client";

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {
    }

    async login(user: UserWithoutPassword) {
        const payload: JWTUserPayload = {email: user.email, sub: user.id}
        return this.jwtService.signAsync(payload)
    }

    async validateUser(email: string, password: string) {
        try {
            const {Password, passwordId, ...user} = await this.userService.findOne(email)
            return await new Promise<typeof user | null>((resolve) => {
                compare(password, Password.hash, (err, result) => {
                    if (result) {
                        resolve(user)
                    }
                    resolve(null)
                })
            })

        } catch (e) {
            if (e instanceof UserNotFoundError) {
                return null
            } else {
                throw e
            }
        }
    }

    async register(email: string, name: string, password: string) {
        //Verify is exist the user
        let check_user: User
        try {
            check_user = await this.userService.findOne(email)
        } catch (e) {
            check_user = null
        }
        if (check_user) throw new ExistingUserException()

        const user = await this.userService.create({
            name,
            email,
            password
        })

        const payload: JWTUserPayload = {email: user.email, sub: user.id}
        return this.jwtService.signAsync(payload)
    }

    async change_password(email: string, prev_pw: string, new_pw: string) {
        return this.userService.updatePassword(email, prev_pw, new_pw)
    }
}
