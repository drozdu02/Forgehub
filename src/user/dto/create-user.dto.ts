import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(200)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;'])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']{8,}$/,
    {
        message: "Password must unclude a small letter, big letter and a special character"
    }
    )
    passwordHash: string;

}


