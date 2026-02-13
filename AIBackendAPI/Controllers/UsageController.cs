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

        // GET: api/usage/5
        // auto validates teamId to ensure it is of type long (i.e., not a string or otherwise)
        [HttpGet("{teamId}")]
        public async Task<ActionResult<IEnumerable<UsageDto>>> GetUsage(long teamId)
        {
            // if (!PeriodConstants.AllConstants.Contains(period))
            // {
            //     return BadRequest("period is required. Valid periods include: " + string.Join(",", PeriodConstants.AllConstants));
            // }
            var usages = await _usageService.GetUsageAsync(teamId);
            var usageDtos = usages.Select(_usageService.CreateUsageDto).ToList();
            return usageDtos;
        }
    }
}
