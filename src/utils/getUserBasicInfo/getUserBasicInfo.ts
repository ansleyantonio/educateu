import { CreateUsers } from "@/app/admin/user-management/_assets/interface/CreateUserSchema";

export function getUserBasicInfo(user: CreateUsers) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
}