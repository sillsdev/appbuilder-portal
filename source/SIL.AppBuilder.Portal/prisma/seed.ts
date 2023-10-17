import { PrismaClient } from '@prisma/client';

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
		[1, 'scriptureappBuilder', 'Scripture App Builder'],
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
			Id: 1,
			Name: 'sil_android_google_play',
			Type: 1,
			Enabled: true,
			Description: 'SIL Default Workflow for Publishing to Google Play',
			WorkflowScheme: 'SIL_Default_AppBuilders_Android_GooglePlay',
			WorkflowBusinessFlow: 'SIL_Default_AppBuilders_Android_GooglePlay_Flow',
			StoreTypeId: 1
		},
		{
			Id: 2,
			Name: 'sil_android_google_play_rebuild',
			Type: 2,
			Enabled: true,
			Description: 'SIL Default Workflow for Rebuilding to Google Play',
			WorkflowScheme: 'SIL_Default_AppBuilders_Android_GooglePlay_Rebuild',
			WorkflowBusinessFlow: 'SIL_Default_AppBuilders_Android_GooglePlay_Flow',
			StoreTypeId: 1
		},
		{
			Id: 3,
			Name: 'sil_android_google_play_republish',
			Type: 3,
			Enabled: true,
			Description: 'SIL Default Workflow for Republish to Google Play',
			WorkflowScheme: 'SIL_Default_AppBuilders_Android_GooglePlay_Republish',
			WorkflowBusinessFlow: 'SIL_Default_AppBuilders_Android_GooglePlay_Flow',
			StoreTypeId: 1
		},
		{
			Id: 4,
			Name: 'sil_android_s3',
			Type: 1,
			Enabled: true,
			Description: 'SIL Default Workflow for Publish to Amazon S3 Bucket',
			WorkflowScheme: 'SIL_Default_AppBuilders_Android_S3',
			WorkflowBusinessFlow: 'SIL_Default_AppBuilders_Android_S3_Flow',
			StoreTypeId: 2
		},
		{
			Id: 5,
			Name: 'sil_android_s3_rebuild',
			Type: 2,
			Enabled: true,
			Description: 'SIL Default Workflow for Rebuilding to Amazon S3 Bucket',
			WorkflowScheme: 'SIL_Default_AppBuilders_Android_S3_Rebuild',
			WorkflowBusinessFlow: 'SIL_Default_AppBuilders_Android_S3_Flow',
			StoreTypeId: 2
		},
		{
			Id: 6,
			Name: 'la_android_google_play',
			Type: 1,
			Enabled: true,
			Description: 'Low Admin Workflow for Publishing to Google Play',
			WorkflowScheme: 'SIL_LowAdmin_AppBuilders_Android_GooglePlay',
			WorkflowBusinessFlow: 'SIL_Default_AppBuilders_Android_GooglePlay_Flow',
			StoreTypeId: 1
		},
		{
			Id: 7,
			Name: 'oa_android_google_play',
			Type: 1,
			Enabled: true,
			Description: 'Owner Admin Workflow for Publishing to Google Play',
			WorkflowScheme: 'SIL_OwnerAdmin_AppBuilders_Android_GooglePlay',
			WorkflowBusinessFlow: 'SIL_Default_AppBuilders_Android_GooglePlay_Flow',
			StoreTypeId: 1
		},
		{
			Id: 8,
			Name: 'na_android_s3',
			Type: 1,
			Enabled: true,
			Description: 'No Admin Workflow for Publishing to S3',
			WorkflowScheme: 'SIL_NoAdmin_AppBuilders_Android_S3',
			WorkflowBusinessFlow: 'SIL_Default_AppBuilders_Android_S3_Flow',
			StoreTypeId: 2
		},
		{
			Id: 9,
			Name: 'pwa_cloud',
			Type: 1,
			Enabled: true,
			Description: 'SIL Default Workflow for Publishing PWA to Cloud',
			WorkflowScheme: 'SIL_Default_AppBuilders_Pwa_Cloud',
			WorkflowBusinessFlow: 'SIL_AppBuilders_Web_Flow',
			StoreTypeId: 3
		},
		{
			Id: 10,
			Name: 'pwa_cloud_rebuild',
			Type: 2,
			Enabled: true,
			Description: 'SIL Default Workflow for Rebuilding PWA to Cloud',
			WorkflowScheme: 'SIL_Default_AppBuilders_Pwa_Cloud_Rebuild',
			WorkflowBusinessFlow: 'SIL_AppBuilders_Web_Flow',
			StoreTypeId: 3
		},
		{
			Id: 11,
			Name: 'html_cloud',
			Type: 1,
			Enabled: true,
			Description: 'SIL Default Workflow for Publishing HTML to Cloud',
			WorkflowScheme: 'SIL_Default_AppBuilders_Html_Cloud',
			WorkflowBusinessFlow: 'SIL_AppBuilders_Web_Flow',
			StoreTypeId: 3
		},
		{
			Id: 12,
			Name: 'html_cloud_rebuild',
			Type: 2,
			Enabled: true,
			Description: 'SIL Default Workflow for Rebuilding HTML to Cloud',
			WorkflowScheme: 'SIL_Default_AppBuilders_Html_Cloud_Rebuild',
			WorkflowBusinessFlow: 'SIL_AppBuilders_Web_Flow',
			StoreTypeId: 3
		},
		{
			Id: 13,
			Name: 'asset_package',
			Type: 1,
			Enabled: true,
			Description: 'SIL Default Workflow for Publishing Asset Packages',
			WorkflowScheme: 'SIL_NoAdmin_AppBuilders_Android_S3',
			WorkflowBusinessFlow: 'SIL_AppBuilders_AssetPackage_Flow',
			StoreTypeId: 2,
			Properties: '{ "build:targets" : "asset-package" }'
		},
		{
			Id: 14,
			Name: 'asset_package_rebuild',
			Type: 2,
			Enabled: true,
			Description: 'SIL Default Workflow for Rebuilding Asset Packages',
			WorkflowScheme: 'SIL_Default_AppBuilders_Android_S3_Rebuild',
			WorkflowBusinessFlow: 'SIL_AppBuilders_AssetPackage_Flow',
			StoreTypeId: 2,
			Properties: '{ "build:targets" : "asset-package" }'
		}
	];

	for (const data of workflowDefinitionData) {
		await prisma.workflowDefinitions.upsert({
			where: { Id: data.Id },
			update: data,
			create: data
		});
	}

	const productDefinitionData = [
		{
			Id: 1,
			Name: 'Android App to Google Play',
			TypeId: 1,
			Description:
				'Build an Android App from a Scripture App Builder project and publish to a Google Play Store. The Organization Admin has to approve of the project and review the store preview. The Organization Admin has access to Google Play Console.',
			WorkflowId: 1,
			RebuildWorkflowId: 2,
			RepublishWorkflowId: 3
		},
		{
			Id: 2,
			Name: 'Android App to Amazon S3 Bucket',
			TypeId: 1,
			Description:
				'Build an Android App from a Scripture App Builder project and publish to an Amazon S3 Bucket',
			WorkflowId: 4,
			RebuildWorkflowId: 5
		},
		{
			Id: 3,
			Name: 'Android App to Google Play (Low Admin)',
			TypeId: 1,
			Description:
				'Build an Android App from a Scripture App Builder project and publish to a Google Play Store, but with less approval and oversight required. The Organization Admin has access to Google Play Console.',
			WorkflowId: 6,
			RebuildWorkflowId: 2,
			RepublishWorkflowId: 3
		},
		{
			Id: 4,
			Name: 'Android App to Amazon S3 Bucket (No Admin)',
			TypeId: 1,
			Description:
				'Build an Android App from a Scripture App Builder project and publish to an Amazon S3 Bucket, but with no admin required.',
			WorkflowId: 8,
			RebuildWorkflowId: 5
		},
		{
			Id: 5,
			Name: 'Android App to Google Play (Owner Admin)',
			TypeId: 1,
			Description:
				'Build an Android App from a Scripture App Builder project and publish to a Google Play Store, but with no approval and oversight required. The owner of the project has access to Google Play Console.',
			WorkflowId: 7,
			RebuildWorkflowId: 2,
			RepublishWorkflowId: 3
		}
	];

	for (const data of productDefinitionData) {
		await prisma.productDefinitions.upsert({
			where: { Id: data.Id },
			update: data,
			create: data
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
