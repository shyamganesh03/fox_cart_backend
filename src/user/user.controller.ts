// src/users/user.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
  Post,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Express } from 'express';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateFcmDto } from './dto/update-fcm.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String })
  getMe(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({ summary: 'Update user profile' })
  updateMe(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.updateUser(id, body);
  }

  @Put(':id/fcm-token')
  @ApiOperation({ summary: 'Update FCM token' })
  updateFcm(@Param('id') id: string, @Body() body: UpdateFcmDto) {
    return this.userService.updateFcmToken(id, body.fcm_token);
  }

  @Post(':id/profile-pic')
  @ApiOperation({ summary: 'Update profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  updateProfilePic(@Param('id') id: string, @UploadedFile() file: File) {
    return this.userService.updateProfilePic(id, file);
  }

  @Delete(':id/profile-pic')
  @ApiOperation({ summary: 'Delete profile picture' })
  deleteProfilePic(@Param('id') id: string) {
    return this.userService.deleteProfilePic(id);
  }
}
