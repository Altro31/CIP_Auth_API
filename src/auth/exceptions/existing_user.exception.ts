import {ConflictException} from "@nestjs/common";

export class ExistingUserException extends ConflictException {
    constructor() {
        super();
    }
}