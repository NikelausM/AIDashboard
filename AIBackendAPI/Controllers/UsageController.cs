using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using AIBackendAPI.Data.Models;
using AIBackendAPI.Services;
using AIBackendAPI.Data.Dto;
using AIBackendAPI.Common.Constants;

namespace AIBackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsageController(UsageService usageService) : ControllerBase
    {
        private readonly UsageService _usageService = usageService;

        // GET: api/Usage
        // if period not provided, then built in request validation returns 400 bad request
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsageDto>>> GetUsages(string period)
        {
            if (!PeriodConstants.AllConstants.Contains(period))
            {
                return BadRequest("period is required. Valid periods include: " + string.Join(",", PeriodConstants.AllConstants));
            }
            var usages = await _usageService.GetUsagesAsync(period);
            var usageDtos = usages.Select(_usageService.CreateUsageDto).ToList();
            return usageDtos;
        }

        // // GET: api/Usage/5
        // [HttpGet("{id}")]
        // public async Task<ActionResult<Usage>> GetUsage(long id)
        // {
        //     var usage = await _context.Usages.FindAsync(id);

        //     if (usage == null)
        //     {
        //         return NotFound();
        //     }

        //     return usage;
        // }

        // // PUT: api/Usage/5
        // // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        // [HttpPut("{id}")]
        // public async Task<IActionResult> PutUsage(long id, Usage usage)
        // {
        //     if (id != usage.TeamId)
        //     {
        //         return BadRequest();
        //     }

        //     _context.Entry(usage).State = EntityState.Modified;

        //     try
        //     {
        //         await _context.SaveChangesAsync();
        //     }
        //     catch (DbUpdateConcurrencyException)
        //     {
        //         if (!UsageExists(id))
        //         {
        //             return NotFound();
        //         }
        //         else
        //         {
        //             throw;
        //         }
        //     }

        //     return NoContent();
        // }

        // // POST: api/Usage
        // // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        // [HttpPost]
        // public async Task<ActionResult<Usage>> PostUsage(Usage usage)
        // {
        //     _context.Usages.Add(usage);
        //     await _context.SaveChangesAsync();

        //     return CreatedAtAction("GetUsage", new { id = usage.TeamId }, usage);
        // }

        // // DELETE: api/Usage/5
        // [HttpDelete("{id}")]
        // public async Task<IActionResult> DeleteUsage(long id)
        // {
        //     var usage = await _context.Usages.FindAsync(id);
        //     if (usage == null)
        //     {
        //         return NotFound();
        //     }

        //     _context.Usages.Remove(usage);
        //     await _context.SaveChangesAsync();

        //     return NoContent();
        // }

        // private bool UsageExists(long id)
        // {
        //     return _context.Usages.Any(e => e.TeamId == id);
        // }
    }
}
