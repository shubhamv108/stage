import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {User, UserDocument} from "../models/user.schema";
import {AddUserListItemDto} from "./dto/add-user-list-item.dto";
import * as bcrypt from 'bcrypt';

interface Pagination {
  limit: number;
  offset: number;
}

@Injectable()
export class UserService {
  constructor(
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Add an item to the user's list.
   * @param username - The username of the user.
   * @param item - The item to add to the list (contentId and contentType).
   * @returns The updated user's list.
   */
  async addToList(username: string, addUserListItemDto: AddUserListItemDto) {
    const { contentId, contentType } = addUserListItemDto;

    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check for duplicate item
    const duplicateItem = user.myList.find(
        (listItem) => listItem.contentId === contentId && listItem.contentType === contentType,
    );
    if (duplicateItem) {
      throw new HttpException('Item already exists in the list', HttpStatus.CONFLICT);
    }

    user.myList.push({ contentId, contentType });
    return await user.save();
    return user.myList;
  }

  /**
   * Remove an item from the user's list.
   * @param username - The username of the user.
   * @param contentId - The content ID of the item to remove.
   * @returns A success message.
   */
  async removeFromList(username: string, contentId: string) {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const initialLength = user.myList.length;
    user.myList = user.myList.filter((listItem) => listItem.contentId !== contentId);

    // Check if any item was removed
    if (user.myList.length === initialLength) {
      throw new HttpException('Item not found in the list', HttpStatus.NOT_FOUND);
    }

    await user.save();
    return user.myList;
  }

  /**
   * Fetch all items from the user's list with pagination.
   * @param username - The username of the user.
   * @param pagination - Pagination options (limit and offset).
   * @returns The list of items for the user.
   */
  async listMyItems(username: string, pagination: Pagination): Promise<{ items: {contentId, contentType}[]; total: number }> {
    const { limit, offset } = pagination;

    const user = await this.userModel
        .findOne({ username })
        .select('myList')
        .exec();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Paginate the items
    const paginatedItems = user.myList.slice(offset, offset + limit);
    return {
      items: paginatedItems,
      total: user.myList.length,
    };
  }

  async findOne(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.findOne(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
