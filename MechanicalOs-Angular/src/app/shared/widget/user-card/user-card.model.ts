import { User } from "src/app/core/models/auth.models";

export interface UserCard extends User {
    premiumUser?: boolean;
}