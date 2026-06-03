.PHONY : all clean fclean re debug debug-print
NO_DIR = --no-print-directory
MAKE := $(MAKE) $(NO_DIR)
# MAKE := $(MAKE) -j $(NO_DIR)
NAME = ft_transcendance

USER = $(shell whoami)
REMOTE = $(shell whoami)@127.0.0.1
SSH_PORT = 2200
SERVICES_NAMES = nginx nodejs #grafana prometheus
VOLUMES_NAMES = db web
MOUNT_PATH = /home/$(USER)/goinfre/data

all:
	@$(MAKE) $(NAME)

$(NAME):
	@$(MAKE) create-volumes
	docker compose -f srcs/compose.yml up -d --build --force-recreate --remove-orphans

build-all:
	docker network create public-network || true
	cd srcs/ObjectStorage && docker compose -f compose.yml up -d --build --force-recreate --remove-orphans
	cd srcs/Backend-Lesson && docker compose -f docker-compose.yml up -d --build --force-recreate --remove-orphans

up:
	@$(MAKE) create-volumes
	docker compose -f srcs/compose.yml up -d

down:
	docker compose -f srcs/compose.yml down

ls: list
list:
	docker ps

status:
	docker ps

status-all:
	docker ps -a

stop:
	docker stop $(SERVICES_NAMES)

stop-all:
	docker stop $(shell docker ps -q)

clean:
clean-all:
	docker system prune --all -f

create-volumes:
	@mkdir -p $(MOUNT_PATH)/prometheus $(MOUNT_PATH)/grafana

rm-volumes:
	$(RM_VOLUMES)

clean-volumes:
	docker volume rm $(VOLUMES_NAMES)

clean-all-volumes:
	docker volume rm $(shell docker volume ls -q)

reset:
	@$(MAKE) stop-all || true
	@$(MAKE) clean-all  || true
	@$(MAKE) clean-all-volumes || true
	@$(MAKE) rm-volumes

fclean:
	@$(MAKE) clean-all

re:
	@$(MAKE) fclean
	@$(MAKE) all

debug-print:
	@ls -Al -R --color=auto --ignore=.git

RM_VOLUMES = \
	@read -p "Êtes-vous sûr de vouloir supprimer $(MOUNT_PATH) ? [y/N] " confirm && \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		rm -rf $(MOUNT_PATH) && \
		echo "Dossier supprimé" || \
		echo "Erreur lors de la suppression"; \
	else \
		echo "Annulé"; \
	fi
