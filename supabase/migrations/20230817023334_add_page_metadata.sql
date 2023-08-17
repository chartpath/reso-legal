ALTER TABLE "public"."nods_page" ADD COLUMN IF NOT EXISTS author text;
ALTER TABLE "public"."nods_page" ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE "public"."nods_page" ADD COLUMN IF NOT EXISTS url text;

UPDATE "public"."nods_page" SET author = 'Government of New Brunswick', title = 'Landlord responsibilities', url = 'https://www2.gnb.ca/content/gnb/en/corporate/promo/renting-in-new-brunswick/landlord-rights-and-responsibilities/landlord-responsibilities.html' WHERE id = 1;
UPDATE "public"."nods_page" SET author = 'Government of New Brunswick', title = 'Renting: no discrimination allowed', url = 'https://www2.gnb.ca/content/gnb/en/corporate/promo/renting-in-new-brunswick/landlord-rights-and-responsibilities/renting-no-discrimination.html' WHERE id = 2;
UPDATE "public"."nods_page" SET author = 'Government of New Brunswick', title = 'Tenant rights', url = 'https://www2.gnb.ca/content/gnb/en/corporate/promo/renting-in-new-brunswick/tenant-rights-and-responsibilities/tenant-rights.html' WHERE id = 3;
UPDATE "public"."nods_page" SET author = 'NB Courts', title = 'Provincial Court', url = 'https://www.courtsnb-coursnb.ca/content/cour/en/provincial.html' WHERE id = 4;
UPDATE "public"."nods_page" SET author = 'New Brunswick Coalition for Tenants Rights', title = 'About The Residential Tenancies Tribunal', url = 'https://www.nbtenants.ca/en/residential-tenancies-tribunal-explained' WHERE id = 5;
UPDATE "public"."nods_page" SET author = 'SNB 1982', title = 'Employment Standards Act', url = 'https://www.canlii.org/en/nb/laws/stat/snb-1982-c-e-7.2/latest/snb-1982-c-e-7.2.html' WHERE id = 6;
UPDATE "public"."nods_page" SET author = 'RSNB 2011', title = 'Human Rights Act', url = 'https://www.canlii.org/en/nb/laws/stat/rsnb-2011-c-171/latest/rsnb-2011-c-171.html' WHERE id = 7;
UPDATE "public"."nods_page" SET author = 'SNB 1975', title = 'Residential Tenancies Act', url = 'https://www.canlii.org/en/nb/laws/stat/snb-1975-c-r-10.2/latest/snb-1975-c-r-10.2.html' WHERE id = 8;
UPDATE "public"."nods_page" SET author = 'NB Courts', title = 'Frequently Asked Questions', url = 'https://www.courtsnb-coursnb.ca/content/cour/en/provincial/content/faq.html' WHERE id = 9;
UPDATE "public"."nods_page" SET author = 'RSNB 1973', title = 'Industrial Relations Act', url = 'https://www.canlii.org/en/nb/laws/stat/rsnb-1973-c-i-4/latest/rsnb-1973-c-i-4.html' WHERE id = 10;
