.PHONY : all clean fclean re debug debug-print
NO_DIR = --no-print-directory
MAKE := $(MAKE) $(NO_DIR)
# MAKE := $(MAKE) -j $(NO_DIR)
NAME = ft_transcendance

USER = $(shell whoami)
REMOTE = $(shell whoami)@127.0.0.1
SSH_PORT = 2200
SERVICES_NAMES = mariadb nginx wordpress
VOLUMES_NAMES = db web
MOUNT_PATH = /home/$(USER)/data/

all:
	@$(MAKE) $(NAME)

$(NAME):
	$(NAME_CMD)

up:
	$(UP_CMD)

ls: list
list:
	docker ps

save:
	$(RSYNC_CMD)

ssh:
	$(SSH_CMD)

stop:
	docker stop $(SERVICES_NAMES)

stop-all:
	docker stop $(shell docker ps -q)

clean:
clean-all:
	docker system prune --all -f

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

# Special Variable testing to adapt commands if on Alpine VM or not
HOST := $(shell hostname)
ifeq ($(HOST),alpine) #on REMOTE

RSYNC_CMD = @echo "Already on Alpine, please only use HOST"
SSH_CMD = @echo "Already on Alpine, please use HOST to work"
NAME_CMD = \
	@mkdir -p /home/$(USER)/data/db /home/$(USER)/data/web && \
	docker compose -f srcs/compose.yml up -d --build --force-recreate --remove-orphans
UP_CMD = \
	@mkdir -p /home/$(USER)/data/db /home/$(USER)/data/web /home/$(USER)/data/static && \
	docker compose -f srcs/compose.yml up -d
RM_VOLUMES = \
	@read -p "Êtes-vous sûr de vouloir supprimer $(MOUNT_PATH) ? [y/N] " confirm && \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		doas rm -rf $(MOUNT_PATH) && \
		echo "Dossier supprimé" || \
		echo "Erreur lors de la suppression"; \
	else \
		echo "Annulé"; \
	fi

else #on HOST

RSYNC_CMD = @echo "Sending all over SSH"; rsync -r --copy-links -e 'ssh -p $(SSH_PORT)' $(shell pwd)/ $(REMOTE):~/ft_transcendance
SSH_CMD = @ssh -XC -t -p $(SSH_PORT) $(REMOTE) "cd ~/ft_transcendance && sh --login"
NAME_CMD = @echo "$(NAME) Should be executed on Alpine VM only"
UP_CMD = @echo "up Should be executed on Alpine VM only"
RM_VOLUMES = @echo "rm-volumes Should be executed on Alpine VM only"

start-vm:
	VBoxManage startvm "Alpine" --type headless
stop-vm:
	VBoxManage controlvm "Alpine" acpipowerbutton
pull-vm:
	rsync -r ~/sgoinfre/Alpine ~/goinfre/ --progress
push-vm:
	rsync -r ~/goinfre/Alpine ~/sgoinfre/ --progress
endif
