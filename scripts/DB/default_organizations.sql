INSERT INTO "Users" ("Name", "Email", "ExternalId", "FamilyName", "GivenName", "IsLocked", "Locale", "Phone", "Timezone") VALUES
( 'Chris Hubbard', 'chris_hubbard@sil.org', 'google-oauth2|116747902156680384840', 'Hubbard', 'Chris', '0', NULL, NULL, NULL),
( 'David Moore', 'david_moore1@sil.org', 'google-oauth2|114981819181509824425', 'Moore', 'David', '0', NULL, NULL, NULL),
( 'Bill Dyck', 'bill_dyck@sil.org', 'google-oauth2|102643649500459434996', 'Dyck', 'Bill', '0', NULL, NULL, NULL),
( 'Loren Hawthorne', 'loren_hawthorne@sil.org', 'google-oauth2|116603781884964961816', 'Loren', 'Hawthorne', '0', NULL, NULL, NULL),
( 'Chris Hubbard (Kalaam)', 'chris.kalaam@gmail.com', 'auth0|5b578f6197af652b19f9bb41', 'Hubbard', 'Chris', '0', NULL, NULL, NULL);

INSERT INTO "Organizations" ("Name", "WebsiteUrl", "BuildEngineUrl", "BuildEngineApiAccessToken", "LogoUrl", "OwnerId") VALUES
( 'SIL International', 'https://sil.org', 'https://replace.scriptoria.io:8443', 'replace', 'https://www.sil.org/sites/default/files/sil-logo-blue-2017_1.png', 1),
( 'Kalaam Media', 'https://kalaam.org', 'https://replace.scriptoria.io:8443', 'replace', NULL, 1),
( 'Faith Comes By Hearing', 'https://kalaam.org', 'https://replace.scriptoria.io:8443', 'replace', 'https://cdn.faithcomesbyhearing.com/resources/fcbh/img/media-kit/thumbs/fcbh-logo-white-two-line-v3.png', 1),
( 'Scripture Earth', 'https://scriptureearth.org', 'https://replace.scriptoria.io:8443', 'replace', 'https://s3.amazonaws.com/scriptureearth/scriptureearth.png', 1);

INSERT INTO "Stores" ("Id", "Name", "Description", "StoreTypeId") VALUES
(1, 'wycliffeusa',			'Wycliffe USA - Google Play', 1),
(2, 'internetpublishingservice', 	'Internet Publishing Service (Kalaam) - Google Play', 1),
(3, 'indhack', 				'Indigitous Hack - Google Play', 1);

INSERT INTO "OrganizationProductDefinitions" ("OrganizationId", "ProductDefinitionId") VALUES
(1, 1),
(2, 1),
(3, 1);

INSERT INTO "OrganizationStores" ("OrganizationId", "StoreId") VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 3);

INSERT INTO "Groups" ("Name", "Abbreviation", "OwnerId") VALUES
( 'Language Software Development', 'LSDEV', 1),
( 'Chad Branch', 'CHB', 1),
( 'Mexico Branch', 'MXB', 1),
( 'AuSIL', 'AAB', 1),
( 'Americas Group', 'AMG', 1),
( 'Asia Area', 'ASA', 1),
( 'Camaroon Branch', 'CMB', 1),
( 'Roma Region', 'RMA', 1),
( 'The Seed Company', 'RSM', 1),
( 'SIL International', 'SIL', 1), -- 10
( 'Mainland Southeast Asia Group', 'THG', 1),
( 'Wycliffe Taiwan', 'TWN', 1),
( 'West Africa', 'WAF', 1),
( 'Kalaam', 'KAL', 2),
( 'FCBH', 'FCBH', 3),
( 'Scripture Earth', 'SE', 4);

INSERT INTO "OrganizationMemberships" ("UserId", "OrganizationId") VALUES
( 1, 1), -- chris_hubbard@sil.org - SIL
( 1, 2), -- chris_hubbard@sil.org - Kalaam
( 1, 3), -- chris_hubbard@sil.org - FCBH
( 2, 1), -- david_moore1@sil.org - SIL
( 3, 1), -- bill_dyck@sil.org - SIL
( 3, 4), -- bill_dyck@sil.org - SE
( 4, 1), -- loren_hawthorne@sil.org - SIL
( 5, 2); -- chris.kalaam@gmail.com - Kalaam

INSERT INTO "GroupMemberships" ("UserId", "GroupId") VALUES
( 1, 1),
( 2, 1),
( 3, 5),
( 3, 6),
( 3, 11),
( 3, 12),
( 3, 16),
( 4, 3),
( 5, 14);

INSERT INTO "UserRoles" ("UserId", "RoleId", "OrganizationId") VALUES
( 1, 1, 1), -- chris_hubbard@sil.org - SuperAdmin - SIL
( 1, 2, 1), -- chris_hubbard@sil.org - OrgAdmin - SIL
( 1, 1, 2), -- chris_hubbard@sil.org - SuperAdmin - Kalaam
( 1, 1, 3), -- chris_hubbard@sil.org - SuperAdmin - FCBH
( 1, 1, 4), -- chris_hubbard@sil.org - SuperAdmin - SE
( 2, 1, 1), -- david_moore1@sil.org - SuperAdmin - SIL
( 2, 2, 1), -- david_moore1@sil.org - OrgAdmin - SIL
( 3, 2, 1), -- bill_dyck@sil.org - OrgAdmin - SIL
( 3, 2, 4), -- bill_dyck@sil.org - OrgAdmin - SE
( 4, 3, 1), -- loren_hawthorne@sil.org - AppBuilder - SIL
( 5, 3, 3); -- chris.kalaam@gmail.com - AppBuilder - Kalaam

