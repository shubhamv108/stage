import {
    IsNotEmpty,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserListItemDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    contentId: string;
}
