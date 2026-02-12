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
            new Usage { TeamId = teamId, TotalCalls = 10 }
        };

        var repoMock = new Mock<UsageRepository>();
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