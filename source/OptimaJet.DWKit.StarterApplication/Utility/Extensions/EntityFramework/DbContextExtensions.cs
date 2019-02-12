using System;
using Microsoft.EntityFrameworkCore;

namespace OptimaJet.DWKit.StarterApplication.Utility.Extensions.EntityFramework
{
    public static class DbContextExtensions
    {
        public static string GetTableName(this DbContext dbContext, Type type)
        {
            return dbContext.Model.FindEntityType(type).Relational().TableName;
        }
    }
}
