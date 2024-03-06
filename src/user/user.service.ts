import {Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {compare, hash} from "bcrypt";
import {UserNotFoundError} from "./errors/user_not_found.error";
import {User} from '@prisma/client';
import {WrongPasswordError} from "./errors/wrong_password.error";

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {
    }

    /**
     * Asynchronously finds a user by email.
     *
     * @param {string} email - the email of the user to find
     * @return {Promise<User>} the user found by the email
     * @throws {UserNotFoundError} if the user is not found
     */
    async findOne(email: string) {

        const user = await this.prismaService.user.findUnique({
            where: {email},
            include: {Password: true}
        })
        if (!user) throw new UserNotFoundError(email)
        return user
    }

    /**
     * Create a new user with the provided email, name, and password.
     *
     * @param {{email: string, name: string, password: string}} data - Object containing user data
     * @return {Promise<User>} A promise that resolves with the created user
     */
    async create(data: {
        email: string
        name: string
        password: string
    }): Promise<User> {

        const saltRounds = parseInt(process.env.SALT_ROUNDS)

        return await new Promise((resolve, reject) => {
            hash(data.password, saltRounds, async (err, hash) => {
                if (err) reject(err)
                resolve(this.prismaService.user.create({
                    data: {
                        email: data.email,
                        name: data.name,
                        Password: {create: {hash}}
                    }
                }))
            })
        })
    }

    /**
     * Asynchronously updates the user with the specified email using the provided data.
     *
     * @param {string} email - the email of the user to be updated
     * @param {{ name: string }} data - the new data to update for the user
     * @return {Promise<User>} the updated user
     * @throws {UserNotFoundError} if the user is not found
     */
    async update(email: string, data: { name: string }): Promise<User> {

        const user = await this.prismaService.user.update({
            where: {email},
            data
        });
        if (!user) throw new UserNotFoundError(email)
        return user
    }

    /**
     * Asynchronously updates the password for a user.
     *
     * @param {string} email - the user's email
     * @param {string} prevPassword - the user's previous password
     * @param {string} newPassword - the new password to be set
     * @return {Promise<User>} a Promise that resolves with the updated user data
     * @throws {UserNotFoundError} if the user is not found
     * @throws {WrongPasswordError} if the previous password is incorrect
     */
    async updatePassword(email: string, prevPassword: string, newPassword: string): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: {email},
            include: {Password: {select: {hash: true}}}
        })
        if (!user) throw new UserNotFoundError(email)
        const isPasswordCorrect = await compare(prevPassword, user.Password.hash)
        if (!isPasswordCorrect) throw new WrongPasswordError()
        const saltRounds = parseInt(process.env.SALT_ROUNDS)
        return await new Promise((resolve) => {
            hash(newPassword, saltRounds, async (err, hash) => {
                resolve(await this.prismaService.user.update({
                    where: {email},
                    data: {
                        Password: {update: {hash}}
                    }
                }))
            })
        })
    }

    /**
     * Asynchronously deletes a user by their email.
     *
     * @param {string} email - The email of the user to be deleted
     * @return {Promise<User>} The deleted user object
     * @throws {UserNotFoundError} if the user is not found
     */
    async delete(email: string): Promise<User> {
        const user = await this.prismaService.user.delete({where: {email}})
        if (!user) throw new UserNotFoundError(email)
        return user
    }
}
