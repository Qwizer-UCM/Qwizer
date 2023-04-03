python manage.py migrate --no-input && \
    python startup.py && \
    python manage.py collectstatic --no-input && \
    gunicorn -b 0.0.0.0:8000 qwizer_be.wsgi