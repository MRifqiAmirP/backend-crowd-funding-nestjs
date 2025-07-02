import { Expose } from "class-transformer";

export class Auth {
    @Expose()
    accessToken: string;

    @Expose()
    idToken: string;
}
