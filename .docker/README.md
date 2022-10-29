# Qwizer & Docker Compose

## Empezando

1. Arranca los servicios `front`, `back` y `db` en segundo plano (`flag -d o  --detach`):

    ```bash
    docker compose up -d
    ```

2. Web de Qwizer en <http://localhost:3000>.
3. Panel de administracion de django en <http://localhost:8000>.

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