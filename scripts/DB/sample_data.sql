INSERT INTO "Users" (
  "Name",                   "Email",                     "ExternalId",                          "FamilyName",   "GivenName", "IsLocked", "Locale", "Phone", "Timezone", "EmailNotification") VALUES
(	'Chris Hubbard',	        'chris_hubbard@sil.org',	   'google-oauth2|116747902156680384840',	'Hubbard',	    'Chris',	   '0',	NULL,	NULL,	NULL, '0'),
(	'David Moore',	          'david_moore1@sil.org',	     'google-oauth2|114981819181509824425',	'Moore',	      'David',	   '0',	NULL,	NULL,	NULL, '0'),
(	'Preston Sego (gmail)',	  'lt.sego@gmail.com',	       'google-oauth2|106685378104908547147',	'Sego (gmail)',	'Preston',	 '0',	NULL,	NULL,	NULL, '0'),
(	'Chris Hubbard (Kalaam)',	'chris.kalaam@gmail.com',	   'auth0|5b578f6197af652b19f9bb41',	    'Hubbard',	    'Chris',	   '0',	NULL,	NULL,	NULL, '0'),
(	'Bill Dyck',              'bill_dyck@sil.org',	       'google-oauth2|102643649500459434996', 'Dyck',	        'Bill',	     '0',	NULL, NULL, NULL, '0'),
(	'Loren Hawthorne',        'loren_hawthrone@sil.org',	 'google-oauth2|116603781884964961816', 'Loren',	      'Hawthorne', '0',	NULL, NULL, NULL, '0');

INSERT INTO "Organizations" ("Id", "Name", "WebsiteUrl", "BuildEngineUrl", "BuildEngineApiAccessToken", "OwnerId", "UseDefaultBuildEngine") VALUES
(1,	'SIL International',	'https://sil.org',	'https://buildengine.gtis.guru:8443',	'replace',	1,	false),
(2,	'DeveloperTown',	'https://developertown.com',	'https://buildengine.gtis.guru:8443',	'replace',	3,	false),
(3,	'Kalaam Media',	'https://kalaam.org',	'https://buildengine.gtis.guru:8443',	'replace',	1,	false);

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
(1, 'wycliffeusa',			'Wycliffe USA - Google Play', 1),
(2, 'internetpublishingservice', 	'Internet Publishing Service (Kalaam) - Google Play', 1),
(3, 'indhack', 				'Indigitous Hack - Google Play', 1),
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
( 1, 1), -- chris_hubbard@sil.org - SIL
( 1, 2), -- chris_hubbard@sil.org - DT
( 1, 3), -- chris_hubbard@sil.org - Kalaam
( 2, 1), -- david_moore1@sil.org - SIL
( 2, 3), -- david_moore1@sil.org - Kalaam
( 3, 2), -- lt.sego@gmail.com - DT
( 4, 3), -- chris.kalaam@gmail.com - Kalaam
( 3, 1), -- psego@developertown.com - SIL
( 3, 2), -- psego@developertown.com - DT
( 5, 1), -- bill_dyck@sil.org - SIL
( 5, 3), -- bill_dyck@sil.org - Kalaam
( 6, 1); -- loren_hawthorne@sil.org - SIL

INSERT INTO "GroupMemberships" ("UserId", "GroupId") VALUES
( 1, 1), -- chris_hubbard@sil.org - LSDEV
( 2, 1), -- david_moore1@sil.org - LSDEV
( 2, 2), -- david_moore1@sil.org - CHB
( 2, 15), -- david_moore1@sil.org - KAL_AF
( 3, 14); -- lt.sego@gmail.com - Development (DT)

INSERT INTO "UserRoles" ("UserId", "RoleId", "OrganizationId") VALUES
( 1, 1, 1), -- chris_hubbard@sil.org - SuperAdmin - SIL
( 1, 2, 1), -- chris_hubbard@sil.org - OrgAmin - SIL
( 5, 3, 1), -- bill_dyck@sil.org - AppBuilder - SIL
( 2, 3, 1), -- david_moore1@sil.org - AppBuilder - SIL
( 6, 3, 1), -- loren_hawthorne@sil.org - AppBuilder - SIL
( 1, 2, 2), -- chris_hubbard@sil.org - OrgAdmin - DT
( 3, 3, 2), -- lt.sego@gmail.com - AppBuilder - DT
( 5, 3, 3), -- bill_dyck@sil.org - AppBuilder - Kalaam
( 2, 2, 3), -- david_moore1@sil.org - OrgAdmin - Kalaam
( 4, 3, 3); -- chris.kalaam@gmail.com - AppBuilder - Kalaam

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
SELECT SETVAL('"Stores_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "Stores";
SELECT SETVAL('"Organizations_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "Organizations";
