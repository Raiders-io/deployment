.PHONY : all clean fclean re debug debug-print
NO_DIR = --no-print-directory
MAKE := $(MAKE) $(NO_DIR)
# MAKE := $(MAKE) -j $(NO_DIR)
NAME = ft_transcendance

USER = $(shell whoami)


all:
	@$(MAKE) $(NAME)

$(NAME):
	docker compose -f srcs/compose.yml up -d --build --force-recreate --remove-orphans

build-all:
	docker network create public-network || true
	@$(MAKE) $(NAME)
	@$(MAKE) build-ObjectStorage
# 	@$(MAKE) build-Backend-Lesson

build-ObjectStorage:
	cd ../ObjectStorage && docker compose -f compose.yml up -d --build --force-recreate --remove-orphans

build-Backend-Lesson:
	cd ../Backend-Lesson && docker compose -f docker-compose.yml up -d --build --force-recreate --remove-orphans

env:
	@cd srcs/ && cp .env.example .env
	@echo "Please edit the .env file with your own values, use README.md as a reference."

up:
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


stop-all:
	docker stop $(shell docker ps -q)

clean:
clean-all:
	docker system prune --all -f

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
