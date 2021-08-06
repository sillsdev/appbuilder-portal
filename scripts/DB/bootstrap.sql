INSERT INTO "Roles" ("Id", "RoleName") VALUES
(1, 1), /* super admin */
(2, 2), /* org admin */
(3, 3), /* app builder */
(4, 4); /* author */

SELECT SETVAL('"Roles_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "Roles";

INSERT INTO "ApplicationTypes" ("Id", "Name", "Description") VALUES
(1, 'scriptureappbuilder',	'Scripture App Builder'),
(2, 'readingappbuilder',	'Reading App Builder'),
(3, 'dictionaryappbuilder',	'Dictionary App Builder'),
(4, 'keyboardappbuilder',	'Keyboard App Builder');

SELECT SETVAL('"ApplicationTypes_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "ApplicationTypes";

INSERT INTO "StoreTypes" ("Id", "Name", "Description") VALUES
(1, 'google_play_store',	'Google Play Store'),
(2, 's3_bucket',	'Amazon S3 Bucket'),
(3, 'cloud',	'Cloud Provider');

SELECT SETVAL('"StoreTypes_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "StoreTypes";

INSERT INTO "StoreLanguages" ("Id", "Name", "Description", "StoreTypeId") VALUES
(1, 'af',	'Afrikaans – af', 1),
(2, 'am',	'Amharic – am', 1),
(3, 'ar',	'Arabic – ar', 1),
(4, 'hy-AM',	'Armenian – hy-AM', 1),
(5, 'az-AZ',	'Azerbaijani – az-AZ', 1),
(6, 'eu-ES',	'Basque – eu-ES', 1),
(7, 'be',	'Belarusian – be', 1),
(8, 'bn-BD',	'Bengali – bn-BD', 1),
(9, 'bg',	'Bulgarian – bg', 1),
(10, 'my-MM',	'Burmese – my-MM', 1),
(11, 'ca',	'Catalan – ca', 1),
(12, 'zh-CN',	'Chinese (Simplified) – zh-CN', 1),
(13, 'zh-TW',	'Chinese (Traditional) – zh-TW', 1),
(14, 'hr',	'Croatian – hr', 1),
(15, 'cs-CZ',	'Czech – cs-CZ', 1),
(16, 'da-DK',	'Danish – da-DK', 1),
(17, 'nl-NL',	'Dutch – nl-NL', 1),
(18, 'en-AU',	'English – en-AU', 1),
(19, 'en-GB',	'English (United Kingdom) – en-GB', 1),
(20, 'en-US',	'English (United States) – en-US', 1),
(21, 'et',	'Estonian – et', 1),
(22, 'fil',	'Filipino – fil', 1),
(23, 'fi-FI',	'Finnish – fi-FI', 1),
(24, 'fr-FR',	'French – fr-FR', 1),
(25, 'fr-CA',	'French (Canada) – fr-CA', 1),
(26, 'gl-ES',	'Galician – gl-ES', 1),
(27, 'ka-GE',	'Georgian – ka-GE', 1),
(28, 'de-DE',	'German – de-DE', 1),
(29, 'el-GR',	'Greek – el-GR', 1),
(30, 'iw-IL',	'Hebrew – iw-IL', 1),
(31, 'hi-IN',	'Hindi – hi-IN', 1),
(32, 'hu-HU',	'Hungarian – hu-HU', 1),
(33, 'is-IS',	'Icelandic – is-IS', 1),
(34, 'id',	'Indonesian – id', 1),
(35, 'it-IT',	'Italian – it-IT', 1),
(36, 'ja-JP',	'Japanese – ja-JP', 1),
(37, 'kn-IN',	'Kannada – kn-IN', 1),
(38, 'km-KH',	'Khmer – km-KH', 1),
(39, 'ko-KR',	'Korean (South Korea) – ko-KR', 1),
(40, 'ky-KG',	'Kyrgyz – ky-KG', 1),
(41, 'lo-LA',	'Lao – lo-LA', 1),
(42, 'lv',	'Latvian – lv', 1),
(43, 'lt',	'Lithuanian – lt', 1),
(44, 'mk-MK',	'Macedonian – mk-MK', 1),
(45, 'ms',	'Malay – ms', 1),
(46, 'ml-IN',	'Malayalam – ml-IN', 1),
(47, 'mr-IN',	'Marathi – mr-IN', 1),
(48, 'mn-MN',	'Mongolian – mn-MN', 1),
(49, 'ne-NP',	'Nepali – ne-NP', 1),
(50, 'no-NO',	'Norwegian – no-NO', 1),
(51, 'fa',	'Persian – fa', 1),
(52, 'pl-PL',	'Polish – pl-PL', 1),
(53, 'pt-BR',	'Portuguese (Brazil) – pt-BR', 1),
(54, 'pt-PT',	'Portuguese (Portugal) – pt-PT', 1),
(55, 'ro',	'Romanian – ro', 1),
(56, 'rm',	'Romansh – rm', 1),
(57, 'ru-RU',	'Russian – ru-RU', 1),
(58, 'sr',	'Serbian – sr', 1),
(59, 'si-LK',	'Sinhala – si-LK', 1),
(60, 'sk',	'Slovak – sk', 1),
(61, 'sl',	'Slovenian – sl', 1),
(62, 'es-419',	'Spanish (Latin America) – es-419', 1),
(63, 'es-ES',	'Spanish (Spain) – es-ES', 1),
(64, 'es-US',	'Spanish (United States) – es-US', 1),
(65, 'sw',	'Swahili – sw', 1),
(66, 'sv-SE',	'Swedish – sv-SE', 1),
(67, 'ta-IN',	'Tamil – ta-IN', 1),
(68, 'te-IN',	'Telugu – te-IN', 1),
(69, 'th',	'Thai – th', 1),
(70, 'tr-TR',	'Turkish – tr-TR', 1),
(71, 'uk',	'Ukrainian – uk', 1),
(72, 'vi',	'Vietnamese – vi', 1),
(73, 'zu',	'Zulu – zu', 1);

SELECT SETVAL('"StoreLanguages_Id_seq"', COALESCE(MAX("Id"), 1) )
FROM "StoreLanguages";
