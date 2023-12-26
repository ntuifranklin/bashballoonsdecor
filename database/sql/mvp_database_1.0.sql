BEGIN TRANSACTION;
DROP TABLE IF EXISTS "package";
CREATE TABLE IF NOT EXISTS "package" (
	"packageid"	TEXT,
	"packagedesc"	TEXT NOT NULL,
	"packagecost"	NUMERIC NOT NULL,
	PRIMARY KEY("packageid")
);
DROP TABLE IF EXISTS "package_contains_items";
CREATE TABLE IF NOT EXISTS "package_contains_items" (
	"pckcontid"	TEXT,
	"packageid"	TEXT NOT NULL,
	"packageitemid"	TEXT NOT NULL,
	"qtyneeded"	INTEGER NOT NULL,
	FOREIGN KEY("packageid") REFERENCES "package"("packageid"),
	PRIMARY KEY("pckcontid")
);
DROP TABLE IF EXISTS "packageitems";
CREATE TABLE IF NOT EXISTS "packageitems" (
	"packageitemid"	TEXT,
	"itemdesc"	TEXT NOT NULL,
	"qtyavailable"	INTEGER NOT NULL,
	PRIMARY KEY("packageitemid")
);
INSERT INTO "package" ("packageid","packagedesc","packagecost") VALUES
 ('d09745340cebd03c6e0a','Package For 150 Guests',3000),
 ('ab7adb97a1f89a92527a','Package For 250 Guests',3800),
 ('bfcd68043040f450b8e7','Package For 300 Guests',4900);
INSERT INTO "package_contains_items" ("pckcontid","packageid","packageitemid","qtyneeded") VALUES ('d704c6fb3533301c7d','d09745340cebd03c6e0a','fd5330f23a',15),
 ('3f24ea60e82d9c4d4c','d09745340cebd03c6e0a','a7e845cfc4',150),
 ('11e406111d92cb59ec','d09745340cebd03c6e0a','d2197d2019',150),
 ('cead7ef336d8877776','d09745340cebd03c6e0a','c46a203578',15),
 ('c353e07631b3519e9f','d09745340cebd03c6e0a','d0959bbbd3',15),
 ('f1c4e98d4600470d27','d09745340cebd03c6e0a','db2caf5e81',150),
 ('fec021b0c0b6afa489','d09745340cebd03c6e0a','b59dead12b',200),
 ('ddfd1673b4c7b75d88','d09745340cebd03c6e0a','e2f3a23607',2),
 ('f3c3de989b601b24f6','d09745340cebd03c6e0a','ecdc6ce1c8',1),
 ('bc0bf40d3955776fa0','d09745340cebd03c6e0a','b32e500291',1),
 ('aa16c8cc5b185fdea1','ab7adb97a1f89a92527a','fd5330f23a',25),
 ('d4a4bb9c9d625a4603','ab7adb97a1f89a92527a','a7e845cfc4',250),
 ('1c519a421b23f7810b','ab7adb97a1f89a92527a','d2197d2019',250),
 ('cbf7947a23309d4df9','ab7adb97a1f89a92527a','c46a203578',25),
 ('bff5246b541e6a5e98','ab7adb97a1f89a92527a','d0959bbbd3',25),
 ('b8bdf533aabe38e607','ab7adb97a1f89a92527a','db2caf5e81',250),
 ('ba60914d95ca2660f0','ab7adb97a1f89a92527a','b59dead12b',250),
 ('a913ce5abe90365205','ab7adb97a1f89a92527a','e2f3a23607',2),
 ('0eb51dc25bda88e984','ab7adb97a1f89a92527a','ecdc6ce1c8',1),
 ('68130e591cb311f0e9','ab7adb97a1f89a92527a','b32e500291',1),
 ('664b18f1201a338f89','bfcd68043040f450b8e7','fd5330f23a',30),
 ('428c4ccea583e5d77c','bfcd68043040f450b8e7','a7e845cfc4',300),
 ('dc30c0af2f26d74921','bfcd68043040f450b8e7','d2197d2019',300),
 ('d572ced7ad5e7f3343','bfcd68043040f450b8e7','c46a203578',30),
 ('cdab10556e033f4fac','bfcd68043040f450b8e7','d0959bbbd3',30),
 ('0f63244d7a1c4ea411','bfcd68043040f450b8e7','db2caf5e81',300),
 ('4c7d682c08285184a3','bfcd68043040f450b8e7','b59dead12b',300),
 ('e161a32edb4547d400','bfcd68043040f450b8e7','e2f3a23607',2),
 ('b62e2d71899255e85b','bfcd68043040f450b8e7','ecdc6ce1c8',1),
 ('2e80ed2827b19478d5','bfcd68043040f450b8e7','b32e500291',1);
INSERT INTO "packageitems" ("packageitemid","itemdesc","qtyavailable") VALUES ('fd5330f23a','round table cloth ( color of your choice)',145),
 ('a7e845cfc4','charge plate ',2000),
 ('d2197d2019','Napkins (color of your choice )',700),
 ('c46a203578','centerpieces',90),
 ('d0959bbbd3','flower balls or candles holders',105),
 ('b59dead12b','silverware (knife,spoons, and fork)',1500),
 ('e2f3a23607','Throne Chairs ',85),
 ('ecdc6ce1c8','Stage Decor',20),
 ('b32e500291','up lighting',35),
 ('db2caf5e81','champagne glasses',1250);
COMMIT;
