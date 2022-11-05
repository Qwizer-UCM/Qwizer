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

# ENTRYPOINT ["python", "manage.py"]
# CMD ["runserver", "0.0.0.0:8000"]
CMD python manage.py migrate --no-input && \
    python startup.py && \
    python manage.py collectstatic --no-input && \
    gunicorn -b 0.0.0.0:8000 qwizer_be.wsgi
    #python manage.py runserver 0.0.0.0:8000