CREATE TABLE MURAL_INFO
(ID int(50) not null auto_increment primary key,
NAME varchar2(100),
AUTHOR_NAME varchar2(100),
LOCATION varchar2(255),
XML_URL varchar2(2083) not null,
LAT float not null,
LONG float not null,
