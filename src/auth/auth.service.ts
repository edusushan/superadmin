import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/config/constant';
import { User } from 'src/schema/user.schema';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signIn(
    dto: AuthDto,
    deviceName: string,
    response: Response,
  ): Promise<Tokens> {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user) throw new ForbiddenException('User not found');

    if (user.disabled_by_admin)
      throw new ForbiddenException('User not allowed');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches)
      throw new ForbiddenException("Username or Password didn't match");

    const tokens = await this.signToken(
      user._id.toString(),
      user.email,
      user.role,
    );

    response.cookie('token', tokens.access_token, {
      httpOnly: process.env.httpOnly === 'true',
      sameSite: 'none',
      secure: process.env.PRODUCTION === 'true',
    });

    await this.updateRtHash(
      user._id.toString(),
      deviceName,
      tokens.refresh_token,
    ); // Pass deviceName
    return tokens;
  }

  async signToken(
    userId: string,
    email: string,
    role: Role,
    client_id?: number,
  ): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { id: userId, email, role, client_id: client_id || null },
        { expiresIn: '15h', secret: 'at-secret' },
      ),
      this.jwtService.signAsync(
        { id: userId, email, role, client_id: client_id || null },
        { expiresIn: '7d', secret: 'rt-secret' },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async updateRtHash(userId: string, deviceName: string, rt: string) {
    const hash = await this.hashData(rt);

    const user = await this.userModel.findOne({
      _id: userId,
      'loginDevices.deviceName': deviceName,
    });

    if (user) {
      // Update the hashRt if the device exists
      await this.userModel.updateOne(
        { _id: userId, 'loginDevices.deviceName': deviceName },
        {
          $set: { 'loginDevices.$.hashRt': hash },
        },
      );
    } else {
      // If the device does not exist, push a new device to the loginDevices array
      await this.userModel.updateOne(
        { _id: userId },
        {
          $push: {
            loginDevices: {
              deviceName,
              hashRt: hash,
              isTwoFactorAuthenticated: false,
              lastUsedAt: new Date(),
            },
          },
        },
      );
    }
  }



  
}
