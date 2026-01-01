import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  async getUserById(userId: string) {
    const users = await this.db.query(
      `SELECT *
       FROM users 
       WHERE id = $1`,
      [userId],
    );

    console.log('users: ', users, userId);

    return users[0] ?? null;
  }
}
