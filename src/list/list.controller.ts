import {Controller, Get, Post, Body, Delete, UseGuards, Query, HttpException, HttpStatus, Req} from '@nestjs/common';
import {ApiBearerAuth, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import {UserService} from "./list.servce";
import {AddUserListItemDto} from "./dto/add-user-list-item.dto";
import {DeleteUserListItemDto} from "./dto/delete-user-list-item.dto";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('List')
@Controller('list')
export class ListController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Successfully fetched list items.' })
  @ApiResponse({ status: 400, description: 'Invalid pagination parameters.' })
  async findAll(
      @Req() req: any,
      @Query('limit') limit = 10,
      @Query('offset') offset = 0,) : Promise<{ items: {contentId, contentType}[]; total: number }> {
    const username = req.user.username;
    if (limit < 1 || offset < 0) {
      throw new HttpException(
          'Invalid pagination parameters.',
          HttpStatus.BAD_REQUEST,
      );
    }
    const pagination = {
      limit: limit ? Number(limit) : 10,
      offset: offset ? Number(offset) : 0,
    };
    return this.userService.listMyItems(username, pagination);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiResponse({ status: 201, description: 'Item successfully added to the list.' })
  @ApiResponse({ status: 400, description: 'Invalid or duplicate item.' })
  async add(@Req() req: any, @Body() addUserListItemDto: AddUserListItemDto) {
      const username = req.user.username;
      this.userService.addToList(username, addUserListItemDto);
      return { message: 'Item added successfully.' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete()
  async removeItem(@Req() req: any, @Body() deleteUserListItemDto: DeleteUserListItemDto) {
      const username = req.user.username;
      const isDeleted = await this.userService.removeFromList(username, deleteUserListItemDto.contentId);
      if (!isDeleted) {
        throw new HttpException('Item not found.', HttpStatus.BAD_REQUEST);
      }
      return { message: 'Item removed successfully.' };
  }
}
