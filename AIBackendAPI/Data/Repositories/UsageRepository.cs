using AIBackendAPI.Common.Constants;
using AIBackendAPI.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace AIBackendAPI.Data.Repositories
{
    public class UsageRepository(UsageContext context)
    {
        private readonly UsageContext _context = context;

        public async Task<IEnumerable<Usage>> GetUsagesAsync(string period)
        {
            var query = _context.Usages
                .Where(usage => period == PeriodConstants.All || usage.Period == period)
                .Include(usage => usage.TopModels)
                .ThenInclude(topModel => topModel.AIModel);

            IEnumerable<Usage> results = await query.ToListAsync();

            return results;
        }
    }
}