namespace OrionTemplate.Api.Models;

public sealed record OrionTemplateDto(string Id, DateOnly ReferenceDate, decimal Value, string Status);
