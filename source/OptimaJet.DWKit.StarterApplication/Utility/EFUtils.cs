using Microsoft.EntityFrameworkCore;

namespace OptimaJet.DWKit.StarterApplication.Utility
{
  public static class EFUtils
  {
    public static bool Like(string value, string search) 
    {
        return EF.Functions.Like(value, $"%{search}%");
    }
  }
}
