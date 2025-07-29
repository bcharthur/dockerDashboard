import docker

client = docker.DockerClient(base_url='tcp://localhost:2375')

for container in client.containers.list(all=True):  # all=True pour tous les conteneurs, même stoppés
    print(container.name)
