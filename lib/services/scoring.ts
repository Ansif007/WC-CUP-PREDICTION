import { MatchStage, PredictionOutcome, type MatchResult, type Prediction } from "@prisma/client";
import { stageMultipliers } from "@/lib/constants/app";

export function calculatePredictionScore(matchStage: MatchStage, prediction: Pick<Prediction, "predictedOutcome" | "predictedHomeScore" | "predictedAwayScore">, result: Pick<MatchResult, "winner" | "homeScore" | "awayScore">, scorerHit: boolean) {
  let winnerPoints = prediction.predictedOutcome === result.winner ? 10 : 0;
  let differencePts = prediction.predictedHomeScore - prediction.predictedAwayScore === result.homeScore - result.awayScore ? 5 : 0;
  let exactScorePts = prediction.predictedHomeScore === result.homeScore && prediction.predictedAwayScore === result.awayScore ? 20 : 0;
  let scorerPoints = scorerHit ? 10 : 0;
  const multiplier = stageMultipliers[matchStage];
  const totalPoints = Math.round((winnerPoints + differencePts + exactScorePts + scorerPoints) * multiplier);

  return { winnerPoints, differencePts, exactScorePts, scorerPoints, multiplier, totalPoints };
}

export function deriveOutcome(homeScore: number, awayScore: number): PredictionOutcome {
  if (homeScore > awayScore) return PredictionOutcome.HOME_WIN;
  if (homeScore < awayScore) return PredictionOutcome.AWAY_WIN;
  return PredictionOutcome.DRAW;
}
