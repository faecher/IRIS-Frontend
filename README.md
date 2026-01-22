<div align="center">
  <img src="./public/logos/IRIS Wide.svg">
</div>

<br> 

The **I**nformation **R**elay & **I**ntegration **S**ystem (IRIS) collects GPS tracking data of multiple trackers to display on a map or in [Mission Control Paramedic (MCP)](https://www.mission-control-paramedic.de/). Just like the equally named Greek messenger goddess, IRIS helps you move data between systems and stay on top of what counts - your teams and saving the world!

The [IRIS-Server](https://github.com/faecher/IRIS-Server) provides and relays the data, whereas [IRIS-Frontend](https://github.com/faecher/IRIS-Frontend) offers the possibility to configure the server and view current locations.

## Features
- Readout of LoRaWAN GPS trackers
- Assign trackers to teams
- Battery overview of all connected trackers
- Monitor your team location in real-time

#### Coming Soon<sup>TM</sup>
- Data relay to MCP
- Readout of TETRA Digitalfunk GPS data 


#### Supported Devices
- [< tracker modell hier >](https://todo.com)


## Quick Start
1. Install [Docker](https://www.docker.com/) or [Podman](https://podman.io/)
2. Copy the docker-compose.yml to your machine:
	```sh
	wget https://raw.githubusercontent.com/faecher/IRIS-Frontend/refs/heads/main/docker-compose.yml
	```
3. Run with Docker / Podman:
	```sh
	docker compose up -d
	# or
	podman compose up -d
	```
4. Magic (Your server should be up and running. As soon as this actually works this easily, this note should be removed and replaced with how to access the UI... TODO)