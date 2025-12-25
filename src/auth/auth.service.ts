import {
  Injectable,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { SignInDto, SignUpDto, ForgotPasswordDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // ---------------- SIGN UP ----------------
  async signUp(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      throw new HttpException(
        error.message || 'User already exists',
        //@ts-ignore
        error.status,
      );
    }

    return {
      message: 'User registered successfully',
      user: data.user,
    };
  }

  // ---------------- SIGN IN ----------------
  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new UnauthorizedException('Invalid email or password');
      }
      throw new HttpException(
        error.message || 'User already exists',
        //@ts-ignore
        error.status,
      );
    }

    return {
      message: 'Login successful',
      session: data.session,
      user: data.user,
    };
  }

  // ---------------- FORGOT PASSWORD ----------------
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new HttpException(
        error.message || 'User already exists',
        //@ts-ignore
        error.status,
      );
    }

    return {
      message: 'Password reset email sent successfully',
    };
  }

  // ---------------- SIGN OUT ----------------
  async signOut(accessToken: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.admin.signOut(accessToken);

    if (error) {
      throw new HttpException(error.message, 500);
    }

    return {
      message: 'User Sign out successfully.',
    };
  }
}
