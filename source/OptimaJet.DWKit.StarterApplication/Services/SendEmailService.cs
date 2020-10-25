using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using I18Next.Net.Plugins;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Repositories;
using OptimaJet.DWKit.StarterApplication.Services.Workflow;

namespace OptimaJet.DWKit.StarterApplication.Services
{
    public class SendEmailService
    {
        public ITranslator Translator { get; }
        public IJobRepository<UserRole> UserRolesRepository { get; }
        public IJobRepository<Product, Guid> ProductRepository { get; }
        public IJobRepository<ProductBuild> ProductBuildRepository { get; }
        public IJobRepository<Email> EmailRepository { get; }
        public SendEmailService(
            ITranslator translator,
            IJobRepository<UserRole> userRolesRepository,
            IJobRepository<Product, Guid> productRepository,
            IJobRepository<ProductBuild> productBuildRepository,
            IJobRepository<Email> emailRepository
        )
        {
            Translator = translator;
            UserRolesRepository = userRolesRepository;
            ProductRepository = productRepository;
            ProductBuildRepository = productBuildRepository;
            EmailRepository = emailRepository;
        }
        public async Task SendNotificationEmailAsync(Notification notification)
        {
            var template = "Notification.txt";
            var buildEngineUrlText = "";
            var subsDict = notification.MessageSubstitutions as Dictionary<string, object>;
            var locale = notification.User.LocaleOrDefault();
            if (!string.IsNullOrEmpty(notification.LinkUrl))
            {
                template = "NotificationWithLink.txt";
                var linkUrlIndex = "notifications.body.log";
                buildEngineUrlText = await Translator.TranslateAsync(locale, "notifications", linkUrlIndex, subsDict);
            }
            dynamic contentModel = new System.Dynamic.ExpandoObject();
            contentModel.BuildEngineUrlText = buildEngineUrlText;
            contentModel.LinkUrl = notification.LinkUrl;
            await SendEmailAsync(notification.User.Email,
                                 locale,
                                 notification.MessageId,
                                 subsDict,
                                 contentModel,
                                 template);
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
                .Include(p => p.Project)
                    .ThenInclude(pr => pr.Owner)
                .Include(p => p.ProductBuilds)
                    .ThenInclude(pb => pb.ProductArtifacts)
                .FirstOrDefaultAsync();
            // Get the latest build (build with highest id number)
            var lastBuildRecord = product.ProductBuilds.OrderByDescending(pb => pb.Id).FirstOrDefault();
            if (lastBuildRecord != null)
            {
                // Create a list of names/urls for all artifacts for this build
                var links = BuildLinks(parmsDict, lastBuildRecord);
                await SendEmailToReviewersAsync(product, links, lastBuildRecord);
            }
        }
        protected async Task SendEmailToReviewersAsync(Product product, string links, ProductBuild productBuild)
        {
            var apkUrl = "";
            var apkArtifact = productBuild.ProductArtifacts.Find(a => a.ArtifactType == "apk");
            if (apkArtifact != null)
            {
                apkUrl = apkArtifact.Url;
            }
            var playListingUrl = "";
            var playListingArtifact = productBuild.ProductArtifacts.Find(a => a.ArtifactType == "play-listing");
            if (playListingArtifact != null)
            {
                playListingUrl = playListingArtifact.Url;
            }
            var subsDictionary = new Dictionary<string, object>
                    {
                        {"productName", product.ProductDefinition.Name},
                        {"projectName", product.Project.Name},
                        {"links", links},
                        {"ownerName", product.Project.Owner.Name},
                        {"ownerEmail", product.Project.Owner.Email},
                        {"apkUrl", apkUrl},
                        {"playListingUrl", playListingUrl}
                    };

            var reviewers = product.Project.Reviewers;
            if (reviewers != null)
            {
                foreach (var reviewer in reviewers)
                {
                    subsDictionary["reviewerName"] = reviewer.Name;
                    dynamic contentModel = new System.Dynamic.ExpandoObject();
                    contentModel.Links = links;
                    await SendEmailAsync(reviewer.Email,
                                         reviewer.LocaleOrDefault(),
                                         "reviewProduct",
                                         subsDictionary,
                                         contentModel,
                                         "ReviewProduct.txt");
                }
            }
        }
        public void SendRejectEmail(Guid productId, WorkflowProductService.ProductActivityChangedArgs args, String comment)
        {
            SendRejectEmailAsync(productId, args, comment).Wait();
        }
        protected async Task SendRejectEmailAsync(Guid productId, WorkflowProductService.ProductActivityChangedArgs args, String comment)
        {
            var product = await ProductRepository.Get()
                  .Where(p => p.Id == productId)
                  .Include(p => p.Project)
                        .ThenInclude(pr => pr.Type)
                  .Include(p => p.Project)
                        .ThenInclude(pr => pr.Organization)
                  .Include(p => p.Project)
                        .ThenInclude(pr => pr.Owner)
                  .Include(p => p.Store)
                  .Include(p => p.ProductDefinition)
                  .FirstOrDefaultAsync();
            if (product != null)
            {
                var messageParms = new Dictionary<string, object>()
                    {
                        { "projectName", product.Project.Name },
                        { "productName", product.ProductDefinition.Name},
                        { "previousState", args.PreviousState},
                        { "newState", args.CurrentState},
                        { "comment", comment}
                    };
                var sentEmailToOwner = false;
                var orgAdmins = UserRolesRepository.Get()
                    .Include(ur => ur.User)
                    .Include(ur => ur.Role)
                    .Where(ur => ur.OrganizationId == product.Project.Organization.Id && ur.Role.RoleName == RoleName.OrganizationAdmin)
                    .ToList();
                foreach (UserRole orgAdmin in orgAdmins)
                {
                    if (orgAdmin.UserId == product.Project.OwnerId)
                    {
                        sentEmailToOwner = true;
                    }
                    await SendRejectEmailToUserAsync(orgAdmin.User, messageParms);
                }
                if (!sentEmailToOwner)
                {
                    await SendRejectEmailToUserAsync(product.Project.Owner, messageParms);
                }
            }
        }
        protected async Task SendRejectEmailToUserAsync(User user, Dictionary<string, object> subsDictionary)
        {
            var locale = user.LocaleOrDefault();
            dynamic contentModel = new System.Dynamic.ExpandoObject();
            await SendEmailAsync(user.Email, locale, "rejectionEmail", subsDictionary, contentModel, "Notification.txt");
        }
        protected async Task SendEmailAsync(string emailAddress, string locale, string messageId, Dictionary<string, object> subsDictionary, dynamic contentModel, string template)
        {
            var fullBodyId = "notifications.body." + messageId;
            var fullSubjectId = "notifications.subject." + messageId;
            var subject = await Translator.TranslateAsync(locale, "notifications", fullSubjectId, subsDictionary);
            subject = HttpUtility.HtmlDecode(subject);
            var body = await Translator.TranslateAsync(locale, "notifications", fullBodyId, subsDictionary);
            contentModel.Message = body;

            var email = new Email
            {
                To = emailAddress,
                Subject = subject,
                ContentTemplate = template,
                ContentModel = contentModel
            };
            var result = await EmailRepository.CreateAsync(email);

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
