import { UserDto } from "../../../shared/dto/user.dto";

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}