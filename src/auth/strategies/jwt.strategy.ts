import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {UserService} from "../../user/user.service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        });
    }

    async validate(payload) {
        const user = await this.userService.findOne(payload.email)
        return {
            id: user.id,
            name: user.name,
            email: user.email
        }
    }
}