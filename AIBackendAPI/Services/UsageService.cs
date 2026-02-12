using AIBackendAPI.Data.Dto;
using AIBackendAPI.Data.Models;
using AIBackendAPI.Data.Repositories;

namespace AIBackendAPI.Services
{
    public class UsageService(IUsageRepository usageRepository)
    {
        private readonly IUsageRepository _usageRepository = usageRepository;

        public async Task<IEnumerable<Usage>> GetUsageAsync(long teamId)
        {
            return await _usageRepository.GetUsageAsync(teamId);
        }

        public TopAIModelDto CreateTopAIModelDto(TopAIModel topAIModel)
        {
            TopAIModelDto topAIModelDto = new()
            {
                Name = topAIModel.AIModel.Name,
                Calls = topAIModel.Calls
            };
            return topAIModelDto;
        }

        public UsageDto CreateUsageDto(Usage usage)
        {
            UsageDto usageDto = new()
            {
                TeamId = usage.TeamId,
                TotalCalls = usage.TotalCalls,
                TokensConsumed = usage.TokensConsumed,
                EstimatedCost = usage.EstimatedCost,
                TopModels = [.. usage.TopModels.Select(CreateTopAIModelDto)],
                Period = usage.Period
            };

            return usageDto;
        }
    }
}