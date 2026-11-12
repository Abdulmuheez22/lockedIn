import type { Request, Response } from "express";
import { signUpSchema } from "../utils/zodshema.js";
import { db } from "../src/index.js";
import { usersTable } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { passwordHasher } from "../utils/bcrpt.js";
import { generateOtp } from "../utils/otp.js";

export const signUp = async (req: Request, res: Response) => {
    try{
        const validatedRequest = signUpSchema.safeParse(req.body)

        if(!validatedRequest.success){
            console.log('error validating user in signup')
            return res.status(400).json({meesage: 'Bad request'})
        }
        const checkEmail = await db.select({ email: usersTable.email}).from(usersTable).where(eq(usersTable.email, validatedRequest.data.email));
        
        if(checkEmail.length > 0 ){ return res.status(409).json({message: 'Email already used by an Active user'})};

        const hashedPassword = await passwordHasher(validatedRequest.data.password)

        const otp = generateOtp()

        const hashedOtp = await passwordHasher(otp);

        
        console.log(otp)
        
    }
    catch(error){
        console.log('this error is from the signup catch: ', error)
        return res.status(500).json({message: 'Error Creating Account'})
    }
}

// {
//   fullName: 'Rama Daugherty',
//   email: 'pyhawevip@mailinator.com',
//   password: 'Pa$$w0rd!',
//   level: '500 Level',
//   department: 'Corporis amet non c',
//   phoneNumber: '+1 (652) 438-7633'
// }
