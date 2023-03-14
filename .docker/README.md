# Qwizer & Docker Compose

## Empezando

1. Arranca los servicios `front`, `back` y `db` en segundo plano (`flag -d o  --detach`):

    ```bash
    docker compose up -d
    ```

2. Web de Qwizer en <https://localhost>.
3. Panel de administracion de django en <https://localhost/admin>.

    ```plaintext
    Usuario: root@root.com
    Contraseña: root
    ```

    <sub>* Usuario por defecto si no se cambia el env</sub>

### Comandos útiles

- `docker compose exec {service} /bin/bash`: Shell bash de un servicio para ejecutar comandos dentro del contenedor.
- `docker compose logs`: Ver todos los logs.
- `docker compose logs {service}`: Ver los logs de un servicio en particular, p. ej. `front`.

## Otros comandos

- Parar y eliminar los contenedores

  ```bash
  docker compose down
  ```

  - `--rmi all`: elimina las imagenes
  - `-v`: elimina los volumenes
