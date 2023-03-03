FROM python:3.10.7

RUN pip install --upgrade pip
RUN pip install pipenv
# Important or django will get stuck :)
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY ./qwizer_be/Pipfile ./qwizer_be/Pipfile.lock ./
RUN pipenv install --system

COPY ./qwizer_be/.env ./.env
COPY ./qwizer_be ./

COPY ./qwizer_be/start.sh ./
RUN chmod +x ./start.sh 