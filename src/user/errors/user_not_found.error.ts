export class UserNotFoundError extends Error {

    private readonly _email: string

    constructor(email: string) {
        super(`User with email ${email} not found`)
        this._email = email
    }

    get email() {
        return this._email
    }

}