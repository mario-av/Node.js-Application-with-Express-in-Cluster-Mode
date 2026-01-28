# 1. Vagrantfile - Node.js Cluster Practice
# 2. Date: January 2026

Vagrant.configure("2") do |config|

  # 3. Base OS Image
  # NOTE: "ubuntu/lunar64" is deprecated. 
  # Using "ubuntu/jammy64" (22.04 LTS) as a stable alternative.
  config.vm.box = "ubuntu/jammy64"

  # 4. Hostname configuration
  config.vm.hostname = "cluster-nodejs"

  # 5. Private Network with static IP
  config.vm.network "private_network", ip: "192.168.56.120"

  # 6. Port Forwarding for Nginx
  config.vm.network "forwarded_port", guest: 80, host: 8080

  # 7. Port Forwarding for Node App
  config.vm.network "forwarded_port", guest: 3000, host: 3000

  # 8. VirtualBox Provider Settings
  config.vm.provider "virtualbox" do |vb|
    vb.name = "Cluster-NodeJS"
    vb.memory = "2048"
    vb.cpus = 2
  end

  # 9. Synced Folder configuration
  config.vm.synced_folder ".", "/vagrant"

  # 10. Provisioning Script path
  config.vm.provision "shell", path: "config/bootstrap.sh"

end
