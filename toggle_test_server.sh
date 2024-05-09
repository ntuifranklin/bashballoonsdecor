#!/bin/bash
# Starts or Stops development server on port given port
# first argument $1 should be the word action: "start" or "stop"
# econd argument the port number

action=$1
port=$2
start="start"
stop="stop"
# run this if allow or deny was the action passed
if [[ "$action" == "$start" ||  "$action" == "$stop" ]] ; then 

kill -9 $(lsof -t -i:$port)
if [[ "$action" == "$start" ]] ; then
	sudo ufw allow $port
	npm run dev &
else
	sudo ufw deny $port;
	kill -9 $(lsof -t -i:$port)
fi
else
	echo "Usage: $0 <start|stop> <port_number>";
	#echo "action: $action, port=$port"
fi

