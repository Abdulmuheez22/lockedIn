import bcrypt from "bcrypt";


export const passwordHasher = ( myPlaintextPassword: string, ): Promise<string> => {
  return bcrypt.hash(myPlaintextPassword, 10);
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};


// const DUMMY_HASH = bcrypt.hashSync("dummy-password", SALT_ROUNDS);
// export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);
// export const verifyPassword = (plain: string, hash: string | undefined) =>
//  bcrypt.compare(plain, hash ?? DUMMY_HASH).then((ok) => ok && hash !== undefined);