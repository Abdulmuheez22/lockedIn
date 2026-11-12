import bcrypt from "bcrypt";

export const passwordHasher = ( myPlaintextPassword: string, ): Promise<string> => {
  return bcrypt.hash(myPlaintextPassword, 10);
};

export const verifyPassword = async (hashedPassword: string, password: string) => {
    return await bcrypt.compare(hashedPassword, password);
}
