import { PrismaClient } from '@prisma/client';
import { Command, Option } from 'commander';

const ProductType = {
  Android_GooglePlay: 0,
  Android_S3: 1,
  AssetPackage: 2,
  Web: 3
};

const WorkflowOptions = {
  /** Require an OrgAdmin to access the GooglePlay Developer Console */
  AdminStoreAccess: 1,
  /** Require approval from an OrgAdmin before product can be created */
  ApprovalProcess: 2
};

const program = new Command();
program
  .addOption(new Option('-v, --verbose [level]', 'verbose logging').argParser(parseInt).default(0))
  .addOption(new Option('-o, --organizations', 'include default organizations'));
program.parse(process.argv);
const options = program.opts();
if (options.verbose) console.log(options);

const prisma = new PrismaClient();
async function main() {
  type Role = [number, number];
  const roles: Role[] = [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4]
  ];
  for (const [Id, RoleName] of roles) {
    await prisma.roles.upsert({ where: { Id }, update: {}, create: { Id, RoleName } });
  }

  type ApplicationType = [number, string, string];
  const applicationTypes: ApplicationType[] = [
    [1, 'scriptureappbuilder', 'Scripture App Builder'],
    [2, 'readingappbuilder', 'Reading App Builder'],
    [3, 'dictionaryappbuilder', 'Dictionary App Builder'],
    [4, 'keyboardappbuilder', 'Keyboard App Builder']
  ];
  for (const [Id, Name, Description] of applicationTypes) {
    await prisma.applicationTypes.upsert({
      where: { Id },
      update: {},
      create: { Id, Name, Description }
    });
  }

  type StoreType = [number, string, string];
  const storeTypes: StoreType[] = [
    [1, 'google_play_store', 'Google Play Store'],
    [2, 's3_bucket', 'Amazon S3 Bucket'],
    [3, 'cloud', 'Cloud Provider']
  ];
  for (const [Id, Name, Description] of storeTypes) {
    await prisma.storeTypes.upsert({
      where: { Id },
      update: {},
      create: { Id, Name, Description }
    });
  }

  type StoreLanguage = [number, string, string, number];
  const storeLanguages: StoreLanguage[] = [
    [1, 'af', 'Afrikaans – af', 1],
    [2, 'am', 'Amharic – am', 1],
    [3, 'ar', 'Arabic – ar', 1],
    [4, 'hy-AM', 'Armenian – hy-AM', 1],
    [5, 'az-AZ', 'Azerbaijani – az-AZ', 1],
    [6, 'eu-ES', 'Basque – eu-ES', 1],
    [7, 'be', 'Belarusian – be', 1],
    [8, 'bn-BD', 'Bengali – bn-BD', 1],
    [9, 'bg', 'Bulgarian – bg', 1],
    [10, 'my-MM', 'Burmese – my-MM', 1],
    [11, 'ca', 'Catalan – ca', 1],
    [12, 'zh-CN', 'Chinese (Simplified) – zh-CN', 1],
    [13, 'zh-TW', 'Chinese (Traditional) – zh-TW', 1],
    [14, 'hr', 'Croatian – hr', 1],
    [15, 'cs-CZ', 'Czech – cs-CZ', 1],
    [16, 'da-DK', 'Danish – da-DK', 1],
    [17, 'nl-NL', 'Dutch – nl-NL', 1],
    [18, 'en-AU', 'English – en-AU', 1],
    [19, 'en-GB', 'English (United Kingdom) – en-GB', 1],
    [20, 'en-US', 'English (United States) – en-US', 1],
    [21, 'et', 'Estonian – et', 1],
    [22, 'fil', 'Filipino – fil', 1],
    [23, 'fi-FI', 'Finnish – fi-FI', 1],
    [24, 'fr-FR', 'French – fr-FR', 1],
    [25, 'fr-CA', 'French (Canada) – fr-CA', 1],
    [26, 'gl-ES', 'Galician – gl-ES', 1],
    [27, 'ka-GE', 'Georgian – ka-GE', 1],
    [28, 'de-DE', 'German – de-DE', 1],
    [29, 'el-GR', 'Greek – el-GR', 1],
    [30, 'iw-IL', 'Hebrew – iw-IL', 1],
    [31, 'hi-IN', 'Hindi – hi-IN', 1],
    [32, 'hu-HU', 'Hungarian – hu-HU', 1],
    [33, 'is-IS', 'Icelandic – is-IS', 1],
    [34, 'id', 'Indonesian – id', 1],
    [35, 'it-IT', 'Italian – it-IT', 1],
    [36, 'ja-JP', 'Japanese – ja-JP', 1],
    [37, 'kn-IN', 'Kannada – kn-IN', 1],
    [38, 'km-KH', 'Khmer – km-KH', 1],
    [39, 'ko-KR', 'Korean (South Korea) – ko-KR', 1],
    [40, 'ky-KG', 'Kyrgyz – ky-KG', 1],
    [41, 'lo-LA', 'Lao – lo-LA', 1],
    [42, 'lv', 'Latvian – lv', 1],
    [43, 'lt', 'Lithuanian – lt', 1],
    [44, 'mk-MK', 'Macedonian – mk-MK', 1],
    [45, 'ms', 'Malay – ms', 1],
    [46, 'ml-IN', 'Malayalam – ml-IN', 1],
    [47, 'mr-IN', 'Marathi – mr-IN', 1],
    [48, 'mn-MN', 'Mongolian – mn-MN', 1],
    [49, 'ne-NP', 'Nepali – ne-NP', 1],
    [50, 'no-NO', 'Norwegian – no-NO', 1],
    [51, 'fa', 'Persian – fa', 1],
    [52, 'pl-PL', 'Polish – pl-PL', 1],
    [53, 'pt-BR', 'Portuguese (Brazil) – pt-BR', 1],
    [54, 'pt-PT', 'Portuguese (Portugal) – pt-PT', 1],
    [55, 'ro', 'Romanian – ro', 1],
    [56, 'rm', 'Romansh – rm', 1],
    [57, 'ru-RU', 'Russian – ru-RU', 1],
    [58, 'sr', 'Serbian – sr', 1],
    [59, 'si-LK', 'Sinhala – si-LK', 1],
    [60, 'sk', 'Slovak – sk', 1],
    [61, 'sl', 'Slovenian – sl', 1],
    [62, 'es-419', 'Spanish (Latin America) – es-419', 1],
    [63, 'es-ES', 'Spanish (Spain) – es-ES', 1],
    [64, 'es-US', 'Spanish (United States) – es-US', 1],
    [65, 'sw', 'Swahili – sw', 1],
    [66, 'sv-SE', 'Swedish – sv-SE', 1],
    [67, 'ta-IN', 'Tamil – ta-IN', 1],
    [68, 'te-IN', 'Telugu – te-IN', 1],
    [69, 'th', 'Thai – th', 1],
    [70, 'tr-TR', 'Turkish – tr-TR', 1],
    [71, 'uk', 'Ukrainian – uk', 1],
    [72, 'vi', 'Vietnamese – vi', 1],
    [73, 'zu', 'Zulu – zu', 1]
  ];
  for (const [Id, Name, Description, StoreTypeId] of storeLanguages) {
    await prisma.storeLanguages.upsert({
      where: { Id },
      update: {},
      create: { Id, Name, Description, StoreTypeId }
    });
  }

  // WorkflowDefnitions
  const workflowDefinitionData = [
    {
      Name: 'sil_android_google_play',
      Type: 1,
      Enabled: true,
      Description: 'SIL Default Workflow for Publishing to Google Play',
      StoreTypeId: 1,
      WorkflowOptions: [WorkflowOptions.AdminStoreAccess, WorkflowOptions.ApprovalProcess]
    },
    {
      Name: 'sil_android_google_play_rebuild',
      Type: 2,
      Enabled: true,
      Description: 'SIL Default Workflow for Rebuilding to Google Play',
      StoreTypeId: 1
    },
    {
      Name: 'sil_android_google_play_republish',
      Type: 3,
      Enabled: true,
      Description: 'SIL Default Workflow for Republishing to Google Play',
      StoreTypeId: 1
    },
    {
      Name: 'sil_android_s3',
      Type: 1,
      Enabled: true,
      Description: 'SIL Default Workflow for Publishing to Amazon S3 Bucket',
      StoreTypeId: 2,
      ProductType: ProductType.Android_S3,
      WorkflowOptions: [WorkflowOptions.ApprovalProcess]
    },
    {
      Name: 'sil_android_s3_rebuild',
      Type: 2,
      Enabled: true,
      Description: 'SIL Default Workflow for Rebuilding to Amazon S3 Bucket',
      StoreTypeId: 2,
      ProductType: ProductType.Android_S3
    },
    {
      Name: 'la_android_google_play',
      Type: 1,
      Enabled: true,
      Description: 'Low Admin Workflow for Publishing to Google Play',
      StoreTypeId: 1,
      WorkflowOptions: [WorkflowOptions.AdminStoreAccess]
    },
    {
      Name: 'oa_android_google_play',
      Type: 1,
      Enabled: true,
      Description: 'Owner Admin Workflow for Publishing to Google Play',
      StoreTypeId: 1
    },
    {
      Name: 'na_android_s3',
      Type: 1,
      Enabled: true,
      Description: 'No Admin Workflow for Publishing to S3',
      StoreTypeId: 2,
      ProductType: ProductType.Android_S3
    },
    {
      Name: 'pwa_cloud',
      Type: 1,
      Enabled: true,
      Description: 'SIL Default Workflow for Publishing PWA to Cloud',
      StoreTypeId: 3,
      Properties: '{ "build:targets" : "pwa" }',
      ProductType: ProductType.Web
    },
    {
      Name: 'pwa_cloud_rebuild',
      Type: 2,
      Enabled: true,
      Description: 'SIL Default Workflow for Rebuilding PWA to Cloud',
      StoreTypeId: 3,
      Properties: '{ "build:targets" : "pwa" }',
      ProductType: ProductType.Web
    },
    {
      Name: 'html_cloud',
      Type: 1,
      Enabled: true,
      Description: 'SIL Default Workflow for Publishing HTML to Cloud',
      StoreTypeId: 3,
      ProductType: ProductType.Web
    },
    {
      Name: 'html_cloud_rebuild',
      Type: 2,
      Enabled: true,
      Description: 'SIL Default Workflow for Rebuilding HTML to Cloud',
      StoreTypeId: 3,
      ProductType: ProductType.Web
    },
    {
      Name: 'asset_package',
      Type: 1,
      Enabled: true,
      Description: 'SIL Default Workflow for Publishing Asset Packages',
      StoreTypeId: 2,
      ProductType: ProductType.AssetPackage
    },
    {
      Name: 'asset_package_rebuild',
      Type: 2,
      Enabled: true,
      Description: 'SIL Default Workflow for Rebuilding Asset Packages',
      StoreTypeId: 2,
      ProductType: ProductType.AssetPackage
    }
  ];

  await prisma.workflowDefinitions.createMany({
    data: workflowDefinitionData
  });

  const productDefinitionData = [
    {
      Name: 'Android App to Google Play',
      TypeId: 1,
      Description:
        'Build an Android App from a Scripture App Builder project and publish to a Google Play Store. The Organization Admin has to approve of the project and review the store preview. The Organization Admin has access to Google Play Console.',
      WorkflowId: 1,
      RebuildWorkflowId: 2,
      RepublishWorkflowId: 3
    },
    {
      Name: 'Android App to Amazon S3 Bucket',
      TypeId: 1,
      Description:
        'Build an Android App from a Scripture App Builder project and publish to an Amazon S3 Bucket',
      WorkflowId: 4,
      RebuildWorkflowId: 5
    },
    {
      Name: 'Android App to Google Play (Low Admin)',
      TypeId: 1,
      Description:
        'Build an Android App from a Scripture App Builder project and publish to a Google Play Store, but with less approval and oversight required. The Organization Admin has access to Google Play Console.',
      WorkflowId: 6,
      RebuildWorkflowId: 2,
      RepublishWorkflowId: 3
    },
    {
      Name: 'Android App to Amazon S3 Bucket (No Admin)',
      TypeId: 1,
      Description:
        'Build an Android App from a Scripture App Builder project and publish to an Amazon S3 Bucket, but with no admin required.',
      WorkflowId: 8,
      RebuildWorkflowId: 5
    },
    {
      Name: 'Android App to Google Play (Owner Admin)',
      TypeId: 1,
      Description:
        'Build an Android App from a Scripture App Builder project and publish to a Google Play Store, but with no approval and oversight required. The owner of the project has access to Google Play Console.',
      WorkflowId: 7,
      RebuildWorkflowId: 2,
      RepublishWorkflowId: 3
    }
  ];

  await prisma.productDefinitions.createMany({
    data: productDefinitionData
  });

  if (options.organizations) {
    const usersData = [
      {
        Name: 'Chris Hubbard',
        Email: 'chris_hubbard@sil.org',
        ExternalId: 'google-oauth2|116747902156680384840',
        FamilyName: 'Hubbard',
        GivenName: 'Chris',
        IsLocked: false
      },
      {
        Name: 'David Moore',
        Email: 'david_moore1@sil.org',
        ExternalId: 'google-oauth2|114981819181509824425',
        FamilyName: 'Moore',
        GivenName: 'David',
        IsLocked: false
      },
      {
        Name: 'Bill Dyck',
        Email: 'bill_dyck@sil.org',
        ExternalId: 'google-oauth2|102643649500459434996',
        FamilyName: 'Dyck',
        GivenName: 'Bill',
        IsLocked: false
      },
      {
        Name: 'Loren Hawthorne',
        Email: 'loren_hawthorne@sil.org',
        ExternalId: 'google-oauth2|116603781884964961816',
        FamilyName: 'Hawthorne',
        GivenName: 'Loren',
        IsLocked: false
      },
      {
        Name: 'Chris Hubbard (Kalaam)',
        Email: 'chris.kalaam@gmail.com',
        ExternalId: 'auth0|5b578f6197af652b19f9bb41',
        FamilyName: 'Hubbard',
        GivenName: 'Chris',
        IsLocked: false
      },
      {
        Name: 'Scriptoria CI',
        Email: 'ci@scriptoria.io',
        ExternalId: 'auth0|687519a365a66ae37f53f27a',
        FamilyName: 'CI',
        GivenName: 'Scriptoria',
        IsLocked: false
      },
      {
        Name: 'Micah Henney',
        Email: '7dev7urandom@gmail.com',
        ExternalId: 'google-oauth2|102633638937992588080',
        FamilyName: 'Henney',
        GivenName: 'Micah',
        IsLocked: false
      },
      {
        Name: 'Aidan Jones',
        Email: 'aejones4gm@gmail.com',
        ExternalId: 'google-oauth2|108677489047994521292',
        FamilyName: 'Jones',
        GivenName: 'Aidan',
        IsLocked: false
      }
    ];

    await prisma.users.createMany({
      data: usersData
    });

    const organizationsData = [
      {
        Name: 'SIL International',
        WebsiteUrl: 'https://sil.org',
        BuildEngineUrl: 'https://replace.scriptoria.io:8443',
        BuildEngineApiAccessToken: 'replace',
        LogoUrl: 'https://sil-prd-scriptoria-resources.s3.amazonaws.com/sil/sil_logo.png',
        ContactEmail: 'chris_hubbard@sil.org'
      },
      {
        Name: 'Kalaam Media',
        WebsiteUrl: 'https://kalaam.org',
        BuildEngineUrl: 'https://replace.scriptoria.io:8443',
        BuildEngineApiAccessToken: 'replace',
        LogoUrl:
          'https://s3.amazonaws.com/sil-prd-scriptoria-resources/ips/wildfire_flame_logo.png',
        ContactEmail: 'chris.kalaam@gmail.com'
      },
      {
        Name: 'Faith Comes By Hearing',
        WebsiteUrl: 'https://fcbh.org',
        BuildEngineUrl: 'https://replace.scriptoria.io:8443',
        BuildEngineApiAccessToken: 'replace',
        LogoUrl:
          'https://play-lh.googleusercontent.com/yXm_WKG7_DJxL3IPYFul6iYfRNzWGdSbOJad7acWt28Xc6jSdlJCXPgrJOc-mdkf5_OE'
        // No contact email
      },
      {
        Name: 'Scripture Earth',
        WebsiteUrl: 'https://scriptureearth.org',
        BuildEngineUrl: 'https://replace.scriptoria.io:8443',
        BuildEngineApiAccessToken: 'replace',
        LogoUrl: 'https://s3.amazonaws.com/sil-prd-scriptoria-resources/scriptureearth/se_logo.png',
        ContactEmail: 'info@scriptureearth.org'
      }
    ];

    await prisma.organizations.createMany({
      data: organizationsData
    });

    const storesData = [
      {
        Name: 'wycliffeusa',
        Description: 'Wycliffe USA - Google Play',
        StoreTypeId: 1
      },
      {
        Name: 'internetpublishingservice',
        Description: 'Internet Publishing Service (Kalaam) - Google Play',
        StoreTypeId: 1
      },
      { Name: 'indhack', Description: 'Indigitous Hack - Google Play', StoreTypeId: 1 }
    ];

    await prisma.stores.createMany({
      data: storesData
    });

    const organizationProductDefinitionsData = [
      { OrganizationId: 1, ProductDefinitionId: 1 },
      { OrganizationId: 2, ProductDefinitionId: 1 },
      { OrganizationId: 3, ProductDefinitionId: 1 }
    ];

    await prisma.organizationProductDefinitions.createMany({
      data: organizationProductDefinitionsData
    });

    const organizationStoresData = [
      { OrganizationId: 1, StoreId: 1 },
      { OrganizationId: 2, StoreId: 2 },
      { OrganizationId: 3, StoreId: 3 },
      { OrganizationId: 4, StoreId: 3 }
    ];

    await prisma.organizationStores.createMany({
      data: organizationStoresData
    });

    const groupsData = [
      { Name: 'Language Software Development', Abbreviation: 'LSDEV', OwnerId: 1 },
      { Name: 'Chad Branch', Abbreviation: 'CHB', OwnerId: 1 },
      { Name: 'Mexico Branch', Abbreviation: 'MXB', OwnerId: 1 },
      { Name: 'AuSIL', Abbreviation: 'AAB', OwnerId: 1 },
      { Name: 'Americas Group', Abbreviation: 'AMG', OwnerId: 1 },
      { Name: 'Asia Area', Abbreviation: 'ASA', OwnerId: 1 },
      { Name: 'Camaroon Branch', Abbreviation: 'CMB', OwnerId: 1 },
      { Name: 'Roma Region', Abbreviation: 'RMA', OwnerId: 1 },
      { Name: 'The Seed Company', Abbreviation: 'RSM', OwnerId: 1 },
      { Name: 'SIL International', Abbreviation: 'SIL', OwnerId: 1 },
      { Name: 'Mainland Southeast Asia Group', Abbreviation: 'THG', OwnerId: 1 },
      { Name: 'Wycliffe Taiwan', Abbreviation: 'TWN', OwnerId: 1 },
      { Name: 'West Africa', Abbreviation: 'WAF', OwnerId: 1 },
      { Name: 'Kalaam', Abbreviation: 'KAL', OwnerId: 2 },
      { Name: 'FCBH', Abbreviation: 'FCBH', OwnerId: 3 },
      { Name: 'Scripture Earth', Abbreviation: 'SE', OwnerId: 4 }
    ];

    await prisma.groups.createMany({
      data: groupsData
    });

    const organizationMembershipsData = [
      { UserId: 1, OrganizationId: 1 }, // chris_hubbard@sil.org - SIL
      { UserId: 1, OrganizationId: 2 }, // chris_hubbard@sil.org - Kalaam
      { UserId: 1, OrganizationId: 3 }, // chris_hubbard@sil.org - FCBH
      { UserId: 2, OrganizationId: 1 }, // david_moore1@sil.org - SIL
      { UserId: 3, OrganizationId: 1 }, // bill_dyck@sil.org - SIL
      { UserId: 3, OrganizationId: 4 }, // bill_dyck@sil.org - SE
      { UserId: 4, OrganizationId: 1 }, // loren_hawthorne@sil.org - SIL
      { UserId: 5, OrganizationId: 2 }, // chris.kalaam@gmail.com - Kalaam
      { UserId: 6, OrganizationId: 1 }, // Scriptoria CI - SIL
      { UserId: 7, OrganizationId: 1 }, // 7dev7urandom@gmail.com - SIL
      { UserId: 8, OrganizationId: 1 } // aejones4gm@gmail.com - SIL
    ];

    await prisma.organizationMemberships.createMany({
      data: organizationMembershipsData
    });

    const groupMembershipsData = [
      { UserId: 1, GroupId: 1 },
      { UserId: 2, GroupId: 1 },
      { UserId: 3, GroupId: 5 },
      { UserId: 3, GroupId: 6 },
      { UserId: 3, GroupId: 11 },
      { UserId: 3, GroupId: 12 },
      { UserId: 3, GroupId: 16 },
      { UserId: 4, GroupId: 3 },
      { UserId: 5, GroupId: 14 },
      { UserId: 6, GroupId: 1 }, // CI - LSDEV
      { UserId: 7, GroupId: 1 },
      { UserId: 8, GroupId: 1 }
    ];

    await prisma.groupMemberships.createMany({
      data: groupMembershipsData
    });

    const userRolesData = [
      { UserId: 1, RoleId: 1, OrganizationId: 1 }, // chris_hubbard@sil.org - SuperAdmin - SIL
      { UserId: 1, RoleId: 2, OrganizationId: 1 }, // chris_hubbard@sil.org - OrgAdmin - SIL
      { UserId: 1, RoleId: 1, OrganizationId: 2 }, // chris_hubbard@sil.org - SuperAdmin - Kalaam
      { UserId: 1, RoleId: 1, OrganizationId: 3 }, // chris_hubbard@sil.org - SuperAdmin - FCBH
      { UserId: 1, RoleId: 1, OrganizationId: 4 }, // chris_hubbard@sil.org - SuperAdmin - SE
      { UserId: 2, RoleId: 1, OrganizationId: 1 }, // david_moore1@sil.org - SuperAdmin - SIL
      { UserId: 2, RoleId: 2, OrganizationId: 1 }, // david_moore1@sil.org - OrgAdmin - SIL
      { UserId: 3, RoleId: 2, OrganizationId: 1 }, // bill_dyck@sil.org - OrgAdmin - SIL
      { UserId: 3, RoleId: 2, OrganizationId: 4 }, // bill_dyck@sil.org - OrgAdmin - SE
      { UserId: 4, RoleId: 3, OrganizationId: 1 }, // loren_hawthorne@sil.org - AppBuilder - SIL
      { UserId: 5, RoleId: 3, OrganizationId: 3 }, // chris.kalaam@gmail.com - AppBuilder - Kalaam
      { UserId: 6, RoleId: 2, OrganizationId: 1 }, // CI - OrgAdmin - SIL (this is so CI can send an invite email)
      { UserId: 7, RoleId: 1, OrganizationId: 1 }, // 7dev7urandom@gmail.com - SuperAdmin - SIL
      { UserId: 8, RoleId: 1, OrganizationId: 1 } // aejones4gm@gmail.com - SuperAdmin - SIL
    ];

    await prisma.userRoles.createMany({
      data: userRolesData
    });
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
