import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {UserWithoutPassword} from "../entities/user_without_password.entity";

export const CurrentUser = createParamDecorator((data, context: ExecutionContext): UserWithoutPassword => {
    return context.switchToHttp().getRequest().user
})