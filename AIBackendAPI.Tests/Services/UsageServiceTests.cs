using Xunit;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using AIBackendAPI.Services;
using AIBackendAPI.Models;
using AIBackendAPI.Repositories;

namespace AIBackendAPI.Tests
{
    public class UsageServiceTests
    {
        private readonly Mock<UsageRepository> _repoMock;
        private readonly UsageService _service;

        public UsageServiceTests()
        {
            _repoMock = new Mock<UsageRepository>();
            _service = new UsageService(_repoMock.Object);
        }

        [Fact]
        public async Task GetUsagesAsync_ReturnsRepositoryData()
        {
            // Arrange
            var expected = new List<Usage>
        {
            new Usage
            {
                Id = 1,
                TeamId = 101,
                TotalCalls = 10,
                TokensConsumed = 5000,
                EstimatedCost = 1.23,
                Period = "last_7_days",
                DateCreated = DateTime.UtcNow,
                TopModels = new List<TopAIModel>()
            }
        };

            _repoMock
                .Setup(r => r.GetUsagesAsync("last_7_days"))
                .ReturnsAsync(expected);

            // Act
            var result = await _service.GetUsagesAsync("last_7_days");

            // Assert
            Assert.Equal(expected, result);
            _repoMock.Verify(r => r.GetUsagesAsync("last_7_days"), Times.Once);
        }

        [Fact]
        public void CreateTopAIModelDto_MapsCorrectly()
        {
            // Arrange
            var model = new TopAIModel
            {
                Id = 1,
                TeamId = 101,
                Calls = 7,
                Period = "last_7_days",
                DateCreated = DateTime.UtcNow,
                AIModelId = 1,
                AIModel = new AIModel { Id = 1, Name = "gpt-4", CostPerToken = 0.00002 }
            };

            // Act
            var dto = _service.CreateTopAIModelDto(model);

            // Assert
            Assert.Equal("gpt-4", dto.Name);
            Assert.Equal(7, dto.Calls);
        }

        [Fact]
        public void CreateUsageDto_MapsCorrectly()
        {
            // Arrange
            var usage = new Usage
            {
                Id = 1,
                TeamId = 101,
                TotalCalls = 20,
                TokensConsumed = 10000,
                EstimatedCost = 2.50,
                Period = "last_month",
                DateCreated = DateTime.UtcNow,
                TopModels = new List<TopAIModel>
            {
                new TopAIModel
                {
                    Id = 1,
                    TeamId = 101,
                    Calls = 5,
                    Period = "last_month",
                    DateCreated = DateTime.UtcNow,
                    AIModelId = 1,
                    AIModel = new AIModel { Id = 1, Name = "gpt-4", CostPerToken = 0.00002 }
                }
            }
            };

            // Act
            var dto = _service.CreateUsageDto(usage);

            // Assert
            Assert.Equal(101, dto.TeamId);
            Assert.Equal(20, dto.TotalCalls);
            Assert.Equal(10000, dto.TokensConsumed);
            Assert.Equal(2.50, dto.EstimatedCost);
            Assert.Equal("last_month", dto.Period);

            Assert.Single(dto.TopModels);
            Assert.Equal("gpt-4", dto.TopModels.First().Name);
            Assert.Equal(5, dto.TopModels.First().Calls);
        }
    }
}