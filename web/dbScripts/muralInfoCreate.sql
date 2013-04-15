CREATE TABLE MURAL_INFO
(ID int not null auto_increment primary key,
NAME varchar(100),
DATE DATETIME,
AUTHOR_NAME varchar(100),
LOCATION varchar(255),
XML_URL varchar(2083) not null,
LATITUDE float not null,
LONGITUDE float not null,
X_SIZE int not null,
Y_SIZE int not null,
Z_SIZE int not null);
