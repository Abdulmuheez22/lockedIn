import * as z from "zod"
import {
  challengeEnum,
  emotionalStateEnum,
  focusLevelEnum,
  studyMethodEnum,
  studyTechniqueEnum,
  understandingEnum,
} from "../src/db/schema.js";


const levels = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
  "600 Level",
  "700 Level",
] as const;


const fullName = z.string().trim().min(1).max(555);

const email = z.string().trim().max(255).pipe(z.email());

const password = z.string().min(6).max(255);

const level = z.enum(levels);

const department = z.string().trim().min(1).max(255);

const phoneNumber = z.string().trim().min(1).max(255);

const otp = z.string().trim().max(6)


const studyMinutes = z.number().int().min(1).max(1440);

const coursesStudied = z.array(z.string().trim().min(1).max(255)).min(1);

const studyMethods = z.array(z.enum(studyMethodEnum.enumValues)).min(1);

const studyTechniques = z.array(z.enum(studyTechniqueEnum.enumValues)).min(1);

const focusLevel = z.enum(focusLevelEnum.enumValues);

const emotionalState = z.enum(emotionalStateEnum.enumValues);

const understanding = z.enum(understandingEnum.enumValues);

const challengeFaced = z.enum(challengeEnum.enumValues);

const whatWentWell = z.string().trim().min(1).max(5000);

const whatToImprove = z.string().trim().min(1).max(5000);

const nextDayPlan = z.string().trim().min(1).max(5000).nullable().optional();



export const dpfSchema = z.object({
  studyMinutes,
  coursesStudied,
  studyMethods,
  studyTechniques,
  focusLevel,
  emotionalState,
  understanding,
  challengeFaced,
  whatWentWell,
  whatToImprove,
  nextDayPlan
})


export const signUpSchema = z.object({
    fullName,
    email,
    password,
    level,
    department,
    phoneNumber
})

export const otpSchema = z.object({
  email, 
  otp
})

export const signInSchema = z.object({
  email,
  password
})

export const resendOtpSchema = z.object({
  email
})

export const forgetPasswordSchema = z.object({
  email
})

export const forgetPassword2Schema = z.object({
  email,
  otp
})

export const resetPasswordSchema = z.object({
  email,
  otp,
  password
})