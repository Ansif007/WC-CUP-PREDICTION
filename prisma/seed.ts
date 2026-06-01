import { PrismaClient, MatchStage, MatchStatus, PredictionOutcome, Role, UserStatus } from "@prisma/client";
import argon2 from "argon2";
import { addDays, addHours, startOfDay, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.goalScorer.deleteMany();
  await prisma.matchResult.deleteMany();
  await prisma.scoringHistory.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const departments = await Promise.all(
    [
      { name: "Production", code: "PROD" },
      { name: "Quality", code: "QUAL" },
      { name: "Maintenance", code: "MAIN" },
      { name: "Stores", code: "STOR" },
      { name: "HR", code: "HR" }
    ].map((department) => prisma.department.create({ data: department }))
  );

  const departmentByCode = new Map(departments.map((department) => [department.code, department]));
  const pinHash = await argon2.hash("1234");
  const seedUsers: Array<{
    employeeId: string;
    fullName: string;
    displayName: string;
    departmentCode: string;
    role: Role;
    status: UserStatus;
  }> = [
    { employeeId: "MRF0001", fullName: "Admin User", displayName: "AdminBoss", departmentCode: "PROD", role: Role.ADMIN, status: UserStatus.APPROVED },
    { employeeId: "MRF1023", fullName: "Arun Kumar", displayName: "GoalMachine23", departmentCode: "PROD", role: Role.PARTICIPANT, status: UserStatus.APPROVED },
    { employeeId: "MRF1044", fullName: "Deepa Nair", displayName: "PenaltyQueen", departmentCode: "QUAL", role: Role.PARTICIPANT, status: UserStatus.APPROVED },
    { employeeId: "MRF1088", fullName: "Joseph Raj", displayName: "VARMaster", departmentCode: "MAIN", role: Role.PARTICIPANT, status: UserStatus.APPROVED },
    { employeeId: "MRF1120", fullName: "Karthik S", displayName: "TikiTaka", departmentCode: "STOR", role: Role.PARTICIPANT, status: UserStatus.APPROVED },
    { employeeId: "MRF1199", fullName: "Nisha Das", displayName: "HeaderHero", departmentCode: "HR", role: Role.PARTICIPANT, status: UserStatus.PENDING }
  ];

  const users = await Promise.all(
    seedUsers.map(({ employeeId, fullName, displayName, departmentCode, role, status }) =>
      prisma.user.create({
        data: {
          employeeId,
          fullName,
          displayName,
          departmentId: departmentByCode.get(departmentCode)!.id,
          role,
          status,
          pinHash
        }
      })
    )
  );

  const teams = await Promise.all(
    [
      { code: "ARG", name: "Argentina", flagUrl: "/icons/arg.svg" },
      { code: "BRA", name: "Brazil", flagUrl: "/icons/bra.svg" },
      { code: "FRA", name: "France", flagUrl: "/icons/fra.svg" },
      { code: "GER", name: "Germany", flagUrl: "/icons/ger.svg" },
      { code: "ESP", name: "Spain", flagUrl: "/icons/esp.svg" },
      { code: "POR", name: "Portugal", flagUrl: "/icons/por.svg" }
    ].map((team) => prisma.team.create({ data: team }))
  );

  const teamByCode = new Map(teams.map((team) => [team.code, team]));

  await prisma.player.createMany({
    data: [
      { externalId: "arg-messi", name: "Lionel Messi", teamId: teamByCode.get("ARG")!.id },
      { externalId: "arg-alvarez", name: "Julian Alvarez", teamId: teamByCode.get("ARG")!.id },
      { externalId: "bra-vini", name: "Vinicius Junior", teamId: teamByCode.get("BRA")!.id },
      { externalId: "bra-rodrygo", name: "Rodrygo", teamId: teamByCode.get("BRA")!.id },
      { externalId: "fra-mbappe", name: "Kylian Mbappe", teamId: teamByCode.get("FRA")!.id },
      { externalId: "fra-griezmann", name: "Antoine Griezmann", teamId: teamByCode.get("FRA")!.id },
      { externalId: "ger-musiala", name: "Jamal Musiala", teamId: teamByCode.get("GER")!.id },
      { externalId: "ger-havertz", name: "Kai Havertz", teamId: teamByCode.get("GER")!.id },
      { externalId: "esp-yamal", name: "Lamine Yamal", teamId: teamByCode.get("ESP")!.id },
      { externalId: "esp-morata", name: "Alvaro Morata", teamId: teamByCode.get("ESP")!.id },
      { externalId: "por-ronaldo", name: "Cristiano Ronaldo", teamId: teamByCode.get("POR")!.id },
      { externalId: "por-silva", name: "Bernardo Silva", teamId: teamByCode.get("POR")!.id }
    ]
  });

  const players = await prisma.player.findMany();
  const playerByExternalId = new Map(players.map((player) => [player.externalId!, player]));
  const today = startOfDay(new Date());

  const matches = await Promise.all([
    prisma.match.create({
      data: {
        externalId: "seed-finished-1",
        homeTeamId: teamByCode.get("ARG")!.id,
        awayTeamId: teamByCode.get("BRA")!.id,
        stage: MatchStage.GROUP,
        status: MatchStatus.FINISHED,
        matchDay: 1,
        kickoffAt: addHours(subDays(today, 1), 18),
        lockAt: addHours(subDays(today, 1), 18),
        stadium: "Lusail Stadium"
      }
    }),
    prisma.match.create({
      data: {
        externalId: "seed-today-1",
        homeTeamId: teamByCode.get("FRA")!.id,
        awayTeamId: teamByCode.get("GER")!.id,
        stage: MatchStage.GROUP,
        status: MatchStatus.SCHEDULED,
        matchDay: 2,
        kickoffAt: addHours(today, 19),
        lockAt: addHours(today, 19),
        stadium: "Al Bayt Stadium"
      }
    }),
    prisma.match.create({
      data: {
        externalId: "seed-today-2",
        homeTeamId: teamByCode.get("ESP")!.id,
        awayTeamId: teamByCode.get("POR")!.id,
        stage: MatchStage.GROUP,
        status: MatchStatus.SCHEDULED,
        matchDay: 2,
        kickoffAt: addHours(today, 22),
        lockAt: addHours(today, 22),
        stadium: "Education City Stadium"
      }
    }),
    prisma.match.create({
      data: {
        externalId: "seed-future-qf",
        homeTeamId: teamByCode.get("ARG")!.id,
        awayTeamId: teamByCode.get("FRA")!.id,
        stage: MatchStage.QUARTERFINAL,
        status: MatchStatus.SCHEDULED,
        matchDay: 5,
        kickoffAt: addHours(addDays(today, 2), 20),
        lockAt: addHours(addDays(today, 2), 20),
        stadium: "974 Stadium"
      }
    })
  ]);

  const approvedUsers = users.filter((user) => user.status === UserStatus.APPROVED && user.role === Role.PARTICIPANT);

  await prisma.prediction.createMany({
    data: [
      {
        userId: approvedUsers[0].id,
        matchId: matches[0].id,
        predictedOutcome: PredictionOutcome.HOME_WIN,
        predictedHomeScore: 2,
        predictedAwayScore: 1,
        predictedScorerId: playerByExternalId.get("arg-messi")!.id,
        isLocked: true,
        pointsAwarded: 45
      },
      {
        userId: approvedUsers[1].id,
        matchId: matches[0].id,
        predictedOutcome: PredictionOutcome.DRAW,
        predictedHomeScore: 1,
        predictedAwayScore: 1,
        predictedScorerId: playerByExternalId.get("bra-vini")!.id,
        isLocked: true,
        pointsAwarded: 10
      },
      {
        userId: approvedUsers[2].id,
        matchId: matches[0].id,
        predictedOutcome: PredictionOutcome.HOME_WIN,
        predictedHomeScore: 3,
        predictedAwayScore: 1,
        predictedScorerId: playerByExternalId.get("arg-alvarez")!.id,
        isLocked: true,
        pointsAwarded: 20
      },
      {
        userId: approvedUsers[3].id,
        matchId: matches[1].id,
        predictedOutcome: PredictionOutcome.HOME_WIN,
        predictedHomeScore: 2,
        predictedAwayScore: 0,
        predictedScorerId: playerByExternalId.get("fra-mbappe")!.id
      },
      {
        userId: approvedUsers[0].id,
        matchId: matches[2].id,
        predictedOutcome: PredictionOutcome.AWAY_WIN,
        predictedHomeScore: 0,
        predictedAwayScore: 1,
        predictedScorerId: playerByExternalId.get("por-ronaldo")!.id
      }
    ]
  });

  const result = await prisma.matchResult.create({
    data: {
      matchId: matches[0].id,
      homeScore: 2,
      awayScore: 1,
      winner: PredictionOutcome.HOME_WIN,
      isOverride: true,
      updatedById: users[0].id
    }
  });

  await prisma.goalScorer.createMany({
    data: [
      { matchResultId: result.id, playerId: playerByExternalId.get("arg-messi")!.id, minute: 34 },
      { matchResultId: result.id, playerId: playerByExternalId.get("arg-alvarez")!.id, minute: 68 },
      { matchResultId: result.id, playerId: playerByExternalId.get("bra-vini")!.id, minute: 77 }
    ]
  });

  const scoredPredictions = await prisma.prediction.findMany({
    where: { matchId: matches[0].id },
    orderBy: { createdAt: "asc" }
  });

  await prisma.scoringHistory.createMany({
    data: [
      {
        userId: approvedUsers[0].id,
        matchId: matches[0].id,
        predictionId: scoredPredictions[0].id,
        winnerPoints: 10,
        differencePts: 5,
        exactScorePts: 20,
        scorerPoints: 10,
        multiplier: 1,
        totalPoints: 45
      },
      {
        userId: approvedUsers[1].id,
        matchId: matches[0].id,
        predictionId: scoredPredictions[1].id,
        winnerPoints: 0,
        differencePts: 0,
        exactScorePts: 0,
        scorerPoints: 10,
        multiplier: 1,
        totalPoints: 10
      },
      {
        userId: approvedUsers[2].id,
        matchId: matches[0].id,
        predictionId: scoredPredictions[2].id,
        winnerPoints: 10,
        differencePts: 0,
        exactScorePts: 0,
        scorerPoints: 10,
        multiplier: 1,
        totalPoints: 20
      }
    ]
  });

  await prisma.user.update({
    where: { id: approvedUsers[0].id },
    data: { totalPoints: 45, winnerHits: 1, exactScoreHits: 1, scorerHits: 1, currentStreak: 1, longestStreak: 1 }
  });
  await prisma.user.update({
    where: { id: approvedUsers[1].id },
    data: { totalPoints: 10, winnerHits: 0, exactScoreHits: 0, scorerHits: 1, currentStreak: 1, longestStreak: 1 }
  });
  await prisma.user.update({
    where: { id: approvedUsers[2].id },
    data: { totalPoints: 20, winnerHits: 1, exactScoreHits: 0, scorerHits: 1, currentStreak: 1, longestStreak: 1 }
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: approvedUsers[0].id,
        title: "Leaderboard updated",
        message: "You jumped to the top after Argentina vs Brazil."
      },
      {
        userId: approvedUsers[0].id,
        title: "New match available",
        message: "France vs Germany is ready for predictions."
      },
      {
        userId: approvedUsers[1].id,
        title: "Prediction closes soon",
        message: "Spain vs Portugal locks in under 30 minutes."
      }
    ]
  });

  await prisma.leaderboardSnapshot.create({
    data: {
      scope: "OVERALL",
      payload: [
        { rank: 1, displayName: approvedUsers[0].displayName, department: departmentByCode.get("PROD")!.name, totalPoints: 45 },
        { rank: 2, displayName: approvedUsers[2].displayName, department: departmentByCode.get("MAIN")!.name, totalPoints: 20 },
        { rank: 3, displayName: approvedUsers[1].displayName, department: departmentByCode.get("QUAL")!.name, totalPoints: 10 }
      ]
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
