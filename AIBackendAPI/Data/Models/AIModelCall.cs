namespace AIBackendAPI.Data.Models
{
    public class AIModelCall
    {
        public long Id { get; set; }
        public DateTime DateCreated { get; set; }
        public int TokensConsumed { get; set; }
        public double Cost { get; set; }
        public long AIModelId { get; set; }
        public required AIModel AIModel { get; set; } = null!;
    }
}