using System.Collections.Generic;
using AIBackendAPI.Data.Models;

namespace AIBackendAPI.Common
{
    public static class Utils
    {
        public static Tuple<IList<AIModel>, IList<AIModelCall>, IList<TopAIModel>, IList<Usage>> GetTestData()
        {
            List<AIModel> Models = [];
            List<AIModelCall> ModelCalls = [];
            List<TopAIModel> TopModels = [];
            List<Usage> UsageData = [];

            var now = DateTime.UtcNow;
            var rng = new Random();

            var modelA = new AIModel { Id = 1, Name = "gpt-4", CostPerToken = 0.00002 };
            var modelB = new AIModel { Id = 2, Name = "gpt-3.5-turbo", CostPerToken = 0.000005 };
            var modelC = new AIModel { Id = 3, Name = "embedding-3-large", CostPerToken = 0.000001 };

            Models.Add(modelA);
            Models.Add(modelB);
            Models.Add(modelC);

            long[] teamIds = [101, 202, 303];

            long topId = 1;
            long usageId = 1;

            int totalWeeks = 52;
            var weeklyUsages = new Dictionary<long, List<Usage>>();

            foreach (var teamId in teamIds)
            {
                weeklyUsages[teamId] = [];
            }

            for (int week = 1; week <= totalWeeks; week++)
            {
                int yearNum = now.Year;
                string period = $"year-{yearNum}-week-{week}";
                double trendMultiplier = 1.0 + (week * 0.02);

                foreach (var teamId in teamIds)
                {
                    int callsA = rng.Next(5, 15);
                    int callsB = rng.Next(3, 10);
                    int callsC = rng.Next(1, 6);

                    int tokensA = callsA * rng.Next(500, 2000);
                    int tokensB = callsB * rng.Next(300, 1500);
                    int tokensC = callsC * rng.Next(200, 1000);

                    double costA = tokensA * modelA.CostPerToken * trendMultiplier;
                    double costB = tokensB * modelB.CostPerToken * trendMultiplier;
                    double costC = tokensC * modelC.CostPerToken * trendMultiplier;

                    var teamTopModels = new List<TopAIModel>
                    {
                        new() {
                            Id = topId++,
                            TeamId = teamId,
                            Calls = callsA,
                            DateCreated = now,
                            Period = period,
                            AIModelId = modelA.Id,
                            AIModel = modelA
                        },
                        new() {
                            Id = topId++,
                            TeamId = teamId,
                            Calls = callsB,
                            DateCreated = now,
                            Period = period,
                            AIModelId = modelB.Id,
                            AIModel = modelB
                        },
                        new() {
                            Id = topId++,
                            TeamId = teamId,
                            Calls = callsC,
                            DateCreated = now,
                            Period = period,
                            AIModelId = modelC.Id,
                            AIModel = modelC
                        }
                    };

                    TopModels.AddRange(teamTopModels);

                    var usage = new Usage
                    {
                        Id = usageId++,
                        TeamId = teamId,
                        TotalCalls = callsA + callsB + callsC,
                        TokensConsumed = tokensA + tokensB + tokensC,
                        EstimatedCost = costA + costB + costC,
                        Period = period,
                        DateCreated = now,
                        TopModels = teamTopModels
                    };

                    UsageData.Add(usage);
                    weeklyUsages[teamId].Add(usage);
                }
            }

            string[] aggregatePeriods = ["last_7_days", "last_month", "last_3_months", "last_year"];
            int[] weekCounts = [1, 4, 12, 52];

            foreach (var teamId in teamIds)
            {
                var teamWeeks = weeklyUsages[teamId];

                for (int i = 0; i < aggregatePeriods.Length; i++)
                {
                    string period = aggregatePeriods[i];
                    int weeksToInclude = weekCounts[i];

                    var selectedWeeks = teamWeeks.TakeLast(weeksToInclude).ToList();

                    int totalCalls = selectedWeeks.Sum(week => week.TotalCalls);
                    int totalTokens = selectedWeeks.Sum(week => week.TokensConsumed);
                    double totalCost = selectedWeeks.Sum(week => week.EstimatedCost);

                    var aggregatedTopModels = selectedWeeks
                        .SelectMany(usage => usage.TopModels)
                        .GroupBy(topAIModel => topAIModel.AIModelId)
                        .Select(group => new TopAIModel
                        {
                            Id = topId++,
                            TeamId = teamId,
                            Calls = group.Sum(topAIModel => topAIModel.Calls),
                            DateCreated = now,
                            Period = period,
                            AIModelId = group.First().AIModelId,
                            AIModel = group.First().AIModel
                        })
                        .ToList();

                    TopModels.AddRange(aggregatedTopModels);

                    UsageData.Add(new Usage
                    {
                        Id = usageId++,
                        TeamId = teamId,
                        TotalCalls = totalCalls,
                        TokensConsumed = totalTokens,
                        EstimatedCost = totalCost,
                        Period = period,
                        DateCreated = now,
                        TopModels = aggregatedTopModels
                    });
                }
            }

            return new Tuple<IList<AIModel>, IList<AIModelCall>, IList<TopAIModel>, IList<Usage>>(
                Models, ModelCalls, TopModels, UsageData
            );
        }
    }
}