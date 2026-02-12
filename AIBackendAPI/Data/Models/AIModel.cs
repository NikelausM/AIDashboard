namespace AIBackendAPI.Data.Models
{
    public class AIModel
    {
        public long Id { get; set; }
        public required string Name { get; set; }
        public double CostPerToken { get; set; }
    }
}