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
CREATE TABLE dbo.usuario
	(
	id_usuario int NOT NULL IDENTITY (1, 1),
	tipo_documento int NOT NULL,
	documento_identidad int NOT NULL,
	nombres varchar(250) NOT NULL,
	apellido_paterno varchar(250) NOT NULL,
	apellido_materno varchar(250) NULL,
	genero int NOT NULL,
	pais varchar(250) NOT NULL,
	departamento varchar(250) NOT NULL,
	provincia varchar(250) NOT NULL,
	distrito varchar(250) NOT NULL,
	direccion varchar(250) NOT NULL,
	fecha_nacimiento date NOT NULL,
	telefono_movil int NOT NULL,
	telefono_fijo int NOT NULL,
	email varchar(250) NOT NULL,
	email2 varchar(250) NOT NULL,
	estatus int NULL,
	usuario varchar(250) NOT NULL,
	clave varchar(250) NOT NULL
	)  ON [PRIMARY]
GO
ALTER TABLE dbo.usuario ADD CONSTRAINT
	PK_usuario PRIMARY KEY CLUSTERED 
	(
	id_usuario
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

GO
ALTER TABLE dbo.usuario SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
