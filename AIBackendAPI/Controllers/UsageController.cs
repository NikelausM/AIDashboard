using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using AIBackendAPI.Services;
using AIBackendAPI.Data.Dto;

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
            var usages = await _usageService.GetUsageAsync(teamId);
            var usageDtos = usages.Select(_usageService.CreateUsageDto).ToList();
            return usageDtos;
        }
    }
}
