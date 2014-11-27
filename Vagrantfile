VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "ubuntu/trusty64"
  config.vm.box_check_update = false

  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 2
  end

  config.vm.network :forwarded_port, guest: 3000, host: 3000, host_ip: "127.0.0.1"
  config.vm.network :private_network, ip: '192.168.50.50'

  config.vm.synced_folder '.', '/vagrant', nfs: false

  config.vm.provision "shell", path: "VagrantProvision.sh"

  config.vm.provision "shell", inline: "redis-server > /dev/null &", run: "always"

end
