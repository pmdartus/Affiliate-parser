#!/bin/bash

# Time measurement
start=$(date +%s)

cd /tmp

echo "::::::::::::: GIT :::::::::::::"
apt-get install -y -q git

echo "::::::::::::: ZSH :::::::::::::"
# Install zsh
apt-get install -y -q zsh

# Clone oh-my-zsh
if [ ! -d ~vagrant/.oh-my-zsh ]; then
  git clone https://github.com/robbyrussell/oh-my-zsh.git ~vagrant/.oh-my-zsh
fi

# Create a new zsh configuration from the provided template
cp ~vagrant/.oh-my-zsh/templates/zshrc.zsh-template ~vagrant/.zshrc

# Customize theme
sed -i -e 's/ZSH_THEME=".*"/ZSH_THEME="bira"/' ~vagrant/.zshrc

# add aliases
sed -i -e 's/# Example aliases/source ~\/.bash_aliases/gi' ~vagrant/.zshrc

# Set zsh as default shell
chsh -s /bin/zsh vagrant

chown -R vagrant:vagrant ~vagrant/.oh-my-zsh

echo "::::::::::::: REDIS :::::::::::::"
apt-get install -y redis-server

echo "::::::::::::: NODEJS :::::::::::::"
apt-get install -y gcc make python g++ build-essential nodejs nodejs-legacy

echo "::::::::::::: MONGO DB :::::::::::::"
apt-get install -y mongodb
mkdir -p /data/db
chmod 0755 /data/db
chown mongod:mongod /data/db

stop mongodb
start mongodb

echo "::::::::::::: NPM :::::::::::::"
apt-get install -y npm
# Upgrade npm to latest and prevent self-signed certificate error
npm config set ca ""
npm install -g npm
# Used to run things indefinitely restarting as needed
npm install -g forever
# Make sure everyone can actually run forever. Latest npm makes the bin
# scripts executable but not readable which does not make sense
chmod -R a+r /usr/lib/node_modules/



echo "::::::::::::: ALIASES :::::::::::::"

echo "
cd /vagrant" >> /home/vagrant/.zshrc

echo "::::::::::::: PACKAGES :::::::::::::"

cd "/vagrant"
npm install --no-bin-links

echo ":::::::::::::::::::::::::::::::::::::::::"

echo "Launch Mongo Deamon"
mkdir /vagrant/logs/
mongod --fork --logpath /vagrant/logs/mongo.log

# Time measurement
end=$(date +%s)

diff=$(( $end - $start ))

echo ":::::::::::::::::::::::::::::::::"
echo "::: Elapsed Time: $diff seconds!!"
echo ":::::::::::::::::::::::::::::::::"
