.PHONY : all clean fclean re debug debug-print
NO_DIR = --no-print-directory
MAKE := $(MAKE) $(NO_DIR)
# MAKE := $(MAKE) -j $(NO_DIR)
NAME = ft_transcendance

USER = $(shell whoami)


all:
	@$(MAKE) $(NAME)

$(NAME):
	@$(MAKE) network
	docker compose -f srcs/compose.yml up -d --build --force-recreate --remove-orphans

build-all:
	@$(MAKE) $(NAME)
	@$(MAKE) build-ObjectStorage
	@$(MAKE) build-Backend-Auth-Service
	@$(MAKE) build-Backend-Messaging-Service
# 	@$(MAKE) launch-Frontend
# 	@$(MAKE) build-Backend-Lesson

build-ObjectStorage:
	cd ../ObjectStorage && $(MAKE) all

build-Backend-Lesson:
	cd ../Backend-Lesson && docker compose -f docker-compose.yml up -d --build --force-recreate --remove-orphans

build-Backend-Auth-Service:
	cd ../Backend_Auth-Service && docker compose -f compose.yml up -d --build --force-recreate --remove-orphans

build-Backend-Messaging-Service:
	cd ../Backend-Messaging-Service && docker compose -f compose.yml up -d --build --force-recreate --remove-orphans

launch-Frontend:
	cd ../Frontend && npm run dev

env:
	@chmod +x ./setup_env.sh
	@./setup_env.sh

network:
	docker network create public-network || true
	docker network create --internal api-network || true

up:
	docker compose -f srcs/compose.yml up -d
	
down:
	docker compose -f srcs/compose.yml down -v

monitoring:
	cd srcs/nginx/ && ./use_monitoring.sh yes

no-monitoring:
	cd srcs/nginx/ && ./use_monitoring.sh no

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
