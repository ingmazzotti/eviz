# --- !Ups

create table flows (
	id_flow int primary key,
	description varchar
);
create table events (
	id_event int primary key,
	fromdate bigint,
	todate bigint,
	summary varchar,
	description varchar,
	longitude float,
	latitude float,
	id_flow int references flows(id_flow)
);
create table clicks (
	id_user varchar,
	id_event int references events(id_event),
	id_flow int references flows(id_flow)
);
insert into flows (id_flow, description) values (1, 'Comune di Ravenna');
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (1,20140301,20140301,'Mostra','Mostra',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (2,20140301,20140304,'Partita','Partita',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (3,20140302,20140305,'Flashmob','Flashmob',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (4,20140303,20140328,'Esposizione','Esposizione',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (5,20140304,20140305,'Degustazioni','Degustazioni',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (6,20140315,20140316,'Cinema','Cinema',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (7,20140316,20140317,'Festival','Festival',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (8,20140329,20140329,'Festa in piazza','Festa in piazza',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (9,20140329,20140410,'Summit','Summit',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (10,20140401,20140402,'Workshop','Workshop',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (11,20140405,20140408,'Hackaton','Hackaton',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (12,20140408,20140408,'Premiazione','Premiazione',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (13,20140415,20140415,'Mangiatona','Mangiatona',44.4220,12.1893,1);
insert into events(id_event, fromdate, todate, summary, description, longitude,latitude,id_flow) 
values (14,20140416,20140425,'Cenone','Cenone',44.4220,12.1893,1);

