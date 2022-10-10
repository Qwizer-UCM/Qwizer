# Dockerfile

# The first instruction is what image we want to base our container on
# We Use an official Python runtime as a parent image
FROM python:3.10.7

# Important or django will get stuck :)
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install pipenv

# Allows docker to cache installed dependencies between builds
# https://docs.docker.com/build/building/cache/
COPY Pipfile Pipfile.lock ./

# Docker is already a self contained app maybe its better to use requirements
# instead of using pipenv inside a container

# RUN pip install pipenv  \
#     && pipenv requirements > requirements.txt \
#     && pip install -r requirements.txt
RUN pipenv install --dev

# Mounts the application code to the image
COPY . ./

# runs the production server
ENTRYPOINT ["pipenv","run", "python", "manage.py"]
CMD ["runserver", "0.0.0.0:8000"]