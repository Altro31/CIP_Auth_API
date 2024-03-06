import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LocalAuthGuard} from "./guards/local_auth.guard";
import {CurrentUser} from "./param_decorators/current_user.param_decorator";
import {UserWithoutPassword} from "./entities/user_without_password.entity";
import {JWTAuthGuard} from "./guards/jwt_auth.guard";
import {RequiredPipe} from "./pipes/required.pipe";
import {ApiBearerAuth, ApiBody} from "@nestjs/swagger";
import {LoginDto} from "./dto/login.dto";
import {RegisterDto} from "./dto/register.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @ApiBody({type: LoginDto, description: 'Login with email and password'})
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@CurrentUser() user: UserWithoutPassword) {
        return this.authService.login(user)
    }

    @ApiBody({type: RegisterDto, description: 'Register with email, username and password'})
    @Post('register')
    async register(
        @Body('email', RequiredPipe) email: string,
        @Body('username', RequiredPipe) name: string,
        @Body('password', RequiredPipe) password: string
    ) {
        return this.authService.register(email, name, password)
    }

    @ApiBody({type: ChangePasswordDto, description: 'Change password'})
    @ApiBearerAuth()
    @UseGuards(JWTAuthGuard)
    @Post('change-password')
    async change_password(
        @CurrentUser() user: UserWithoutPassword,
        @Body('prev_password', RequiredPipe) prev_pw: string,
        @Body('new_password', RequiredPipe) new_pw: string
    ) {
        return this.authService.change_password(user.email, prev_pw, new_pw)
    }
}
