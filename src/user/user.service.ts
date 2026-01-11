import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class UserService {
  constructor(
    private readonly db: DatabaseService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // -------------------------
  // GET USER
  // -------------------------
  async getUser(userId: string) {
    const result = await this.db.query(
      `
    SELECT
      u.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', l.id,
            'label', l.label,
            'is_default', l.is_default,
            'phone_number', l.phone_number,
            'address_line1', l.address_line1,
            'address_line2', l.address_line2,
            'city', l.city,
            'state', l.state,
            'postal_code', l.postal_code,
            'country', l.country,
            'latitude', l.latitude,
            'longitude', l.longitude,
            'created_at', l.created_at,
            'updated_at', l.updated_at
          )
        ) FILTER (WHERE l.id IS NOT NULL),
        '[]'
      ) AS addresses
    FROM users u
    LEFT JOIN user_contact_locations l
      ON l.user_id = u.id
     AND l.is_active = true
    WHERE u.id = $1
      AND u.is_active = true
    GROUP BY u.id
    `,
      [userId],
    );

    return result[0] ?? null;
  }

  // -------------------------
  // UPDATE USER (BASIC INFO)
  // -------------------------
  async updateUser(userId: string, payload: Partial<any>) {
    // -------------------------
    // UPDATE USER TABLE
    // -------------------------
    const allowedUserFields = [
      'full_name',
      'phone_number',
      'business_name',
      'vendor_description',
      'vendor_website',
      'shop_open_time',
      'shop_close_time',
      'avg_preparation_time',
      'min_order_value',
      'gender',
    ];

    const userFields: string[] = [];
    const userValues: any[] = [];
    let idx = 1;

    for (const key of allowedUserFields) {
      if (payload[key] !== undefined) {
        userFields.push(`${key} = $${idx++}`);
        userValues.push(payload[key]);
      }
    }

    if (userFields.length) {
      await this.db.query(
        `UPDATE users SET ${userFields.join(', ')}, updated_at = now() WHERE id = '${userId}'`,
        userValues,
      );
    }

    // -------------------------
    // INSERT OR UPDATE ADDRESS
    // -------------------------
    if (payload.address) {
      const address = payload.address;

      const allowedAddressFields = [
        'label',
        'is_default',
        'phone_number',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'is_active',
      ];

      /**
       * CASE 1: UPDATE (address id exists)
       */
      if (address.id) {
        const fields: string[] = [];
        const values: any[] = [];
        let aIdx = 1;
        for (const key of allowedAddressFields) {
          if (address[key] !== undefined) {
            fields.push(`${key} = $${aIdx++}`);
            values.push(address[key]);
          }
        }

        if (!fields.length) {
          throw new BadRequestException('No valid address fields to update');
        }

        await this.db.query(
          `UPDATE user_contact_locations
         SET ${fields.join(', ')},
             updated_at = now()
         WHERE id = '${address.id}'
           AND user_id = '${userId}'
           AND is_active = true`,
          values,
        );
      } else {
        /**
         * CASE 2: INSERT (no address id)
         */
        const fields: string[] = [];
        const placeholders: string[] = [];
        const values: any[] = [];
        let iIdx = 1;
        fields.push('user_id');
        placeholders.push(`$${iIdx++}`);
        values.push(userId);

        for (const key of allowedAddressFields) {
          if (address[key] !== undefined) {
            fields.push(key);
            placeholders.push(`$${iIdx++}`);
            values.push(address[key]);
          }
        }

        await this.db.query(
          `INSERT INTO user_contact_locations (${fields.join(', ')})
         VALUES (${placeholders.join(', ')})`,
          values,
        );
      }
    }

    // -------------------------
    // RETURN UPDATED USER
    // -------------------------
    return this.getUser(userId);
  }

  // -------------------------
  // UPDATE FCM TOKEN
  // -------------------------
  async updateFcmToken(userId: string, fcmToken: string) {
    const result = await this.db.query(
      `UPDATE users
       SET fcm_token = $1,
           updated_at = now()
       WHERE id = $2
       RETURNING id, fcm_token`,
      [fcmToken, userId],
    );

    return result[0];
  }

  // -------------------------
  // UPDATE PROFILE PIC
  // -------------------------
  async updateProfilePic(userId: string, file: File) {
    const supabase = this.supabaseService.getClient();

    const filePath = `profile-pics/${userId}-${Date.now()}`;

    const { error } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const { data } = supabase.storage
      .from('user-assets')
      .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    const result = await this.db.query(
      `UPDATE users
       SET profile_pic = $1,
       updated_at = now()
       WHERE id = $2
       RETURNING profile_pic`,
      [imageUrl, userId],
    );

    return result[0];
  }

  // -------------------------
  // DELETE PROFILE PIC
  // -------------------------
  async deleteProfilePic(userId: string) {
    const user = await this.getUser(userId);

    if (!user?.profile_pic) return true;

    const supabase = this.supabaseService.getClient();

    const filePath = user.profile_pic.split('/').slice(-1)[0];

    await supabase.storage
      .from('user-assets')
      .remove([`profile-pics/${filePath}`]);

    await this.db.query(
      `UPDATE users
       SET profile_pic = NULL,
           updated_at = now()
       WHERE id = $1`,
      [userId],
    );

    return true;
  }
}
