// database.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: Pool;
  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>(
      'SUPABASE_DB_ENDPOINT',
    );
    this.pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const { rows } = await this.pool.query(sql, params);
    return rows;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
