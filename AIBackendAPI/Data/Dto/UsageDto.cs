using System.ComponentModel.DataAnnotations;

namespace AIBackendAPI.Data.Dto
{
    public class UsageDto
    {
        public long TeamId { get; set; }
        public int TotalCalls { get; set; }
        public int TokensConsumed { get; set; }
        public double EstimatedCost { get; set; }
        public required string Period { get; set; }
        public required ICollection<TopAIModelDto> TopModels { get; set; } = [];
    }
}