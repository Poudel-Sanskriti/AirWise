import User, { IUser } from '../models/User';

class UserService {

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  async updateUser(userId: string, updates: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(userId, updates, { new: true });
  }

  async updateHealthProfile(userId: string, healthProfile: any): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { healthProfile },
      { new: true }
    );
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find();
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(userId);
    return !!result;
  }
}

export default new UserService();