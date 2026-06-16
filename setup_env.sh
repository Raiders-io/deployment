#!/bin/bash

create_env()
{
	cd srcs/
	if [ -f .env ]; then
		echo ".env file already exists. Do you want to overwrite it?"
		read -p "Continue? (Y/n): " confirm
		confirm=${confirm:-y} # Default to 'y' if no input is provided
		if ! [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
			echo "Setup cancelled."
			exit 1
		fi
	fi

	cp .env.example .env
	echo "Please replace the placeholder values in the .env file with your actual configuration."
	cd -
}

configure_nginx()
{
	cd srcs
	export $(grep OPENSSL_SUBJ .env)
	export $(grep URL .env)
	cd nginx/
	chmod +x ./generate_certs.sh
	chmod +x ./set_server_name.sh
	./generate_certs.sh
	./set_server_name.sh
}

create_env
configure_nginx

echo "Environment setup complete. Please review the .env file and make any necessary adjustments."
