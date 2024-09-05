import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/config/constant';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  image?: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop({ default: 0 })
  loginAttempts: number;

  @Prop()
  lockUntil?: Date;

  @Prop({ default: false })
  enable2fa: boolean;

  @Prop()
  twoFactorCode?: string;

  @Prop()
  twoFactorCodeExpiresIn?: Date;

  @Prop({
    type: [
      {
        deviceName: String,
        hashRt: String,
        isTwoFactorAuthenticated: Boolean,
        lastUsedAt: Date,
      },
    ],
  })
  loginDevices?: {
    deviceName: string;
    hashRt: string;
    isTwoFactorAuthenticated: boolean;
    lastUsedAt: Date;
  }[];

  @Prop({ default: false })
  disabled_by_admin: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook to hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export { UserSchema };
