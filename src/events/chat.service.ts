// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './chat.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async sendMessage(
    senderId: string,
    receiverId: string,
    message: string,
  ): Promise<Chat> {
    const newMessage = new this.chatModel({ senderId, receiverId, message });
    return newMessage.save();
  }

  async getMessages(senderId: string, receiverId: string): Promise<Chat[]> {
    return this.chatModel
      .find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }
}
