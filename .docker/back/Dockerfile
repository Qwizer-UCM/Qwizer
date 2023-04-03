FROM python:3.11.2

RUN pip install --upgrade pip
RUN pip install poetry

# Important or django will get stuck :)
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY ./qwizer_be/pyproject.toml ./qwizer_be/poetry.lock ./
RUN poetry config virtualenvs.create false \
  && poetry install --no-interaction --no-ansi

COPY ./qwizer_be/.env ./.env
COPY ./qwizer_be ./

COPY ./qwizer_be/start.sh ./
RUN chmod +x ./start.sh 