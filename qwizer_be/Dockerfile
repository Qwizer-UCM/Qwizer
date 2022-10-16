FROM python:3.10.7

RUN apk add git
RUN pip install pipenv
# Important or django will get stuck :)
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY ./qwizer_be ./qwizer_be

# Comentar si se quiere usar codigo local
# COPY ./.git ./.git
# RUN git checkout -f 5402ac1d31eba657c7c71f58e9c954d4cff736e8

COPY ./qwizer_be/Pipfile ./qwizer_be/Pipfile.lock ./qwizer_be/
RUN pipenv install --dev

COPY ./qwizer_be/.env ./qwizer_be/.env

ENTRYPOINT ["pipenv","run", "python", "manage.py"]
CMD ["runserver", "0.0.0.0:8000"]