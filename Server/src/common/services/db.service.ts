import mongoose from "mongoose";
import { User } from "../../DB/models/users.model";
import { BadRequestError } from "../utils/error.utils";

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
  async findById(id: string , projection?:string): Promise<any> {
    try {
      const data = await this.model.findById(id,projection);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  async findAll(filter?: any, options?: any) {
    try {
    const response= await this.model.find(filter,options);
    return response;
    } catch (error){
       throw new BadRequestError(error as string);
    }
  }
  async findByIdAndUpdate(id:string,filter:any,options:any={new:true})
  {
    try {
      const response= await this.model.findByIdAndUpdate(id,filter,options);
      return response;
    } catch (error) {
      throw new BadRequestError(error as string)
    }
  }
  async findByAndUpdate(filter:any,update:any,options:any={new:true})
  {
    try {
      const response=await this.model.findOneAndUpdate(filter,update,options);
      return response;
    } catch (error) {
      throw new BadRequestError(error as string)
    }
  }
}

export const userService = new DB(User);
