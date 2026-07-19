-- Habilita el rol ya soportado por la aplicación y lo asigna al administrador demo.
INSERT INTO rol (nombre, descripcion, activo, creado_por)
VALUES ('ADMINISTRADOR', 'Administrador funcional del SGPP con acceso administrativo global', TRUE, 'SYSTEM')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol, asignado_por)
SELECT u.id, r.id, 'SYSTEM'
FROM usuario u
JOIN rol r ON r.nombre = 'ADMINISTRADOR'
WHERE u.username = 'adminsys1'
ON CONFLICT (id_usuario, id_rol) DO NOTHING;
