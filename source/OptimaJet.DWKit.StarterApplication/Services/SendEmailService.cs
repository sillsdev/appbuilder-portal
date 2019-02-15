using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using I18Next.Net.Plugins;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class SendEmailService
    {
        public ITranslator Translator { get; }
        public IJobRepository<Product, Guid> ProductRepository { get; }
        public IJobRepository<ProductBuild> ProductBuildRepository { get; }
        public IJobRepository<Email> EmailRepository { get; }
        public SendEmailService(
            ITranslator translator,
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<ProductBuild> productBuildRepository,
            IJobRepository<Email> emailRepository
        )
        {
            Translator = translator;
            ProductRepository = productRepository;
            ProductBuildRepository = productBuildRepository;
            EmailRepository = emailRepository;
        }
        public async Task SendNotificationEmailAsync(Notification notification)
        {
            var template = "Notification.txt";
            var buildEngineUrlText = "";
            var locale = notification.User.LocaleOrDefault();
            var fullBodyId = "notifications.body." + notification.MessageId;
            var fullSubjectId = "notifications.subject." + notification.MessageId;
            var subsDict = notification.MessageSubstitutions as Dictionary<string, object>;
            var subject = await Translator.TranslateAsync(locale, "notifications", fullSubjectId, subsDict);
            var body = await Translator.TranslateAsync(locale, "notifications", fullBodyId, subsDict);
            if (!string.IsNullOrEmpty(notification.LinkUrl))
            {
                template = "NotificationWithLink.txt";
                var buildEngineUrlIndex = "notifications.body.buildEngineUrl";
                buildEngineUrlText = await Translator.TranslateAsync(locale, "notifications", buildEngineUrlIndex, subsDict);
            }
            var email = new Email
            {
                To = notification.User.Email,
                Subject = subject,
                ContentTemplate = template,
                ContentModel = new
                {
                    Message = body,
                    BuildEngineUrlText = buildEngineUrlText,
                    LinkUrl = notification.LinkUrl
                }
            };
            var result = await EmailRepository.CreateAsync(email);
        }
        public void SendProductReviewEmail(Guid productId, Dictionary<string, object> parmsDictionary)
        {
            SendProductReviewEmailAsync(productId, parmsDictionary).Wait();
        }
        protected async Task SendProductReviewEmailAsync(Guid productId, Dictionary<string, object> parmsDict)
        {
            var product = await ProductRepository.Get()
                .Where(p => p.Id == productId)
                .Include(p => p.ProductDefinition)
                .Include(p => p.Project)
                    .ThenInclude(pr => pr.Reviewers)
                .Include(p => p.ProductBuilds)
                    .ThenInclude(pb => pb.ProductArtifacts)
                .FirstOrDefaultAsync();
            // Get the latest build (build with highest id number)
            var lastBuildRecord = product.ProductBuilds.OrderByDescending(pb => pb.Id).FirstOrDefault();
            if (lastBuildRecord != null)
            {
                // Create a list of names/urls for all artifacts for this build
                var links = BuildLinks(parmsDict, lastBuildRecord);
                await SendEmailsAsync(product, links);
            }
        }
        protected async Task SendEmailsAsync(Product product, string links)
        {
            var subsDictionary = new Dictionary<string, object>
                    {
                        {"productName", product.ProductDefinition.Name},
                        {"projectName", product.Project.Name}
                    };
            var reviewers = product.Project.Reviewers;
            if (reviewers != null)
            {
                foreach (var reviewer in reviewers)
                {
                    var locale = reviewer.LocaleOrDefault();
                    var subject = await Translator.TranslateAsync(locale, "notifications", "notifications.subject.reviewProduct", subsDictionary);
                    var body = await Translator.TranslateAsync(locale, "notifications", "notifications.body.reviewProduct", subsDictionary);
                    var email = new Email
                    {
                        To = reviewer.Email,
                        Subject = subject,
                        ContentTemplate = "ReviewProduct.txt",
                        ContentModel = new
                        {
                            Message = body,
                            Links = links
                        }
                    };
                    var result = await EmailRepository.CreateAsync(email);
                }
            }

        }
        protected string BuildLinks(Dictionary<string, object> paramsDictionary, ProductBuild build)
        {
            var links = "";
            var artifactNamesListJ = paramsDictionary["types"] as JArray;
            var artifactNamesList = artifactNamesListJ.ToObject<List<string>>();
            foreach (var artifactName in artifactNamesList)
            {
                var artifact = build.ProductArtifacts.Find(a => a.ArtifactType == artifactName);
                if (artifact != null)
                {
                    links = links + "<p><a href = " + artifact.Url + ">" + artifactName + "</a></p>";
                }
            }
            return links;
        }
    }
}
