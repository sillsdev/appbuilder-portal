INSERT INTO "Users" (
  "Name",                   "Email",                     "ExternalId",                          "FamilyName",   "GivenName", "IsLocked", "Locale", "Phone", "Timezone") VALUES
(	'Chris Hubbard',	        'chris_hubbard@sil.org',	   'google-oauth2|116747902156680384840',	'Hubbard',	    'Chris',	   '0',	NULL,	NULL,	NULL),
(	'David Moore',	          'david_moore1@sil.org',	     'google-oauth2|114981819181509824425',	'Moore',	      'David',	   '0',	NULL,	NULL,	NULL),
(	'Preston Sego (gmail)',	  'lt.sego@gmail.com',	       'google-oauth2|106685378104908547147',	'Sego (gmail)',	'Preston',	 '0',	NULL,	NULL,	NULL),
(	'Giancarlo Corzo',	      'gian.corzo@gmail.com',	     'google-oauth2|105409413471872324118',	'Corzo',	      'Giancarlo', '0',	NULL,	NULL,	NULL),
(	'Liz Tabor (dt)',         'ltabor@developertown.com',	 'google-oauth2|113420589826662049605',	'Tabor',	      'Liz',	     '0',	NULL,	NULL,	NULL),
(	'Chris Hubbard (Kalaam)',	'chris.kalaam@gmail.com',	   'auth0|5b578f6197af652b19f9bb41',	    'Hubbard',	    'Chris',	   '0',	NULL,	NULL,	NULL),
( 'Preston Sego (dt)',      'psego@developertown.com',   'google-oauth2|111802484969448690930', 'Sego (dt)',    'Preston',   '0', NULL, NULL, NULL),
(	'Bill Dyck',              'bill_dyck@sil.org',	       'google-oauth2|102643649500459434996', 'Dyck',	        'Bill',	     '0',	NULL, NULL, NULL),
(	'Loren Hawthorne',        'loren_hawthrone@sil.org',	 'google-oauth2|116603781884964961816', 'Loren',	      'Hawthorne', '0',	NULL, NULL, NULL),
(	'liztabor19@gmail.com',   'liztabor19@gmail.com',	     'google-oauth2|104286798726238637666', 'Liz',	        'Tabor',	   '0',	NULL, NULL, NULL),
(	'other@sil.org',          'other@sil.org',	           'auth0|5c07e78511bf6d2f2ce0fcff',      'Other'	,       'SIL',       '0',	NULL, NULL, NULL),
(	'Nate Canada',            'ncanada@developertown.com', 'google-oauth2|107093754016949028816', 'Nate', 	      'Canada',	   '0',	NULL, NULL, NULL),
(   'Jon Nolen',              'jnolen@developertown.com',  'google-oauth2|113544451794352875093', 'Jon',  	      'Nolen', 	   '0', NULL, NULL, NULL),
(	'Alex Billingsley',       'abillingsley@developertown.com', 'google-oauth2|106243064761677479593', 'Alex', 	      'Billingsley',	   '0',	NULL, NULL, NULL);

INSERT INTO "Organizations" ("Name", "WebsiteUrl", "BuildEngineUrl", "BuildEngineApiAccessToken", "OwnerId", "UseDefaultBuildEngine") VALUES
(	'SIL International',	'https://sil.org',	'https://buildengine.gtis.guru:8443',	'replace',	1,	false),
(	'DeveloperTown',	'https://developertown.com',	'https://buildengine.gtis.guru:8443',	'replace',	3,	false),
(	'Kalaam Media',	'https://kalaam.org',	'https://buildengine.gtis.guru:8443',	'replace',	1,	false);

