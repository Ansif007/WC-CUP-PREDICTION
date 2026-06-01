import { z } from "zod";

export const registrationSchema = z.object({
  employeeId: z.string().min(4).max(12),
  fullName: z.string().min(3).max(80),
  displayName: z.string().min(3).max(24),
  departmentId: z.string().min(1),
  pin: z.string().regex(/^\d{4}$/)
});

export const predictionSchema = z.object({
  matchId: z.string().min(1),
  predictedOutcome: z.enum(["HOME_WIN", "DRAW", "AWAY_WIN"]),
  predictedHomeScore: z.number().int().min(0).max(20),
  predictedAwayScore: z.number().int().min(0).max(20),
  predictedScorerId: z.string().optional().nullable()
});

export const resultSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED", "POSTPONED", "CANCELLED"]).default("FINISHED"),
  isOverride: z.boolean().default(true),
  goalScorers: z
    .array(
      z.object({
        playerId: z.string().min(1),
        minute: z.number().int().min(0).max(130).optional().nullable()
      })
    )
    .default([])
});

export const matchSchema = z.object({
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  stage: z.enum(["GROUP", "ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "FINAL"]),
  kickoffAt: z.string().datetime(),
  lockAt: z.string().datetime().optional(),
  stadium: z.string().max(120).optional().nullable(),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED", "POSTPONED", "CANCELLED"]).default("SCHEDULED"),
  matchDay: z.number().int().min(1).max(64)
});
