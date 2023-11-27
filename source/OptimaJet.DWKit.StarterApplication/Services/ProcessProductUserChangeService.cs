using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bugsnag;
using Hangfire;
using I18Next.Net.Plugins;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services.BuildEngine;
using OptimaJet.DWKit.StarterApplication.Services.Contracts;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;
using OptimaJet.DWKit.StarterApplication.Utility;
using Serilog;


namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class ProcessProductUserChangeService : IProcessProductUserChangeService
    {
        public IJobRepository<ProductUserChange> ProductUserChangeRepository { get; }
        public IClient BugsnagClient { get; }

        public ProcessProductUserChangeService(
            IJobRepository<ProductUserChange> productUserChangeRepository,
            IClient bugsnagClient
            )
        {
            ProductUserChangeRepository = productUserChangeRepository;
            BugsnagClient = bugsnagClient;
        }


        public void Process(ProcessProductUserChangeData data)
        {
            ProcessProductUserChange(data.Id).Wait();
        }

        public async Task ProcessProductUserChange(int Id)
        {
            var productUserChange = await ProductUserChangeRepository.Get()
                .Where(puc => puc.Id == Id)
                .FirstOrDefaultAsync();
            if (productUserChange == null)
            {
                // Creating an Exception to report to BugSnag.  Don't want to Retry.
                var ex = new Exception($"ProductUserChange id={Id}: not found");
                Log.Error(ex, "ProductUserchange: id not found");
                BugsnagClient.Notify(ex);
                return;
            }

            //TODO: Start workflow
        }
    }
}

