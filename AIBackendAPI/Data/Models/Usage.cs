using System.ComponentModel.DataAnnotations;

namespace AIBackendAPI.Data.Models
{
    public class Usage
    {
        public long Id { get; set; }
        public long TeamId { get; set; }
        public int TotalCalls { get; set; }
        public int TokensConsumed { get; set; }
        public double EstimatedCost { get; set; }
        public required string Period { get; set; }
        public DateTime DateCreated { get; set; }
        public required ICollection<TopAIModel> TopModels { get; set; } = [];
    }
}