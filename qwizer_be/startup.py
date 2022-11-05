from pathlib import Path
import os
import environ

import django
from django.db import IntegrityError
from django.contrib.auth import get_user_model

env = environ.Env()
BASE_DIR = Path(__file__).resolve().parent.parent
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# pylint: disable=invalid-name
def color(text):
    return f"\033[37;41m{text}\033[0m"

print("****CREATING SUPER USER****")
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qwizer_be.settings')
    django.setup()

    User = get_user_model()
    #User.objects.all(is_superuser=True).delete() // TODO cascada al borrar usuario?

    a = User.objects.create_superuser(
        env.str("ROOT_EMAIL", "root@root.com"),
        env.str("ROOT_FIRSTNAME", "root"),
        env.str("ROOT_LASTNAME", "root"),
        env.str("ROOT_PASSWORD", "root"),
    )
except IntegrityError:
    print(color(f"SuperUser with username {env.str('ROOT_EMAIL','root@root.com')} already exists!"))
    print(color("Skipping SuperUser creation..."))
except Exception as e:
    print(e)

print("****SUPER USER CREATED****")
