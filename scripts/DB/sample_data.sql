INSERT INTO "Users" ("Name", "Email", "ExternalId", "FamilyName", "GivenName", "IsLocked", "Locale", "Phone", "Timezone") VALUES
(	'Chris Hubbard',	'chris_hubbard@sil.org',	'google-oauth2|116747902156680384840',	'Hubbard',	'Chris',	'0',	NULL,	NULL,	NULL),
(	'David Moore',	'david_moore1@sil.org',	'google-oauth2|114981819181509824425',	'Moore',	'David',	'0',	NULL,	NULL,	NULL),
(	'Preston Sego',	'lt.sego@gmail.com',	'google-oauth2|106685378104908547147',	'Sego',	'Preston',	'0',	NULL,	NULL,	NULL),
(	'Giancarlo Corzo',	'gian.corzo@gmail.com',	'google-oauth2|105409413471872324118',	'Corzo',	'Giancarlo',	'0',	NULL,	NULL,	NULL),
(	'Liz Tabor',	'ltabor@developertown.com',	'google-oauth2|113420589826662049605',	'Tabor',	'Liz',	'0',	NULL,	NULL,	NULL),
(	'Chris Hubbard (Kalaam)',	'chris.kalaam@gmail.com',	'auth0|5b578f6197af652b19f9bb41',	'Hubbard',	'Chris',	'0',	NULL,	NULL,	NULL);

INSERT INTO "Organizations" ("Name", "WebsiteUrl", "BuildEngineUrl", "BuildEngineApiAccessToken", "OwnerId") VALUES
(	'SIL International',	'https://sil.org',	'https://buildengine.gtis.guru',	'replace',	1),
(	'DeveloperTown',	'https://developertown.com',	'https://buildengine.gtis.guru',	'replace',	3),
(	'Kalaam Media',	'https://kalaam.org',	'https://buildengine.gtis.guru',	'replace',	1);

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
(	1,	1),
(	2,	1),
(	3,	2),
(	4,	2),
(	5,	2),
(	1,	3),
(	6,	3),
(   2,  3);

INSERT INTO "GroupMemberships" ("UserId", "GroupId") VALUES
(	1,	1),
(	2,	1),
(	2,	2),
(	2,	15),
(	4,	14);
