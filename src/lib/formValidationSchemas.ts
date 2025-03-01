import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject Name is required!" }),
  type: z.enum(["THEORY", "PRACTICAL"], { message: "Type is required!" }),
  teachers: z.array(z.string()), //teacher ids
  subjectCode: z.string(),
  maxMarks: z.coerce.number(),
  branchId: z.coerce.number().min(1, { message: "branch name is required!" }),
  semesterId: z.coerce.number().min(1, { message: "semester name is required!" }),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const branchSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Branch name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  semesterId: z.coerce.number().optional(),
  supervisorId: z.coerce.string().optional(),
});

export type BranchSchema = z.infer<typeof branchSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .or(z.literal("")),
  name: z.string().min(1, { message: "Name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  division: z.string().optional(),
  branches: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;


export const registrarSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
});

export type RegistrarSchema = z.infer<typeof registrarSchema>;


export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Name is required!" }),
  fatherName: z.string().min(1, { message: "Father Name is required!" }),
  address: z.string(),
  motherName: z.string().min(1, { message: "Mother Name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  phone: z.string().optional(),
  img: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  semesterId: z.coerce.number().min(1, { message: "Semester is required!" }),
  branchId: z.coerce.number().min(1, { message: "Branch Name is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  examDate: z.coerce.date({ message: "exam date is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  branchId: z.coerce.number({ message: "branch is required!" }),
  subjectId: z.coerce.number({ message: "subject is required!" }),
  semesterId: z.coerce.number({ message: "semester is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  branchId: z.coerce.number({ message: "branch is required!" }),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  sessionalExam: z.string().optional(),
  endTerm: z.string().optional(),
  overallMark: z.string().optional(),
  grade: z.string().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
  examId: z.coerce.number().min(1, { message: "Exam is required!" }),
});

export type ResultSchema = z.infer<typeof resultSchema>;