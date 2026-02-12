using AIBackendAPI.Common;
using AIBackendAPI.Data;
using AIBackendAPI.Data.Models;
using AIBackendAPI.Data.Repositories;
using AIBackendAPI.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContext<UsageContext>(opt => opt.UseInMemoryDatabase("Usages"));
builder.Services.AddScoped<UsageRepository>();
builder.Services.AddScoped<UsageService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUi(options =>
    {
        options.DocumentPath = "/openapi/v1.json";
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseCors("AllowFrontend");

app.MapControllers();


// seed manually in Program.cs due to issues with seeding when using OnConfiguring with an in memory DB
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<UsageContext>();

    bool doResultsExist = context.Usages.Any();

    if (!doResultsExist)
    {
        var (models, modelCalls, topModels, usages) = Utils.GetTestData();

        context.Set<AIModel>().AddRange(models);
        context.Set<AIModelCall>().AddRange(modelCalls);
        context.Set<TopAIModel>().AddRange(topModels);
        context.Set<Usage>().AddRange(usages);
        context.SaveChanges();

        int aIModelsCount = context.AIModels.Count();   // triggers context creation + seeding
    }
}


app.Run();