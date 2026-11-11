CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"fullName" varchar(555) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"level" varchar(255) NOT NULL,
	"department" varchar(255) NOT NULL,
	"phoneNumber" varchar(255) NOT NULL
);
