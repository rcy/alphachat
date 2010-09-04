node_url=http://nodejs.org/dist
node_dir=node-v0.1.104
node_tarball=$(node_dir).tar.gz

runbot:
	./$(node_dir)/node bot.js

nodebuild: $(node_dir)
	cd $< && ./configure && make

$(node_dir): $(node_tarball)
	tar -xzf $(node_tarball)

$(node_tarball):
	wget $(node_url)/$(node_tarball)
