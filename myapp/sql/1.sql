/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.proyectos
	(
	id_proyecto int NOT NULL IDENTITY (1, 1),
	id_usuario int NULL,
	fecha_creacion date NOT NULL,
	titulo text NULL,
	palabras_clave text NULL,
	area_innovacion_area text NULL,
	area_innovacion_subarea text NULL,
	area_innovacion_tematica text NULL,
	aplicacion_area text NULL,
	aplicacion_subarea text NULL,
	localizacion_departamento text NULL,
	localizacion_provincia text NULL,
	localizacion_distrito text NULL,
	localizacion_ubigeo int NULL,
    a22_1_1 Text NULL,
    a22_2_1 Text NULL,
    a22_3_1 Text NULL,
    a22_4_1 Text NULL,
    a22_5_1 Text NULL,
    a22_1_2 Text NULL,
    a22_2_2 Text NULL,
    a22_3_2 Text NULL,
    a22_4_2 Text NULL,
    a22_5_2 Text NULL,
    a22_1_3 Text NULL,
    a22_2_3 Text NULL,
    a22_3_3 Text NULL,
    a22_4_3 Text NULL,
    a22_5_3 Text NULL,
    a31_1_1 Text NULL,
    a31_2_1 Text NULL,
    a31_1_2 Text NULL,
    a31_2_2 Text NULL,
    a31_1_3 Text NULL,
    a31_2_3 Text NULL,
    a32_1_1 Text NULL,
    a32_2_1 Text NULL,
    a32_1_2 Text NULL,
    a32_2_2 Text NULL,
    a32_1_3 Text NULL,
    a32_2_3 Text NULL,
    a33_1_1 Text NULL,
    a33_2_1 Text NULL,
    a33_1_2 Text NULL,
    a33_2_2 Text NULL,
    a33_1_3 Text NULL,
    a33_2_3 Text NULL,
    a34_1_1 Text NULL,
    a34_2_1 Text NULL,
    a34_3_1 Text NULL,
    a34_4_1 Date NULL,
    a34_5_1 Date NULL,
    a34_1_2 Text NULL,
    a34_2_2 Text NULL,
    a34_3_2 Text NULL,
    a34_4_2 Date NULL,
    a34_5_2 Date NULL,
    a34_1_3 Text NULL,
    a34_2_3 Text NULL,
    a34_3_3 Text NULL,
    a34_4_3 Date NULL,
    a34_5_3 Date NULL,
    a35_1_1 Text NULL,
    a35_2_1 Text NULL,
    a35_3_1 Text NULL,
    a35_4_1 Date NULL,
    a35_5_1 Date NULL,
    a35_6_1 Text NULL,
    a35_7_1 Text NULL,
    a35_1_2 Text NULL,
    a35_2_2 Text NULL,
    a35_3_2 Text NULL,
    a35_4_2 Date NULL,
    a35_5_2 Date NULL,
    a35_6_2 Text NULL,
    a35_7_2 Text NULL,
    a35_1_3 Text NULL,
    a35_2_3 Text NULL,
    a35_3_3 Text NULL,
    a35_4_3 Date NULL,
    a35_5_3 Date NULL,
    a35_6_3 Text NULL,
    a35_7_3 Text NULL,
	duracion_proyecto int NULL,
	fecha_estimada_inicio date NULL,
	cgp_tipo_documento int NULL,
	cgp_nro_documento int NULL,
	cgp_ruc int NULL,
	cgp_nombre text NULL,
	cgp_fecha_nac date NULL,
	cgp_sexo int NULL,
	cgp_email text NULL,
	cgp_telefono int NULL,
	cgp_celular int NULL,
	cap_tipo_documento int NULL,
	cap_nro_documento int NULL,
	cap_ruc int NULL,
	cap_nombre text NULL,
	cap_fecha_nac date NULL,
	cap_sexo int NULL,
	cap_email text NULL,
	cap_telefono int NULL,
	cap_celular int NULL,
	es_tipo int NULL,
	es_tamano text NULL,
	es_nro_trabajadores int NULL,
	es_ruc text NULL,
	es_ciiu text NULL,
	es_direccion text NULL,
	es_fecha_constitucion date NULL,
	es_inicio_actividades date NULL,
	es_nro_partida text NULL,
	es_oficina_registral text NULL,
	es_telefono text NULL,
	es_correo text NULL,
	es_pagina_web text NULL,
	es_ventas2016 int NULL,
	es_ventas2017 int NULL,
	rl_tipo_documento int NULL,
	rl_nro_documento int NULL,
	rl_ruc int NULL,
	rl_nombre text NULL,
	rl_sexo int NULL,
	rl_email text NULL,
	rl_telefono int NULL,
	rl_productos_comercializados text NULL,
	rl_actividades_relacionadas text NULL,
	rl_infraestructura_es text NULL,
	enviado int NOT NULL
	)  ON [PRIMARY]
	 TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE dbo.proyectos ADD CONSTRAINT
	DF_proyectos_fecha_creacion DEFAULT (getdate()) FOR fecha_creacion
GO
ALTER TABLE dbo.proyectos ADD CONSTRAINT
	DF_proyectos_enviado DEFAULT ((0)) FOR enviado
GO
ALTER TABLE dbo.proyectos ADD CONSTRAINT
	PK_proyecto PRIMARY KEY CLUSTERED 
	(
	id_proyecto
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.proyectos SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