-- INSERT INTO "WorkflowDefinitions" ("Id", "Name", "Enabled", "Description", "WorkflowScheme", "WorkflowBusinessFlow", "StoreTypeId") VALUES
-- (4,     'sil_android_amazon_store',      '1',    'SIL Default Workflow for Publishing to Amazon App Store',   'SIL_Default_AppBuilders_Android_AmazonAppStore',	'SIL_Default_AppBuilders_Android_AmazonAppStore',   1),
-- (5,     'sil_android_scripture_earth',      '1',    'SIL Default Workflow for Publishing to Scripture Earth',   'SIL_Default_AppBuilders_Android_ScriptureEarth',	'SIL_Default_AppBuilders_Android_ScriptureEarth',   NULL),
-- (6,	'sil_android_s3',	'1',	'SIL Default Workflow for Publishing to S3', 'SIL_Default_AppBuilders_Android_S3',	'SIL_Default_AppBuilders_Android_S3', NULL),
-- (7,	'kalaam_android_website',	'1',	'Kalaam Default Workflow for Publishing to a Kalaam Website', 'Kalaam_Default_AppBuilders_Android_Site',	'Kalaam_Default_AppBuilders_Android_Site', NULL);

-- INSERT INTO "ProductDefinitions" ("Id", "Name", "TypeId", "Description", "WorkflowId") VALUES
-- (2,     'Android App in Amazon App Store',  1,      'Build an Android App from Scripture App Builder project and publish to Amazon App Store',   4),
-- (3,     'Android App in Scripture Earth',  1,      'Build an Android App from Scripture App Builder project and publish to Scripture Earth',   5),
-- (4,	'Android App uploaded to S3', 1,	'Build an Android App from Scripture App Build project and uploaded to S3', 6),
-- (5,	'Android App uploaded to Kalaam Site', 1, 'Build an Android App from Scripture App Builder project and uploaded to a Kalaam Site', 7),
-- (6,	'Android Reading App uploaded to S3', 2,	'Build an Android App from a Reading App Builder project and uploaded to S3', 6),
-- (7,	'Android Dictionary App uploaded to S3', 3,	'Build an Android App from a Dictionary App Builder project uploaded to S3', 6);


INSERT INTO "OrganizationProductDefinitions" ("OrganizationId", "ProductDefinitionId") VALUES
(1,      1),
(2,      1),
(3,      1);
-- (1,      4),
-- (2,      4),
-- (3,      4),
-- (1,      5),
-- (2,      5),
-- (3,      5),
-- (1,      6),
-- (2,      6),
-- (3,      6),
-- (3,	 7);

INSERT INTO "StoreTypes" ("Id", "Name", "Description") VALUES
(2, 'amazon_app_store',	'Amazon App Store');

INSERT INTO "Stores" ("Id", "Name", "Description", "StoreTypeId") VALUES
(4, 'wycliffeusa_ama',			'Wycliffe USA - Amazon App Store', 2),
(5, 'internetpublishingservice_ama', 	'Internet Publishing Service (Kalaam) - Amazon App Store', 2),
(6, 'indhack_ama', 	'Indigitous Hack - Amazon App Store', 2);

INSERT INTO "OrganizationStores" ("OrganizationId", "StoreId") VALUES
(1,     1),
(2,     3),
(3,     2),
(1,	4),
(2,	6),
(3,	5);

INSERT INTO "Groups" ("Name", "Abbreviation", "OwnerId") VALUES
(	'Language Software Development',	'LSDEV',	1),
(	'Chad Branch',	'CHB',	1),
(	'Mexico Branch',	'MXB',	1),
(	'AuSIL',	'AAB',	1),
(	'Americas Group',	'AMG',	1),
(	'Asia Area',	'ASA',	1),
(	'Camaroon Branch',	'CMB',	1),
(	'Roma Region',	'RMA',	1),
(	'The Seed Company',	'RSM',	1),
(	'SIL International',	'SIL',	1),
(	'Mainland Southeast Asia Group',	'THG',	1),
(	'Wycliffe Taiwan',	'TWN',	1),
(	'West Africa',	'WAF',	1),
(	'Development',	'DEV',	2),
(	'KAL Africa',	'KAL_AF',	3),
(	'KAL Asia',	'KAL_AS',	3);

