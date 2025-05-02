import bcrypt from 'bcryptjs';
export class Password {
  static async hash(password: string) {
    return await bcrypt.hash(password, 12);
  }

  static async compare(hashedPassword: string, plainPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
