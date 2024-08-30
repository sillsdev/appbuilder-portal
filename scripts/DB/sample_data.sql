INSERT INTO "Users" (
  "Name",                   "Email",                     "ExternalId",                          "FamilyName",   "GivenName", "IsLocked", "Locale", "Phone", "Timezone", "EmailNotification") VALUES
(	'Chris Hubbard',	        'chris_hubbard@sil.org',	   'google-oauth2|116747902156680384840',	'Hubbard',	    'Chris',	   '0',	NULL,	NULL,	NULL, '0'),
(	'David Moore',	          'david_moore1@sil.org',	     'google-oauth2|114981819181509824425',	'Moore',	      'David',	   '0',	NULL,	NULL,	NULL, '0'),
(	'Preston Sego (gmail)',	  'lt.sego@gmail.com',	       'google-oauth2|106685378104908547147',	'Sego (gmail)',	'Preston',	 '0',	NULL,	NULL,	NULL, '0'),
(	'Chris Hubbard (Kalaam)',	'chris.kalaam@gmail.com',	   'auth0|5b578f6197af652b19f9bb41',	    'Hubbard',	    'Chris',	   '0',	NULL,	NULL,	NULL, '0'),
(	'Bill Dyck',              'bill_dyck@sil.org',	       'google-oauth2|102643649500459434996', 'Dyck',	        'Bill',	     '0',	NULL, NULL, NULL, '0'),
(	'Loren Hawthorne',        'loren_hawthrone@sil.org',	 'google-oauth2|116603781884964961816', 'Hawthorne',	      'Loren', '0',	NULL, NULL, NULL, '0'),
(	'Chris Hubbard (BlueVire)',        'chris@bluevire.com',	 'google-oauth2|108288848155985772105', 'Hubbard (BlueVire)',	      'Chris', '0',	NULL, NULL, NULL, '0'),
( 'Micah Henney',           '7dev7urandom@gmail.com',    'google-oauth2|102633638937992588080', 'Henney',       'Micah',     '0', NULL, NULL, NULL, '0'),
( 'Aidan Jones',            'aejones4gm@gmail.com',      'google-oauth2|108677489047994521292', 'Jones',        'Aidan',     '0', NULL, NULL, NULL, '0');

INSERT INTO "Organizations" ("Id", "Name", "WebsiteUrl", "BuildEngineUrl", "BuildEngineApiAccessToken", "OwnerId", "UseDefaultBuildEngine") VALUES
(1,	'SIL International',	'https://sil.org',	'https://dev-buildengine.scriptoria.io:8443',	'replace',	1,	false),
(2,	'DeveloperTown',	'https://developertown.com',	'https://dev-buildengine.scriptoria.io:8443',	'replace',	3,	false),
(3,	'Kalaam Media',	'https://kalaam.org',	'https://dev-buildengine.scriptoria.io:8443',	'replace',	1,	false);

SELECT SETVAL('"Organizations_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "Organizations";

INSERT INTO "OrganizationProductDefinitions" ("OrganizationId", "ProductDefinitionId") VALUES
(1,      1),
(1,      2),
(2,      1),
(3,      1),
(2,      2),
(3,      2),
(1,      3),
(1,      5);

INSERT INTO "StoreTypes" ("Id", "Name", "Description") VALUES
(4, 'amazon_app_store',	'Amazon App Store');

SELECT SETVAL('"StoreTypes_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "StoreTypes";

INSERT INTO "Stores" ("Id", "Name", "Description", "StoreTypeId") VALUES
(1, 'wycliffeusa', 'Wycliffe USA - Google Play', 1),
(2, 'wycliffeusa_s3', 'Wycliffe USA - S3', 2),
(3, 'internetpublishingservice', 	'Internet Publishing Service (Kalaam) - Google Play', 1),
(4, 'indhack', 				'Indigitous Hack - Google Play', 1),
(5, 'wycliffeusa_ama',			'Wycliffe USA - Amazon App Store', 4),
(6, 'internetpublishingservice_ama', 	'Internet Publishing Service (Kalaam) - Amazon App Store', 4),
(7, 'indhack_ama', 	'Indigitous Hack - Amazon App Store', 4);

SELECT SETVAL('"Stores_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "Stores";

INSERT INTO "OrganizationStores" ("OrganizationId", "StoreId") VALUES
(1,     1),
(1,     2),
(2,     4),
(3,     3),
(1,	5),
(2,	7),
(3,	6);

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
( 6, 1), -- loren_hawthorne@sil.org - SIL
( 7, 1), -- chris@bluevire.com - SIL
( 8, 1), -- 7dev7urandom@gmail.com - SIL
( 9, 1); -- aejones4gm@gmail.com - SIL

INSERT INTO "GroupMemberships" ("UserId", "GroupId") VALUES
( 1, 1), -- chris_hubbard@sil.org - LSDEV
( 2, 1), -- david_moore1@sil.org - LSDEV
( 2, 2), -- david_moore1@sil.org - CHB
( 2, 15), -- david_moore1@sil.org - KAL_AF
( 3, 14), -- lt.sego@gmail.com - Development (DT)
( 7, 1), -- chris@bluevire.com - LSDEV
( 8, 1), -- 7dev7urandom@gmail.com - LSDEV
( 9, 1); -- aejones4gm@gmail.com -LSDev

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
( 4, 3, 3), -- chris.kalaam@gmail.com - AppBuilder - Kalaam
( 7, 3, 1), -- chris@bluevire.com - AppBuilder - Kalaam
( 8, 1, 1), -- 7dev7urandom@gmail.com - SuperAdmin - SIL
( 9, 1, 1); -- aejones4gm@gmail.com - SuperAdmin - SIL

SELECT SETVAL('"UserRoles_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "UserRoles";