INSERT INTO "OrganizationMemberships" ("UserId", "OrganizationId") VALUES
(	1,	1), -- chris_hubbard@sil.org - SIL
(	1,	2), -- chris_hubbard@sil.org - DT
(	1,	3), -- chris_hubbard@sil.org - Kalaam
(	2,	1), -- david_moore1@sil.org - SIL
(	2,  3), -- david_moore1@sil.org - Kalaam
(	3,	2), -- lt.sego@gmail.com - DT
(	4,	2), -- gian.corzo@gmail.com - DT
(	5,	2), -- ltabor@developertown.com - DT
(	6,	3), -- chris.kalaam@gmail.com - Kalaam
(	7,  1), -- psego@developertown.com - SIL
(	7,  2), -- psego@developertown.com - DT
(	8,  1), -- bill_dyck@sil.org - SIL
(	8,  3), -- bill_dyck@sil.org - Kalaam
(	9,  1), -- loren_hawthorne@sil.org - SIL
(	10,  1), -- liztabor19+1@gmail.com - SIL
(	10,  2), -- liztabor19+1@gmail.com - DT
(	11,  1), -- other@sil.org - SIL
(	12,	2), -- ncanada@developertown.com - DT
( 13, 2), -- jnolen@developertown.com - DT
(	5,	1), -- ltabor@developertown.com - SIL
(	14,	2); -- abillingsley@developertown.com - DT





INSERT INTO "GroupMemberships" ("UserId", "GroupId") VALUES
(	1,	1),
(	2,	1),
(	2,	2),
(	2,	15),
(	4,	14),
( 3,  14),
( 7,  14),
( 7,   1),
( 5,  14),
( 12,  14),
( 14, 14);

INSERT INTO "UserRoles" ("UserId", "RoleId", "OrganizationId") VALUES
(	1,	1,	1), -- chris_hubbard@sil.org - SuperAdmin - SIL
(	1,	2,	1), -- chris_hubbard@sil.org - OrgAmin - SIL
(	8,	1,	1), -- bill_dyck@sil.org - AppBuilder - SIL
(	2,	3,	1), -- david_moore1@sil.org - AppBuilder - SIL
(	7,	1,	1), -- psego@developertown.com - AppBuilder - SIL
(	9,	3,	1), -- loren_hawthorne@sil.org - AppBuilder - SIL
(	7,	1,	2), -- psego@developertown.com - SuperAdmin - DT
(	5,	1,	2), -- ltabor@developertown.com - SuperAdmin - DT
(	5,	2,	2), -- ltabor@developertown.com - OrgAdmin - DT
(	1,	2,	2), -- chris_hubbard@sil.org - OrgAdmin - DT
(	3,	3,	2), -- lt.sego@gmail.com - AppBuilder - DT
(	4,	3,	2), -- gian.corzo@gmail.com - AppBuilder - DT
(	1,	1,	3), -- chris_hubbard@sil.org - SuperAdmin - Kalaam
(	8,	1,	3), -- bill_dyck@sil.org - AppBuilder - Kalaam
(	2,	2,	3), -- david_moore1@sil.org - OrgAdmin - Kalaam
(	6,	3,	3), -- chris.kalaam@gmail.com - AppBuilder - Kalaam
(	10,	3,	1), -- liztabor19+1@gmail.com - AppBuilder - SIL
(	10,	3,	2), -- liztabor19+1@gmail.com - AppBuilder - DT
(	11,	3,	1), -- other@sil.org - AppBuilder - SIL
(	12,	1,	2), -- ncanada@developertown.com - SuperAdmin - DT
(	12,	2,	2), -- ncanada@developertown.com - OrgAdmin - DT
(	13,	2,	2), -- jnolen@developertown.com - OrgAdmin - DT
( 14,	1,	2), -- jnolen@developertown.com - SuperAdmin - DT
( 14,	2,	2); -- jnolen@developertown.com - OrgAdmin - DT

/* Fix sequences ids */
SELECT SETVAL('"ApplicationTypes_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "ApplicationTypes";
SELECT SETVAL('"Roles_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "Roles";
SELECT SETVAL('"StoreTypes_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "StoreTypes";
SELECT SETVAL('"Stores_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "Stores";
SELECT SETVAL('"StoreLanguages_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "StoreLanguages";
SELECT SETVAL('"ProductDefinitions_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "ProductDefinitions";
SELECT SETVAL('"WorkflowDefinitions_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "WorkflowDefinitions";
