using System.Collections.Generic;
using System.Threading.Tasks;
using AIBackendAPI.Data.Models;
using AIBackendAPI.Data.Repositories;
using AIBackendAPI.Services;
using Moq;
using Xunit;

public class UsageServiceTests
{
    [Fact]
    public async Task GetUsageAsync_ReturnsRepositoryResult()
    {
        // Arrange
        long teamId = 123;

        var expectedUsage = new List<Usage>
        {
            new ()
            {
                Id = 1,
                TeamId = 101,
                TotalCalls = 100,
                TokensConsumed = 1000,
                EstimatedCost = 0.00089,
                Period = "last_7_days",
                DateCreated = DateTime.Now,
                TopModels = []
            }
        };

        var repoMock = new Mock<IUsageRepository>();
        repoMock
            .Setup(r => r.GetUsageAsync(teamId))
            .ReturnsAsync(expectedUsage);

        var service = new UsageService(repoMock.Object);

        // Act
        var result = await service.GetUsageAsync(teamId);

        // Assert
        Assert.Equal(expectedUsage, result);
        repoMock.Verify(r => r.GetUsageAsync(teamId), Times.Once);
    }
}