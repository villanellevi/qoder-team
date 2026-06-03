import { UserService } from './user.service';
export declare class UserController {
    private user;
    constructor(user: UserService);
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        avatar: string;
        role: string;
    }>;
}
