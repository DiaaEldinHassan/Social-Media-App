import mongoose from "mongoose";
import { User } from "../../DB/models/users.model";

class DB {
  constructor(private model: mongoose.Model<any>) {
    this.model = model;
  }

  async findByEmail(email: string): Promise<any> {
    try {
      const user = await this.model.findOne({ email });
      return user;
    } catch (error) {
      console.log(error);
    }
  }
  async createNewInstance(data: any): Promise<{
    message: string;
  }> {
    try {
      await this.model.create(data);
      return { message: "Data Created Successfully" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findById(id: string): Promise<any> {
    try {
      const data = await this.model.findById(id);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}

export const userService = new DB(User);
