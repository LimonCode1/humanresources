CREATE database Gestion_Humana;
use Gestion_Humana;

create table Fincas
(
    id_finca int(11) not null
    auto_increment,
	nombre varchar
    (30) not null, 
	primary key
    (id_finca)
) ENGINE = InnoDB;
    create table Usuario
    (
        id int(11) not null
        auto_increment,
	cedula varchar
        (15) not null,
    nombre varchar
        (15) not null,
    apellido varchar
        (15) not null,
    username varchar
        (30) not null,
    clave text not null, 
    tipo_usuario enum
        ('Administrador', 'Auxiliar GH', 'Jefe GH'),
    primary key
        (id),
    unique key
        (cedula)
) ENGINE = InnoDB;
        create table Auxiliar
        (
            id int(11) not null
            auto_increment,
    cedula varchar
            (15) not null,
    id_finca int
            (11) not null,
    primary key
            (id),
    constraint fk_id_finca foreign key
            (id_finca)
		references Fincas
            (id_finca),
	constraint fk_cedula foreign key
            (cedula)
		references Usuario
            (cedula)
) ENGINE = InnoDB;
create table empleado(
	id int(11) not null
        auto_increment,
	cedula varchar
        (15) not null,
    nombre varchar
        (15) not null,
    apellido_1 varchar
        (15) not null,
	apellido_2 varchar (15),
    direccion varchar(30),
    telefono varchar(10) not null,
    cargo enum
        ('Analista Contable', 'Analista Financiero', 'Analista de Soporte','Desarrollador', 'Inspector de HSEQ', 'Operario'),
	id_creador int(11) not null,
    estado enum('Activo', 'Retirado'),
    primary key (id),
    unique key (cedula),
    constraint fk_creador foreign key (id_creador) references usuario (id)
) ENGINE = InnoDB;
create table liquidacion(
	id int not null auto_increment,
    cedula_empleado varchar(15) not null,
    fecha_inicial date not null,
    fecha_final date not null,
    fecha_liquidacion date not null,
    salario_basico int(8) not null,
    dias_liquidados int(2) not null,
    horas_ex_diurnas int(3) not null,
    horas_ex_nocturnas int(3) not null,
    horas_ex_dom_fes int(3) not null,
    horas_nocturnas int(3) not null,
    horas_dom_fes int(3) not null,
    neto_pagado int(8) not null,
    liquidador_id int(11) not null,
    primary key(id),
    unique key(cedula_empleado),
    constraint fk_cedula_emp foreign key (cedula_empleado) references empleado (cedula),
    constraint fk_liquidador foreign key (liquidador_id) references usuario (id)
)ENGINE = InnoDB;
select * from empleado as e inner join liquidacion as l on e.cedula = l.cedula_empleado;
select * from liquidacion;
delete from empleado where id = 3;
insert into liquidacion values(2, '1001168678', '2020/10/10', '2020/10/29', '2020/10/3', 25000, 30, 2, 2, 2, 2, 3, 30000, 1);
