import { z } from 'zod';

export const nicknameSchema = z.string().trim().min(1).max(30);

export const cycleLengthSchema = z.number().int().min(20).max(45);

export const periodLengthSchema = z.number().int().min(2).max(10);

export const profileFormSchema = z.object({
  nickname: nicknameSchema,
  averageCycleLength: cycleLengthSchema,
  averagePeriodLength: periodLengthSchema,
});
