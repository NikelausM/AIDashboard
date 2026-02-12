namespace AIBackendAPI.Data.Models
{
    /**
    * A view table summarizing the top models called by a particular team
    */
    public class TopAIModel
    {
        public long Id { get; set; }
        public long TeamId { get; set; }
        public int Calls { get; set; }
        public DateTime DateCreated { get; set; }
        public required string Period { get; set; }
        public long AIModelId { get; set; }
        public required AIModel AIModel { get; set; } = null!;
    }
}